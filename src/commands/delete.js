const { error } = require("../helpers/logging.js");
const { connection } = require("../database.js");

module.exports = {
  name: "delete",
  aliases: ["delete"],
  description: "Delete a user's account",
  args: ["username"],
  guildOnly: true,
  cooldown: 3,
  botperms: ["SEND_MESSAGES"],
  userperms : ['ADMINISTRATOR'],
  execute : async (msg, args) => {
    const match = args.join(' ').trim().match(/^([\sA-Z()+.\-_\d]{1,12})\s+(-?\d+)$/i);

    if (!match)
      return msg.channel.send('Invalid arguments specified.');

    const [,player_name] = match.map(m=>m.trim().toLowerCase());

    if (player_name.length > 12)
      return msg.channel.send('Invalid arguments specified, Username too long.');

    return msg.channel.send(`Type "YES" to confirm deleting ${player_name}`);
  },
};
