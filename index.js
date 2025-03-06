const startServer = require("./server");
const { getClient } = require("./services/client");
const SocketService = require("./services/websocket");
const store = require("./store");
const { readFromFile } = require("./utils/files");
const client = getClient();

// Init Sockets for existing users
const initSockets = (async () => {
  const accessData = await readFromFile();
  Object.keys(accessData).forEach((userId) => {
    if (accessData[userId].socket_token) {
      const token = accessData[userId].socket_token;
      client.users.fetch(userId).then((user) => {
        const Socket = new SocketService({ token, user });
        Socket.initListeners();
        // Set socket instance to store
        store.set("sockets", {
          [user.id]: Socket,
        });
      });
    }
  });
})();

startServer();
