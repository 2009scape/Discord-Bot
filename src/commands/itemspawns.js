const { tablePages, postPages } = require("../helpers/functions.js");
const alasql = require('alasql');
const {
  liveserver_configs_dir,
} = require("../config.json");

module.exports = {
  name        : 'itemspawns',
  aliases     : ['itemspawn', 'item_spawn', 'item_spawns'],
  description : 'Get all item spawn locations based on item ID',
  args        : ['item ID', 'page?'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : [],
  execute     : async (msg, args) => {
    let [item_id, page = 1] = args;

    item_id = isNaN(item_id) ? 1 : +item_id;
    page = isNaN(page) ? 1 : +page;

    // const results = await connection_server.query('SELECT item_id, name, loc_data AS spawns FROM `ground_spawns` LEFT JOIN `item_configs` ON item_configs.id = ground_spawns.item_id WHERE `item_id` = ?', [item_id]).catch(error);
    const results = await alasql
    .promise([
      `SELECT item_id, item_configs.name, loc_data AS spawns FROM json('${liveserver_configs_dir}/ground_spawns.json') AS ground_spawns OUTER JOIN json('${liveserver_configs_dir}/item_configs') AS item_configs ON item_configs.id = ground_spawns.item_id WHERE ground_spawns.item_id = "${item_id}"`,
    ])[0];

    if (!results.length)
      return msg.channel.send('No item found with specified ID, or item has no spawns.');

    let spawns = results[0].spawns.replace(/{/g, '').replace(/}/g, '').split('-').map(d=>d.split(','));

    spawns = spawns.filter(d=>!isNaN(d[0]) && d[0] > 0).map(spawn=>[
      spawn[0],
      spawn[1],
      spawn[2],
      spawn[3],
      `${spawn[4] & 0xFFFF} → ${(spawn[4] >> 16) & 0xFFFF}`,
    ]);

    const pages = await tablePages(['Amount', 'X', 'Y', 'Z', 'Respawn (ticks)'], spawns, `__***[${results[0].item_id}] ${results[0].name || 'Unknown Name'} spawns:***__`);

    postPages(msg, pages, page);
  },
};
