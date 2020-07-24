const { error } = require("../helpers/logging.js");
const { tablePages, postPages } = require("../helpers/functions.js");
const { RuneScape } = require('../helpers/leaderboard.js');
const { connection, connection_server } = require('../database.js');

module.exports = {
  name        : 'getplayeritems',
  aliases     : [],
  description : 'Get a list of players items from bank, inventory or equipment',
  args        : ['player name', 'item location', 'page?'],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['MANAGE_GUILD'],
  execute     : async (msg, args) => {
    const match = args.join(' ').trim().match(/^([\sA-Z()+.\-_\d]{1,12})\s+(bank|inventory|equipment)\s*(\d*)$/i);

    if (!match)
      return msg.channel.send('Invalid arguments specified.');

    let [,player_name, type, page = 1] = match.map(m=>m.trim().toLowerCase());

    if (player_name.length > 12)
      return msg.channel.send('Invalid arguments specified, Username too long.');

    page = isNaN(page) ? 1 : +page;

    const results = await connection.query(`SELECT username, ${type} FROM members WHERE username = ?`, [player_name]).catch(error);

    if (!results.length)
      return msg.channel.send('No player found with specified name.');

    let drops = results[0][type].split('|').map(d=>d.split(',')).filter(d=>d[0] > 0);

    if (!drops.length)
      return msg.channel.send(`No items in ${type}.`);

    let items = [...new Set(drops.map(i=>i[0]))].filter(d=>d[0] > 0).join(',');
    items = await connection_server.query(`SELECT id, name, tradeable, shop_price, grand_exchange_price FROM \`item_configs\` WHERE id IN(${items})`);

    drops = drops.map(i=>{
      let item = items.find(i2=>i2.id==i[0]);

      if (!item)
        item = {id: i[0], name: '------', tradeable: null, shop_price: null, grand_exchange_price: null};

      item.amount = i[1];
      return item;
    });

    drops = drops.map(item=>[
      item.id,
      item.name.toLowerCase(),
      RuneScape.formatNumber(item.amount || 0),
      item.tradeable ? 'yes' : 'no',
      item.shop_price != null ? RuneScape.formatMoney(item.shop_price) : '---',
      item.grand_exchange_price != null ? RuneScape.formatMoney(item.grand_exchange_price) : '---',
    ]);

    const pages = await tablePages(['ID', 'Name', 'Amount', 'Tradeable', 'Shop Price', 'GE Price'], drops, `__***${results[0].username} ${type}:***__`);

    postPages(msg, pages, page);
  },
};
