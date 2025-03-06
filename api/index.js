const { queryParams } = require("../utils/request");
require("dotenv").config();

const DiscordApi = {
  requestTokenGrant: async (data, redirectUrl) => {
    const params = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code: data.code,
      redirect_uri: redirectUrl,
      scope: "identify guilds guilds.members.read",
    };
    return fetch(`https://discord.com/api/v10/oauth2/token`, {
      method: "POST",
      body: new URLSearchParams(params),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((result) => result.json())
      .then((response) => {
        console.log(response);
        return response;
      })
      .catch(console.error);
  },
  refreshToken: async (refreshToken) => {
    const params = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };
    return fetch(`https://discord.com/api/v10/oauth2/token`, {
      method: "POST",
      body: new URLSearchParams(params),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((result) => result.json())
      .then((response) => {
        return response;
      })
      .catch(console.error);
  },
  getUser: async (accessToken) => {
    return fetch(`https://discord.com/api/v10/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((result) => result.json())
      .then((response) => {
        return response;
      })
      .catch(console.error);
  },
  getUserGuilds: async (accessToken) => {
    return fetch(`https://discord.com/api/v10/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((result) => result.json())
      .then((response) => {
        return response;
      })
      .catch(console.error);
  },
  getGuildMembers: async (guildId, accessToken) => {
    return fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((result) => result.json())
      .then((response) => {
        console.log(response);
        return response;
      })
      .catch(console.error);
  },
};

module.exports = DiscordApi;
