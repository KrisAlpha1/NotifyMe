const express = require("express");
const DiscordApi = require("../api");
const { writeToFile } = require("../utils/files");
const store = require("../store");
require("dotenv").config();

const startServer = () => {
  const app = express();
  const port = 3020;

  app.get("/authorize-bot", async (req, res) => {
    const { token_type, access_token, expires_in, refresh_token } =
      await DiscordApi.requestTokenGrant(
        req.query,
        `${process.env.BASE_URL}/authorize-bot`
      );
    const user = await DiscordApi.getUser(access_token);
    writeToFile((prev) => ({
      [user.id]: {
        token_type,
        access_token,
        expires_in,
        refresh_token,
        guilds: prev[user.id]?.guilds ?? [],
      },
    }));
    return res
      .status(302)
      .redirect(
        `https://discordapp.com/users/${process.env.CLIENT_ID}`
      );
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

module.exports = startServer;
