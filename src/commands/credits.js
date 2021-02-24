const { error } = require("../helpers/logging.js");
const { connection } = require('../database.js');

module.exports = {
  name        : 'credits',
  aliases     : ['get_credits', 'getcredits'],
  description : 'Get a players in-game credits via username',
  args        : ['username'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms: ["MANAGE_MESSAGES"],
  execute     : async (msg, args) => {
    const player_name = args.join(' ').trim().toLowerCase();

    if (!/^([\sA-Z()+.\-_\d]{1,12})$/i.test(player_name))
      return msg.channel.send('Invalid characters in username.');

    if (player_name.length > 12)
      return msg.channel.send('Invalid arguments specified, Username too long.');

    const results = await connection.query('SELECT credits FROM members WHERE username = ?', [player_name]).catch(error);

    if (!results.length)
      return msg.channel.send([
        `Failed to fetch credits for **${player_name}**..`,
        'Double check the username exist and try again.',
      ]);

    return msg.channel.send([
      `__***${player_name}***__`,
      `Total credits: **${results[0].credits}**`,
    ]);
  },
};
