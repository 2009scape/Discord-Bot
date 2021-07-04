module.exports = {
  name: "gettingstarted",
  aliases: [],
  description: "Links the getting started page",
  args: [],
  guildOnly: true,
  cooldown: 3,
  botperms: ["SEND_MESSAGES"],
  userperms: [],
  execute: async (msg) => {
    msg.channel.send("https://2009scape.org/site/game_guide/how_do_i_get_started0.html");
  },
};
