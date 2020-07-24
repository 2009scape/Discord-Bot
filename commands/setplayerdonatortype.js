const { error } = require("../helpers/logging.js");
const { connection } = require('../database.js');

module.exports = {
  name        : 'setplayerdonatortype',
  aliases     : ['set_player_donator_type', 'setplayerdonator', 'set_player_donator', 'setdonatortype', 'set_donator_type', 'setdonator', 'set_donator'],
  description : 'Set users donator type via username',
  args        : ['username', 'donator type'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['ADMINISTRATOR'],
  execute     : async (msg, args) => {
    const match = args.join(' ').trim().match(/^([\sA-Z()+.\-_\d]{1,12})\s+(-?\d+)$/i);

    if (!match)
      return msg.channel.send('Invalid arguments specified.');

    const [,player_name, donator_type] = match.map(m=>m.trim().toLowerCase());

    if (player_name.length > 12)
      return msg.channel.send('Invalid arguments specified, Username too long.');

    if (isNaN(donator_type))
      return msg.channel.send('Invalid donator type specified.');

    const update = await connection.query('UPDATE members SET donatorType = ? WHERE username = ?', [+donator_type, player_name]).catch(error);

    if (!update.affectedRows)
      return msg.channel.send([
        `Failed to set **${player_name}** donator type to **${donator_type}**`,
        'Double check the username exist and try again.',
      ]);

    return msg.channel.send(`Set **${player_name}** donator type to **${donator_type}**`);
  },
};
