const { error } = require("../helpers/logging.js");
const {
  tablePages,
  postPages,
  timeFromDates,
} = require("../helpers/functions.js");
const { connection } = require("../database.js");
const rights = ["moderator", "administrator"];

module.exports = {
  name: "playerlist",
  aliases: ["playerslist"],
  description: "Get a list of players online",
  args: ["page?"],
  guildOnly: true,
  cooldown: 30,
  botperms: ["SEND_MESSAGES"],
  userperms: [],
  execute: async (msg, args) => {
    let [page = 1] = args;

    page = isNaN(page) ? 1 : +page;

    const results = await connection
      .query(
        "SELECT username, lastLogin, timePlayed, rights, ironManMode FROM `members` WHERE online=1"
      )
      .catch(error);

    if (!results.length)
      return msg.channel.send("No players currently online.");

    const players = results.map((r) => [
      r.username,
      rights[Math.min(rights.length, Math.max(0, +r.rights))],
      r.ironManMode.toLowerCase(),
      timeFromDates(+r.lastLogin || Date.now()),
      timeFromDates((+r.lastLogin || Date.now()) - (+r.timePlayed || 0)),
    ]);

    const pages = await tablePages(
      ["Username", "Rights", "Ironman Status", "Playtime", "Total Playtime"],
      players,
      "__***Players currently online:***__"
    );

    postPages(msg, pages, page);
  },
};
