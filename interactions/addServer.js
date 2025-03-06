const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  MessageFlags,
} = require("discord.js");
const { readFromFile, writeToFile } = require("../utils/files");
const { getUserGuilds } = require("../api");

const AddServerInteraction = {
  generateGuildOptions: ({ guilds, page }) => {
    let guildOptions = guilds.map((guild) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(guild.name)
        .setDescription(" ")
        .setValue(guild.id)
    );
    let pageNumber = null;
    if (page) {
      pageNumber = parseInt(page.replace("page:", ""));
      const start = (pageNumber - 1) * 25 - 1;
      guildOptions = guildOptions.slice(start, guildOptions.length);
    }
    let optionsToAppend =
      guildOptions.length > 25
        ? [
            ...guildOptions.slice(0, 24),
            new StringSelectMenuOptionBuilder()
              .setLabel("Next Page ➡️")
              .setDescription(" ")
              .setValue(`page:${(pageNumber ?? 1) + 1}`),
          ]
        : guildOptions;

    const select = new StringSelectMenuBuilder()
      .setCustomId("guild_choice")
      .setPlaceholder("Choose Server!")
      .addOptions(...optionsToAppend);

    const row = new ActionRowBuilder().addComponents(select);

    return row;
  },
  handleInteractionReply: async (interaction, action = null, reply = null) => {
    // Read access token
    const accessData = await readFromFile();
    // const user = await client.users.fetch(interaction.user.id);
    const guilds = await getUserGuilds(
      accessData[interaction.user.id].access_token
    );
    const replyProps = {
      content: "Select a server",
      components: [
        AddServerInteraction.generateGuildOptions({ guilds, page: action }),
      ],
      withResponse: true,
      ...(!action ? { flags: MessageFlags.Ephemeral } : {}),
    };

    // Send interaction reply to the user
    const response = action
      ? await (async () => {
          if (reply) {
            const message = await reply.update(replyProps);
            return message;
          }
          return await interaction.editReply(replyProps);
        })()
      : await interaction.reply(replyProps);

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    try {
      // Wait for response from the user
      const confirmation = await (
        response?.resource?.message ?? response
      ).awaitMessageComponent({
        filter: collectorFilter,
        time: 300_000,
      });

      const value = confirmation.values[0];

      // Check for action following response or plain value
      if (value && value.split(":").length > 1) {
        // Handle action if present
        await AddServerInteraction.handleInteractionReply(
          interaction,
          value,
          confirmation
        );
      } else {
        const guild = guilds.filter((g) => g.id == value)[0];
        const user = confirmation.user;
        writeToFile((prev) => ({
          [user.id]: {
            ...prev[user.id],
            guilds: [
              ...(prev[user.id]?.guilds ?? []).filter((g) => g != guild.id),
              guild.id,
            ],
          },
        }));
        // Final interaction reply
        await interaction.editReply({
          content: `Successfully added ${guild.name} to notification tracker`,
          flags: MessageFlags.Ephemeral,
          components: [],
        });
      }
    } catch (e) {
      console.log(e);
      await interaction.editReply({
        content: "No action performed within 1 minute, cancelling",
        flags: MessageFlags.Ephemeral,
        components: [],
      });
    }
  },
};

module.exports = AddServerInteraction;
