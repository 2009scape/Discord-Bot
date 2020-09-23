const { tablePages, postPages, itemNameFromId } = require("../helpers/functions.js");
const { liveserver_eco_dir } = require("../config.json");
const fs = require('fs');

module.exports = {
  name: "grandexchange",
  aliases: ["grand_exchange", "ge"],
  description: "Get a list of items in the Grand Exchange",
  args: ["buying|selling", "page?"],
  guildOnly: true,
  cooldown: 3,
  botperms: ["SEND_MESSAGES"],
  userperms: [],
  execute: async (msg, args) => {
    let [type, page = 1] = args;

    if (!["buying", "selling"].includes(type))
      return msg.channel.send("First argument must be `buying` or `selling`.");

    page = isNaN(page) ? 1 : +page;

    const results = JSON.parse(fs.readFileSync(`./${liveserver_eco_dir}/offer_dispatch.json`, 'utf8')).offers;

    if (!results.length)
      return msg.channel.send("No items in the Grand Exchange");

    grand_exchange = [];

    results.forEach(offer => {
      grand_exchange.push([itemNameFromId(offer.itemId), offer.amount]);
    });

    const pages = await tablePages(
      ["Item Name", "Amount"],
      grand_exchange,
      `__***Current items in Grand Exchange for ${type.toLowerCase()}:***__`
    );

    postPages(msg, pages, page);
  },
};
