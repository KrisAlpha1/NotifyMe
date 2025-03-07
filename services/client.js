const { Client, GatewayIntentBits, Events, Partials } = require("discord.js");
require("dotenv").config();
const AddServer = require("../interactions/addServer");
const RegisterToken = require("../interactions/registerToken");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ],
  partials: [Partials.Channel, Partials.GuildMember],
});

client.once(Events.ClientReady, async (connection) => {
  console.log("Client application started!");
});

client.login(process.env.BOT_TOKEN);

client.on(Events.MessageCreate, async (message) => {
  if (!message.author.bot) {
    // message.reply("Hi there");
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    // Handle chat input commands
    if (interaction.commandName === "add-server") {
      await AddServer.handleInteractionReply(interaction);
    }

    if (interaction.commandName === "register-token") {
      await RegisterToken.handleInteractionReply(interaction);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "tokenModal") {
      await RegisterToken.handleInteractionReply(interaction, true);
    }
  }
});

// setTimeout(() => {
//   client.channels.fetch("1347325621591605390").then((channel) => {
//     channel.messages.delete("1347564967196364831");
//   });
// }, 1000);

module.exports = {
  getClient: () => {
    return client;
  },
};
