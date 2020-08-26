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
Vampire Slayer | Sheep Shearer | The Restless Ghost
Doric's Quest | WaterFall Quest | Witch's House
What Lies Below | The Tourist Trap | Dwarf Cannon
Lost City | Cook's Assistant | Ernest the Chicken
Roving Elves | Merlin's Crystal | Jungle Potion
Black Knight's Fortress | Pirate's Treasure
Rune Mystery | Sheep Herder | Wolf Whistle
Sheild of Arrav | Prince Ali Rescue | Gertrude's cat
Priest in peril | Witch's Potion | Demon slayer
Animal Magnetism | The Knight's sword | Goblin Diplomacy
Dragon Slayer | Imp Catcher |  Drudic Ritual`);
  },
};
