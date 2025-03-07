const express = require("express");
const DiscordApi = require("../api");
const { writeToFile, readFromFile } = require("../utils/files");
const store = require("../store");
require("dotenv").config();

const startServer = () => {
  const app = express();
  const port = 3020;

  app.get("/authorize-bot", async (req, res) => {
    console.log(process.env.BASE_URL);
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
      .redirect(`https://discordapp.com/users/${process.env.CLIENT_ID}`);
  });

  app.get("/get/access", async (req, res) => {
    const accessData = await readFromFile();
    return res.status(200).json(accessData);
  });

  app.get("/ping", async (req, res) => {
    return res.status(200).send("Ping!");
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

  // Ping self
  let pingCount = 0;
  setInterval(() => {
    fetch(`https://notifyme-b3m1.onrender.com/ping`)
      .then((result) => result.text())
      .then((response) => {
        if (pingCount < 2) {
          console.log(response);
          pingCount++;
        }
      })
      .catch(console.error);
  }, 900000);
};

module.exports = startServer;
