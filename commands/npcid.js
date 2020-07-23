const { error, tablePages, postPages } = require('../helpers.js');
const { connection_server } = require('../database.js');

module.exports = {
  name        : 'npcid',
  aliases     : ['npc_id'],
  description : 'Get an npc ID from the database based on their name',
  args        : ['name', 'page?'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : [],
  execute     : async (msg, args) => {
    let [,npc_name, page] = args.join(' ').match(/([\sA-Z]+)(\d*)/i).map(m=>m.trim());

    page = isNaN(page) ? 1 : +page;

    let results = await connection_server.query('SELECT id, name, examine, lifepoints FROM npc_configs WHERE name LIKE ?', [`%${npc_name}%`]).catch(error);

    if (!results.length)
      return msg.channel.send('No npc found with a similar name.');

    results = results.map(npc=>[
      npc.id,
      `${npc.lifepoints.toString().padEnd(4, ' ')}♥`,
      npc.name.toLowerCase(),
      (npc.examine || '').toLowerCase().replace(/'/g, ''),
    ]);

    const pages = await tablePages(['ID', 'HP', 'Name', 'Examine'], results, `__***Npc with names similar to \`${npc_name}\`:***__`);

    postPages(msg, pages, page);
  },
};
