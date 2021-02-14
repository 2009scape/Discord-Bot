const {
  tablePages,
  postPages,
  itemNameFromId,
} = require("../helpers/functions.js");
const { world1_eco_dir, world2_eco_dir } = require("../config.json");
const fs = require("fs");

module.exports = {
  name: "grandexchange",
  aliases: ["grand_exchange", "ge"],
  description: "Get a list of items in the Grand Exchange",
  args: ["buying|selling", "world?"],
  guildOnly: true,
  cooldown: 3,
  botperms: ["SEND_MESSAGES"],
  userperms: [],
  execute: async (msg, args) => {
    let [type, world = 1] = args;

    if (!["buying", "selling"].includes(type))
      return msg.channel.send("First argument must be `buying` or `selling`.");

    world = isNaN(world) ? 1 : +world;

    const results = JSON.parse(
      fs.readFileSync(`./${world === 1 ? world1_eco_dir : world2_eco_dir}/offer_dispatch.json`, "utf8")
    ).offers;

    if (!results.length)
      return msg.channel.send("No items in the Grand Exchange");

    grand_exchange = [];

    results.forEach((offer) => {
      grand_exchange.push([itemNameFromId(offer.itemId), offer.amount]);
    });

    grand_exchange = grand_exchange.sort();

    // Combine duplicates
    grand_exchange.forEach((element, index) => {
      if (grand_exchange[index + 1] && grand_exchange[index][0] == grand_exchange[index + 1][0]) {
        grand_exchange[index + 1][1] = `${Number(grand_exchange[index + 1][1]) + Number(grand_exchange[index][1])}`;
        grand_exchange[index][1] = 0;
      }
    });
    grand_exchange = grand_exchange.filter((element) => element[1] > 0);

    const pages = await tablePages(
      ["Item Name", "Amount"],
      grand_exchange,
      `__***Current items in world ${world} Grand Exchange for ${type.toLowerCase()}:***__`
    );

    postPages(msg, pages);
  },
};
