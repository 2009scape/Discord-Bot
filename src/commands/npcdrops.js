const { tablePages, postPages } = require("../helpers/functions.js");
const alasql = require('alasql');
const {
  liveserver_configs_dir,
} = require("../config.json");

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

    //const results = await connection_server.query("SELECT npc_id, name, CONCAT_WS('~', `default`, `main`, `charm`) AS drops FROM `npc_drops` LEFT JOIN `npc_configs` ON npc_configs.id = npc_drops.npc_id WHERE `npc_id` = ?", [npc_id]).catch(error);
    const results = await alasql
    .promise([
      `SELECT npc_configs.npc_id, npc_configs.name, CONCAT_WS('~', drop_tables.main, drop_tables.charm) AS drops FROM json('${liveserver_configs_dir}/drop_tables.json') AS drop_tables LEFT JOIN json('${liveserver_configs_dir}/npc_configs.json') AS npc_configs ON npc_configs.id = drop_tables.npc_id WHERE drop_tables.npc_id = "${npc_id}"`,
    ][0]);

    if (!results.length)
      return msg.channel.send('No npc found with specified ID, or npc has no drops.');

    let drops = results[0].drops.replace(/{/g, '').replace(/}/g, '').split('~').map(d=>d.split(','));

    drops = drops.filter(d=>!isNaN(d[0]) && d[0] > 0);

    //const items = (`SELECT id, name FROM \`item_configs\` WHERE id IN(${drops.map(d=>d[0]).join(',')})`);
    const items = await alasql
    .promise([
      `SELECT item_configs.id, item_configs.name FROM json('${liveserver_configs_dir}/item_configs.json') AS item_configs WHERE id IN(${drops.map(d=>d[0]).join(',')})`,
    ][0]);

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
