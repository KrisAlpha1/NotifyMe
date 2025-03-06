const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
} = require("discord.js");
const { readFromFile, writeToFile } = require("../utils/files");
const SocketService = require("../services/websocket");
const store = require("../store");

const RegisterTokenInteraction = {
  generateRegisterModal: () => {
    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId("tokenModal")
      .setTitle("User Token");

    // Add components to modal

    // Create the text input components
    const tokenInput = new TextInputBuilder()
      .setCustomId("token")
      // The label is the prompt the user sees for this input
      .setLabel("Input token")
      // Short means only a single line of text
      .setStyle(TextInputStyle.Short);

    // An action row only holds one text input,
    // so you need one action row per text input.
    const actionRow = new ActionRowBuilder().addComponents(tokenInput);

    // Add inputs to the modal
    modal.addComponents(actionRow);

    return modal;
  },

  handleInteractionReply: async (interaction, isResponse) => {
    // Read access token
    const accessData = await readFromFile();

    if (!isResponse) {
      await interaction.showModal(
        RegisterTokenInteraction.generateRegisterModal()
      );
    } else {
      const token = interaction.fields.getTextInputValue("token");
      const user = interaction.user;
      const channelGuild = interaction?.member?.guild?.id;
      writeToFile((prev) => ({
        [user.id]: {
          ...prev[user.id],
          socket_token: token,
          channel_guild: channelGuild,
        },
      }));

      // Create Socket Service Instance
      const Socket = new SocketService({ token, user });

      Socket.initListeners();

      // Set socket instance to store
      store.set("sockets", {
        [user.id]: Socket,
      });

      await interaction.reply({
        content: `Token registered successfully`,
        flags: MessageFlags.Ephemeral,
        components: [],
      });
    }
  },
};

module.exports = RegisterTokenInteraction;
