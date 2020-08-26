module.exports = {
  name: "confirm",
  aliases: [''],
  description: "Confirms the deletion of a user's account",
  args: [],
  guildOnly: true,
  cooldown: 3,
  botperms: ["SEND_MESSAGES"],
  userperms : ['ADMINISTRATOR'],
  execute : async (msg) => {
    return msg.channel.send(`Account deleted. Last backup was ~${new Date().toString().split(":")[1]} minutes ago`);
  },
};
