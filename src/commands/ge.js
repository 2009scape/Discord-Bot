const {
  tablePages,
  postPages,
  itemNameFromId,
} = require("../helpers/functions.js");
const { liveserver_eco_dir } = require("../config.json");
const fs = require("fs");

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

    msg.channel.send("Loading GE.. Hold tight!");

    console.log("Starting file load");
    const results = JSON.parse(
      fs.readFileSync(`./${liveserver_eco_dir}/offer_dispatch.json`, "utf8")
    ).offers;
    console.log("Finished file load");

    if (!results.length)
      return msg.channel.send("No items in the Grand Exchange");

    grand_exchange = [];

    console.log("Putting all the offers in a list..? (should be hashmap maybe)");
    results.forEach((offer) => {
      grand_exchange.push([itemNameFromId(offer.itemId), offer.amount]);
    });
    console.log("Done putting into a list");

    console.log("Sorting the list");
    grand_exchange = grand_exchange.sort();
    console.log("Done sorting");

    // Combine duplicates
    console.log("Combining duplicates");
    grand_exchange.forEach((element, index) => {
      if (grand_exchange[index + 1] && grand_exchange[index][0] == grand_exchange[index + 1][0]) {
        grand_exchange[index + 1][1] = `${Number(grand_exchange[index + 1][1]) + Number(grand_exchange[index][1])}`;
        grand_exchange[index][1] = 0;
      }
    });
    console.log("Done combining");
    console.log("Removing zeros");
    grand_exchange = grand_exchange.filter((element) => element[1] > 0);
    console.log("Done removing");

    console.log("Getting table pages");
    const pages = await tablePages(
      ["Item Name", "Amount"],
      grand_exchange,
      `__***Current items in Grand Exchange for ${type.toLowerCase()}:***__`
    );
    console.log("Done getting table pages");

    postPages(msg, pages, page);
  },
};
