module.exports = {
  name: "minigames",
  aliases: ["minigames"],
  description: "Lists the minigames in 2009scape",
  args: [],
  guildOnly: true,
  cooldown: 3,
  botperms: ["SEND_MESSAGES"],
  userperms: [],
  execute: async (msg) => {
    msg.channel.send(`
  Agility Pyramid | All Fired Up | Brimhaven Course | 
  Fish Trawlers | Mage Training Arena | Mage Arena |
  Gnome Restaraunt | Pest Control | Pyramid Plunder | 
  Sorcerer's Garden`);
  },
};
