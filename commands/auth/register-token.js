const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register-token")
    .setDescription("Register user token"),
  async execute(interaction) {
    await interaction.reply("Added");
  },
};
