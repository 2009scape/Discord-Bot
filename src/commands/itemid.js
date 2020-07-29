const { error } = require("../helpers/logging.js");
const { tablePages, postPages, RuneScape } = require("../helpers/functions.js");
const { connection_server } = require("../database.js");

module.exports = {
  name: "itemid",
  aliases: ["item_id"],
  description: "Get an item ID from the database based on name",
  args: ["name", "page?"],
  guildOnly: true,
  cooldown: 3,
  botperms: ["SEND_MESSAGES"],
  userperms: [],
  execute: async (msg, args) => {
    let [, item_name, page] = args
      .join(" ")
      .trim()
      .match(/([\sA-Z()+'.]+)(\d*)/i)
      .map((m) => m.trim());

    if (item_name.length < 3)
      return msg.channel.send(
        "Item name is too short, must be 3 or more characters."
      );

    page = isNaN(page) ? 1 : +page;

    let results = await connection_server
      .query(
        "SELECT id, name, tradeable, shop_price, grand_exchange_price FROM item_configs WHERE name LIKE ?",
        [`%${item_name}%`]
      )
      .catch(error);

    if (!results.length)
      return msg.channel.send("No items found with a similar name.");

    results = results.map((item) => [
      item.id,
      item.name.toLowerCase(),
      item.tradeable ? "yes" : "no",
      item.shop_price != null ? RuneScape.formatMoney(item.shop_price) : "---",
      item.grand_exchange_price != null
        ? RuneScape.formatMoney(item.grand_exchange_price)
        : "---",
    ]);

    const pages = await tablePages(
      ["ID", "Name", "Tradeable", "Shop Price", "GE Price"],
      results,
      `__***Items with names similar to \`${item_name}\`:***__`
    );

    postPages(msg, pages, page);
  },
};
