const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-server")
    .setDescription("Add a server to receive notifications from that server"),
  async execute(interaction) {
    await interaction.reply("Added");
  },
};
