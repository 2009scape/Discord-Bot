const { error } = require("../helpers/logging.js");
const { connection } = require('../database.js');

module.exports = {
  name        : 'setplayericon',
  aliases     : ['set_player_icon', 'seticon', 'set_icon'],
  description : 'Set users in game chat icon via username',
  args        : ['username', 'icon id'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['ADMINISTRATOR'],
  execute     : async (msg, args) => {
    const match = args.join(' ').trim().match(/^([\sA-Z()+.\-_\d]{1,12})\s+(-?\d+)$/i);

    if (!match)
      return msg.channel.send('Invalid arguments specified.');

    const [,player_name, icon_id] = match.map(m=>m.trim().toLowerCase());

    if (player_name.length > 12)
      return msg.channel.send('Invalid arguments specified, Username too long.');

    if (isNaN(icon_id))
      return msg.channel.send('Invalid icon ID specified.');

    const update = await connection.query('UPDATE members SET icon = ? WHERE username = ?', [+icon_id, player_name]).catch(error);

    if (!update.affectedRows)
      return msg.channel.send([
        `Failed to set **${player_name}** icon to **${icon_id}**`,
        'Double check the username exist and try again.',
      ]);

    return msg.channel.send(`Set **${player_name}** icon to **${icon_id}**`);
  },
};
