const { getUserGuilds, getGuildMembers } = require("../api");
const { readFromFile } = require("../utils/files");

const GuildMembership = {
  fetchGuilds: async (userId) => {
    const accessData = await readFromFile();
    const registeredGuilds = accessData[userId].guilds;
    const guilds = await getUserGuilds(accessData[userId].access_token);
    let filtered = guilds.filter((g) => registeredGuilds.includes(g.id));
    for (let i = 0; i < filtered.length; i++) {
      filtered[i].members = await GuildMembership.getGuildMembers(
        filtered[i].id,
        accessData[userId].access_token
      );
    }
    return filtered;
  },
  getGuildMembers: async (guildId, token) => {
    const members = await getGuildMembers(guildId, token);
    return members.length;
  },
  runGuildsChecker: async (userId) => {
    const guilds = await GuildMembership.fetchGuilds(userId);
    guilds.forEach((guild) => {
      console.log(guild.members);
    });
  },
};

module.exports = GuildMembership;
