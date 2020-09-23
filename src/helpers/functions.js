const { table, getBorderCharacters } = require("table");
const { liveserver_configs_dir } = require("../config.json");
const fs = require('fs');

function padNumber(num, len = 2, padding = "0") {
  return num.toString().padStart(len, padding);
}

function toTableString(headerArray, dataArray) {
  const data = [headerArray, ...dataArray];

  const config = {
    border: getBorderCharacters("norc"),
    // top, after header, bottom of table
    drawHorizontalLine: (index, size) =>
      index === 0 || index === 1 || index === size,
  };
  return table(data, config);
}

const timeFromDates = (start, end = Date.now()) => {
  start = new Date(+start);
  end = new Date(+end);
  const time = new Date(Math.max(+end, +start) - Math.min(+end, +start));
  const days = Math.floor(time / 864e5);
  return `${
    days ? `${days} Day${days != 1 ? "s" : ""} ` : ""
  }${`${time.getUTCHours()}`.padStart(
    2,
    0
  )}:${`${time.getUTCMinutes()}`.padStart(
    2,
    0
  )}:${`${time.getUTCSeconds()}`.padStart(2, 0)}`;
};

class RuneScape {
  static equate(xp) {
    return Math.floor(xp + 300 * Math.pow(2, xp / 7));
  }

  static level_to_xp(level) {
    let xp = 0;

    for (let i = 1; i < level; i++) xp += this.equate(i);

    return Math.floor(xp / 4);
  }

  static xp_to_level(xp) {
    let level = 1;

    while (this.level_to_xp(level) <= xp) level++;

    return --level;
  }

  static formatNumber(number, money = false) {
    if (isNaN(number)) return number;
    number = +number;
    if (number >= 1e9) return `${+(number / 1e9).toFixed(1)}b`;
    if (number >= 1e6) return `${+(number / 1e6).toFixed(1)}m`;
    if (number >= 1e3) return `${+(number / 1e3).toFixed(1)}k`;
    return money ? `${number}gp` : number;
  }

  static formatMoney(number) {
    return this.formatNumber(number, true);
  }
}

const tablePages = async (
  titles,
  results,
  prefixMessage = "",
  blockType = "prolog"
) => {
  let pages = [],
    slicePage = 0,
    currentPage = 0;
  results.forEach((result, index) => {
    let temp = [
      prefixMessage,
      `\`\`\`${blockType}`,
      ...toTableString(titles, results.slice(slicePage, index + 1)).split("\n"),
      "```",
    ];

    // Check if the string is too long for discord, if so move on to the next page
    if (temp.join("\n").length >= 1950) {
      slicePage = index;
      currentPage++;
      temp = [
        prefixMessage,
        `\`\`\`${blockType}`,
        ...toTableString(titles, results.slice(slicePage, index + 1)).split(
          "\n"
        ),
        "```",
      ];
    }
    pages[currentPage] = temp;
  });

  // Add page numbers to the top
  pages = pages.map((p, i) => {
    p[0] += ` _(page ${i + 1}/${pages.length})_`;
    return p;
  });

  return pages;
};

const postPages = async (msg, pages, page = 1) => {
  // page number should be 1 lower than expected for array
  page = Math.max(1, Math.min(pages.length, page)) - 1;

  // Send the default page,
  const botMsg = await msg.channel.send(pages[page]);

  // Don't add the reactions if only 1 page
  if (pages.length <= 1) return;

  // Add reactions
  await botMsg.react("⬅");
  await botMsg.react("➡");

  // Filters
  const backwardsFilter = (reaction, user) =>
    reaction.emoji.name === "⬅" && user.id === msg.author.id;
  const forwardsFilter = (reaction, user) =>
    reaction.emoji.name === "➡" && user.id === msg.author.id;

  // Allow reactions for up to x ms
  const timer = 1e5; // (2 minutes)
  const backwards = botMsg.createReactionCollector(backwardsFilter, {
    time: timer,
  });
  const forwards = botMsg.createReactionCollector(forwardsFilter, {
    time: timer,
  });

  backwards.on("collect", (r, user) => {
    page = page <= 0 ? 0 : --page;
    r.users.remove(user.id).catch((O_o) => {});
    botMsg.edit(pages[page]);
  });

  forwards.on("collect", (r, user) => {
    page = page >= pages.length - 1 ? pages.length - 1 : ++page;
    r.users.remove(user.id).catch((O_o) => {});
    botMsg.edit(pages[page]);
  });

  // Clear all the reactions once we aren't listening
  backwards.on("end", () =>
    botMsg.reactions.cache.forEach((reaction) => {
      reaction.users.cache.forEach((user) => {
        reaction.users.remove(user);
      });
    })
  );
};

const itemNameFromId = (itemId) => {
  const item_configs = JSON.parse(fs.readFileSync(`./${liveserver_configs_dir}/item_configs.json`, 'utf8'));

  itemname = "Unknown Item Name"
  item_configs.forEach(config => {
    if (config.id === `${itemId}`) {
      itemname = config.name;
    }
  });
  return itemname;
};

module.exports = {
  padNumber,
  toTableString,
  timeFromDates,
  RuneScape,
  tablePages,
  postPages,
  itemNameFromId
};
