module.exports = {
  name: "faq",
  aliases: [],
  description: "Links the faq page",
  args: [],
  guildOnly: true,
  cooldown: 3,
  botperms: ["SEND_MESSAGES"],
  userperms: [],
  execute: async (msg) => {
    msg.channel.send("https://2009scape.org/site/help/faq.html");
  },
};
