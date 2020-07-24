const { error } = require("../helpers/logging.js");
const { connection } = require('../database.js');

module.exports = {
  name        : 'setplayerrights',
  aliases     : ['set_player_rights', 'setrights', 'set_rights'],
  description : 'Set users in game rights via username',
  args        : ['username', 'rights level'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['ADMINISTRATOR'],
  execute     : async (msg, args) => {
    const match = args.join(' ').trim().match(/^([\sA-Z()+.\-_\d]{1,12})\s+(-?\d+)$/i);

    if (!match)
      return msg.channel.send('Invalid arguments specified.');

    const [,player_name, rights_level] = match.map(m=>m.trim().toLowerCase());

    if (player_name.length > 12)
      return msg.channel.send('Invalid arguments specified, Username too long.');

    if (isNaN(rights_level))
      return msg.channel.send('Invalid rights level specified.');

    const update = await connection.query('UPDATE members SET rights = ? WHERE username = ?', [+rights_level, player_name]).catch(error);

    if (!update.affectedRows)
      return msg.channel.send([
        `Failed to set **${player_name}** rights level to **${rights_level}**`,
        'Double check the username exist and try again.',
      ]);

    return msg.channel.send(`Set **${player_name}** rights to **${rights_level}**`);
  },
};
