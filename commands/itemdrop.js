const { error, tablePages, postPages } = require('../helpers.js');
const { connection_server } = require('../database.js');

module.exports = {
  name        : 'itemdrop',
  aliases     : ['item_drop','itemdrops', 'item_drops'],
  description : 'Get an list of monsters that drop a specific item ID',
  args        : ['item_id', 'page?'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : [],
  execute     : async (msg, args) => {
    let [item_id, page = 1] = args;

    item_id = isNaN(item_id) ? 1 : +item_id;
    page = isNaN(page) ? 1 : +page;

    let results = await connection_server.query("SELECT npc_id AS id, name, CONCAT_WS('~', `default`, `main`, `charm`) AS drops FROM `npc_drops` LEFT JOIN `npc_configs` ON npc_configs.id = npc_drops.npc_id WHERE `default` LIKE ? || main LIKE ? || charm LIKE ?", [`%{${item_id},%`, `%{${item_id},%`, `%{${item_id},%`]).catch(error);

    if (!results.length)
      return msg.channel.send('No NPC found with that item in their drop table.');

    results = results.map(npc=>{
      const [,amount_1, amount_2, rarity, extended_rarity] = npc.drops.match(new RegExp(`\\{${item_id},(\\d+),(\\d+),[\\d.]+,(\\w+),?(\\d+)?`)) || [];
      return [
        npc.id,
        (npc.name || 'Unknown Name').toLowerCase(),
        amount_1 != amount_2 ? `${amount_1} → ${amount_2}` : amount_1,
        rarity.toLowerCase() + (extended_rarity ? ` (1/${extended_rarity})` : ''),
      ];
    });

    const pages = await tablePages(['ID', 'Name', 'Amount', 'Rarity'], results, `__***Npc that drops item \`${item_id}\`:***__`);

    postPages(msg, pages, page);
  },
};
