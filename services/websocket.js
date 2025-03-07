const WebSocket = require("ws");
const { getUserGuilds } = require("../api");
const { readFromFile } = require("../utils/files");

class SocketService {
  socket = null;
  token = null;
  user = null;
  client = null;
  listeners = {};

  constructor({ token, user }) {
    this.token = token;
    this.user = user;
    this.setupSocket();

    const { getClient } = require("./client");
    this.client = getClient();
  }

  setupSocket() {
    // Instantiate web socket
    this.socket = new WebSocket(
      "wss://gateway.discord.gg/?encoding=json&v=10",
      {
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      }
    );
    // Set class property

    this.openSocket(this.socket);

    this.socket.on("close", (code, reason) => {
      console.log("Socket connection closed:", code, reason);
      this.setupSocket();
    });
  }

  openSocket(socket) {
    // Open socket and send identity
    socket.onopen = (tls) => {
      const identify_payload = {
        op: 2,
        d: {
          token: this.token,
          intents: 512,
          properties: { $os: "windows", $browser: "chrome", $device: "pc" },
        },
      };
      socket.send(JSON.stringify(identify_payload));
      console.log("Socket connection open:");
    };

    this.startMessageListener(socket);
  }

  startMessageListener(socket) {
    // Message type 7 for join server
    // Message type 19 for message user
    socket.onmessage = (message) => {
      this.keepAlive(socket, message);
      const payload = JSON.parse(message.data);
      if (this.listeners[payload.t]) {
        this.listeners[payload.t](payload);
      }
    };
  }

  keepAlive(socket, message) {
    const payload = JSON.parse(message.data);
    const { t, event, op, d } = payload;
    switch (op) {
      // OPCODE 10 GIVES the HEARTBEAT INTERVAL, SO YOU CAN KEEP THE CONNECTION ALIVE
      case 10:
        const { heartbeat_interval } = d;
        setInterval(() => {
          socket.send(JSON.stringify({ op: 1, d: null }));
        }, heartbeat_interval);
        break;
    }
  }

  listen(eventName, callback) {
    this.listeners = {
      ...this.listeners,
      [eventName]: (payload) => {
        callback(payload);
      },
    };
  }

  initListeners() {
    // Listen for MessageCreate
    this.listen("MESSAGE_CREATE", async (payload) => {
      const type = payload?.d.type;
      // Handle Join Guild Event
      if (type == 7) {
        // Type 7 is for join guild event
        this.handleGuildJoin(payload);
      }
    });
    console.log(`Started socket listeners for user : ${this.user.username}`);
  }

  async handleGuildJoin(payload) {
    const client = this.client;
    const author = payload?.d?.author?.username;
    const guildId = payload?.d?.guild_id;
    console.log(author, "joined guild");

    const accessData = await readFromFile();
    const registeredGuilds = accessData[this.user.id].guilds;
    const channelGuild = accessData[this.user.id]?.channel_guild;

    if (registeredGuilds.includes(guildId)) {
      const userGuilds = await getUserGuilds(
        accessData[this.user.id].access_token
      );
      const guildData = userGuilds.filter((g) => g.id == guildId)[0];
      const notificationMessage = `Notification : User ${author} joined the server : ${guildData.name} --<@${this.user.id}>`;
      if (channelGuild) {
        // Will finish later
        // client.guilds.fetch(channelGuild).then((guild) => {
        //   const channels = guild.channels.values();
        //   console.log(channels);
        // });
      } else {
        client.users.fetch(this.user.id).then((user) => {
          user.send(notificationMessage);
        });
      }
    }
  }
}

// if (t == "MESSAGE_CREATE") {
//     const type = d.type;
//     if (type == 7) {
//       const author = d.author.username;
//       const guildId = d.guildId;
//     }
//   }

module.exports = SocketService;
