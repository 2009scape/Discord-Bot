module.exports = {
  name: "delete",
  aliases: [],
  description: "Confirms the deletion of a user's account",
  args: ['username'],
  guildOnly: true,
  cooldown: 3,
  botperms: ["SEND_MESSAGES"],
  userperms : ['ADMINISTRATOR'],
  execute : async (msg, args) => {

    const player_name = args[0];

    if (player_name.length > 12)
      return msg.channel.send('Invalid arguments specified, Username too long.');

    return msg.channel.send(`Type "::CONFIRM" to confirm deleting ${player_name}`);
  },
};
