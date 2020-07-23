const { error, tablePages, postPages } = require('../helpers.js');
const { connection_server } = require('../database.js');

module.exports = {
  name        : 'npcdrops',
  aliases     : ['npcdrop', 'npc_drop', 'npc_drops'],
  description : 'Get all npc drops based on npc ID',
  args        : ['npc ID', 'page?'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : [],
  execute     : async (msg, args) => {
    let [npc_id, page = 1] = args;

    npc_id = isNaN(npc_id) ? 1 : +npc_id;
    page = isNaN(page) ? 1 : +page;

    const results = await connection_server.query("SELECT npc_id, name, CONCAT_WS('~', `default`, `main`, `charm`) AS drops FROM `npc_drops` LEFT JOIN `npc_configs` ON npc_configs.id = npc_drops.npc_id WHERE `npc_id` = ?", [npc_id]).catch(error);

    if (!results.length)
      return msg.channel.send('No npc found with specified ID, or npc has no drops.');

    let drops = results[0].drops.replace(/{/g, '').replace(/}/g, '').split('~').map(d=>d.split(','));

    drops = drops.filter(d=>!isNaN(d[0]) && d[0] > 0);

    const items = await connection_server.query(`SELECT id, name FROM \`item_configs\` WHERE id IN(${drops.map(d=>d[0]).join(',')})`);

    drops = drops.map(drop=>[
      drop[0],
      (items.find(i=>i.id==drop[0]) || {name:'------' }).name.toLowerCase(),
      drop[1] != drop[2] ? (`${drop[1]} → ${drop[2]}`) : drop[1],
      drop[4].toLowerCase() + (drop[5] ? ` (1/${drop[5]})` : ''),
    ]);

    const pages = await tablePages(['ID', 'Name', 'Amount', 'Rarity'], drops, `__***[${results[0].npc_id}] ${results[0].name || 'Unknown Name'} drops:***__`);

    postPages(msg, pages, page);
  },
};
