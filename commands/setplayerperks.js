const { error } = require('../helpers.js');
const { connection } = require('../database.js');

module.exports = {
  name        : 'setplayerperks',
  aliases     : ['set_player_perks', 'setperks', 'set_perks'],
  description : 'Set users in game perks via username',
  args        : ['username', 'perks'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['ADMINISTRATOR'],
  execute     : async (msg, args) => {
    const match = args.join(' ').trim().match(/^([\sA-Z()+.\-_\d]{1,12})\s+([\d,\s]+)$/i);

    if (!match)
      return msg.channel.send('Invalid arguments specified.');

    const [,player_name, perks] = match.map(m=>m.trim().toLowerCase());

    if (player_name.length > 12)
      return msg.channel.send('Invalid arguments specified, Username too long.');

    const update = await connection.query('UPDATE members SET perks = ? WHERE username = ?', [perks.replace(/ /g, ''), player_name]).catch(error);

    if (!update.affectedRows)
      return msg.channel.send([
        `Failed to set **${player_name}** perks to **${perks}**`,
        'Double check the username exist and try again.',
      ]);

    return msg.channel.send(`Set **${player_name}** perks to **${perks}**`);
  },
};
