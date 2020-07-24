const { error } = require("../helpers/logging.js");
const { connection } = require('../database.js');

module.exports = {
  name        : 'givecredits',
  aliases     : ['give_credits'],
  description : 'Give a player in-game credits via username',
  args        : ['username', 'amount'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['ADMINISTRATOR'],
  execute     : async (msg, args) => {
    const match = args.join(' ').trim().match(/^([\sA-Z()+.\-_\d]{1,12})\s+(-?\d+)$/i);

    if (!match)
      return msg.channel.send('Invalid arguments specified.');

    const [,player_name, amount] = match.map(m=>m.trim().toLowerCase());

    if (player_name.length > 12)
      return msg.channel.send('Invalid arguments specified, Username too long.');

    if (isNaN(amount))
      return msg.channel.send('No amount specified.');

    const update = await connection.query('UPDATE members SET credits = credits + ? WHERE username = ?', [+amount, player_name]).catch(error);

    if (!update.affectedRows)
      return msg.channel.send([
        `Failed to give **${amount} credits** to **${player_name}**..`,
        'Double check the username exist and try again.',
      ]);

    const results = await connection.query('SELECT credits FROM members WHERE username = ?', [player_name]).catch(error);

    if (!results.length)
      return msg.channel.send([
        `Failed to give **${amount} credits** to **${player_name}**..`,
        'Double check the username exist and try again.',
      ]);

    return msg.channel.send([
      `Gave **${amount} credits** to **${player_name}**..`,
      `Total credits: **${results[0].credits}**`,
    ]);
  },
};
