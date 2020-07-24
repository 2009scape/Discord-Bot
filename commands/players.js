const { error } = require("../helpers/logging.js");
const { connection } = require('../database.js');

module.exports = {
  name        : 'players',
  aliases     : [],
  description : 'Get the current amount of players online',
  args        : [],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['SEND_MESSAGES'],
  execute     : async (msg, args) => {
    const results = await connection.query('SELECT COUNT(*) AS amount, rights FROM `members` WHERE online=1 GROUP BY rights ORDER BY rights ASC').catch(error);

    const players = results.length ? results.map(r=>+r.amount).reduce(((a,b)=>a+b)) : 0;

    return msg.channel.send([
      players == 1 ? 'There is currently **1 player** online.' : `There are currently **${players} players** online.`,
      '```yaml',
      `standard: ${(results.find(r=>r.rights == 0) || {amount: 0}).amount}`,
      `moderator: ${(results.find(r=>r.rights == 1) || {amount: 0}).amount}`,
      `administrator: ${(results.find(r=>r.rights == 2) || {amount: 0}).amount}`,
      '```',
    ]);
  },
};
