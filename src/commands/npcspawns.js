const { error } = require("../helpers/logging.js");
const { tablePages, postPages } = require("../helpers/functions.js");
const { connection_server } = require('../database.js');
const alasql = require('alasql');
const {
  liveserver_configs_dir,
} = require("../config.json");

module.exports = {
  name        : 'npcspawns',
  aliases     : ['npcspawn', 'npc_spawn', 'npc_spawns'],
  description : 'Get all npc spawn locations based on npc ID',
  args        : ['npc ID', 'page?'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : [],
  execute     : async (msg, args) => {
    let [npc_id, page = 1] = args;

    npc_id = isNaN(npc_id) ? 1 : +npc_id;
    page = isNaN(page) ? 1 : +page;

    //const results = await connection_server.query('SELECT npc_id, name, loc_data AS spawns FROM `npc_spawns` LEFT JOIN `npc_configs` ON npc_configs.id = npc_spawns.npc_id WHERE `npc_id` = ?', [npc_id]).catch(error);
    const results = await alasql
    .promise([
      `SELECT npc_id, name, loc_data AS spawns FROM json('${liveserver_configs_dir}/npc_spawns.json') AS npc_spawns FULL OUTER JOIN json('${liveserver_configs_dir}/npc_configs.json') AS npc_configs ON npc_configs.id = npc_spawns.npc_id WHERE npc_configs.npc_id = "${npc_id}"`,
    ][0]);


    console.log(results);
    if (!results.length)
      return msg.channel.send('No npc found with specified ID, or npc has no spawns.');

    let spawns = results[0].spawns.replace(/{/g, '').replace(/}/g, '').split('-').map(d=>d.split(','));

    spawns = spawns.filter(d=>!isNaN(d[0]) && d[0] > 0).map(spawn=>[
      spawn[0],
      spawn[1],
      spawn[2],
    ]);

    const pages = await tablePages(['X', 'Y', 'Z'], spawns, `__***[${results[0].npc_id}] ${results[0].name || 'Unknown Name'} spawns:***__`);

    postPages(msg, pages, page);
  },
};
