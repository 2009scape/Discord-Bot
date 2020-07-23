const { error, tablePages, postPages } = require('../helpers.js');
const { connection, connection_server } = require('../database.js');

module.exports = {
  name        : 'grandexchange',
  aliases     : ['grand_exchange', 'ge'],
  description : 'Get a list of items in the Grand Exchange',
  args        : ['buying|selling', 'page?'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : [],
  execute     : async (msg, args) => {
    let [type, page = 1] = args;

    if (!['buying', 'selling'].includes(type))
      return msg.channel.send('First argument must be `buying` or `selling`.');

    page = isNaN(page) ? 1 : +page;

    const results = await connection.query('SELECT ge FROM `members` WHERE ge IS NOT NULL AND ge <> ""').catch(error);

    if (!results.length)
      return msg.channel.send('No items in the Grand Exchange');

    let grand_exchange = [];
    results.forEach(r=>{
      const list = r.ge.split('|').filter(i=>type == 'selling' ? i.includes('true') : i.includes('false')).map(i=>i.split(',').map(JSON.parse));
      list.forEach(item=>{
        const ge_item = grand_exchange.find(ge_item=>ge_item[0] == item[0]);
        if (!ge_item) return grand_exchange.push(item);
        ge_item[1] += item[1];
      });
    });

    const items = await connection_server.query(`SELECT id, name FROM \`item_configs\` WHERE id IN(${grand_exchange.map(d=>d[0]).join(',')})`);

    grand_exchange = grand_exchange.map(ge_item=>[
      (items.find(item=>item.id == ge_item[0]) || {name: ge_item[0]}).name.toString().toLowerCase(),
      ge_item[1],
    ]);

    const pages = await tablePages(['Item Name', 'Amount'], grand_exchange, `__***Current items in Grand Exchange for ${type.toLowerCase()}:***__`);

    postPages(msg, pages, page);
  },
};
