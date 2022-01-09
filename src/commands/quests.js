module.exports = {
  name: "quests",
  aliases: ["quest"],
  description: "Lists the quests in 2009scape",
  args: [],
  guildOnly: true,
  cooldown: 3,
  botperms: ["SEND_MESSAGES"],
  userperms: [],
  execute: async (msg) => {
    msg.channel.send(`
All Fired Up | Animal Magnetism | Black Knight's Fortress  
Cook's Assistant | Demon slayer | Doric's Quest  
Dragon Slayer | Drudic Ritual | Dwarf Cannon 
Ernest the Chicken | Family Crest | Fishing Contest | 
Gertrude's cat |Goblin Diplomacy | Imp Catcher | Jungle Potion 
Lost Tribe | Lost City | Merlin's Crystal 
Nature Spirit | Pirate's Treasure | Priest in peril
Prince Ali Rescue | Roving Elves | Rune Mystery 
Sheep Herder | Sheep Shearer | Shield of Arrav
The Knight's sword | The Restless Ghost | The Tourist Trap
Vampire Slayer | WaterFall Quest | What Lies Below 
Witch's House | Witch's Potion | Wolf Whistle`);
  },
};
