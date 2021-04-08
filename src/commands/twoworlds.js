module.exports = {
  name: "twoworlds",
  aliases: [],
  description: "Links the Two Worlds' page",
  args: [],
  guildOnly: true,
  cooldown: 3,
  botperms: ["SEND_MESSAGES"],
  userperms: [],
  execute: async (msg) => {
    msg.channel.send("https://2009scape.org/site/kbase/guid/themed_worlds.html");
  },
};
