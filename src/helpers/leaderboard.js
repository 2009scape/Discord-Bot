const { error } = require("./logging.js");
const { RuneScape } = require("./functions.js");
const {
  leaderboard_channel_id,
  leaderboard_message_id,
  leaderboard_ironman_message_id,
  leaderboard_ultimate_ironman_message_id,
  leaderboard_hardcore_ironman_message_id,
} = require("../config.json");
const { connection } = require("../database.js");

const skills = [
  {
    name: "Attack",
    emoji: "700168466073911339",
  },
  {
    name: "Defence",
    emoji: "700168465994088458",
  },
  {
    name: "Strength",
    emoji: "700168466333958174",
  },
  {
    name: "Hitpoints",
    emoji: "700168465964597259",
  },
  {
    name: "Ranged",
    emoji: "700168465985700000",
  },
  {
    name: "Prayer",
    emoji: "700168465885167668",
  },
  {
    name: "Magic",
    emoji: "700168465725521972",
  },
  {
    name: "Cooking",
    emoji: "700168465939562527",
  },
  {
    name: "Woodcutting",
    emoji: "700168466031968306",
  },
  {
    name: "Fletching",
    emoji: "700168465817927792",
  },
  {
    name: "Fishing",
    emoji: "700168465993957376",
  },
  {
    name: "Firemaking",
    emoji: "700168466099077131",
  },
  {
    name: "Crafting",
    emoji: "700168465608081439",
  },
  {
    name: "Smithing",
    emoji: "700168466166054912",
  },
  {
    name: "Mining",
    emoji: "700168466078105620",
  },
  {
    name: "Herblore",
    emoji: "700168465885167667",
  },
  {
    name: "Agility",
    emoji: "700168465981374554",
  },
  {
    name: "Thieving",
    emoji: "700168466099077211",
  },
  {
    name: "Slayer",
    emoji: "700168466006671410",
  },
  {
    name: "Farming",
    emoji: "700168465771659266",
  },
  {
    name: "Runecrafting",
    emoji: "700168465994219530",
  },
  {
    name: "Hunter",
    emoji: "700168466199478413",
  },
  {
    name: "Construction",
    emoji: "700168465692098642",
  },
  {
    name: "Summoning",
    emoji: "700168466287820880",
  },
  {
    name: "Wealth",
    emoji: "700170208719011890",
  },
];

const ironmanModes = {
  NONE: {
    icon: "<:Yellow_partyhat:700168466027642941>",
    label: "",
    message_id: leaderboard_message_id,
  },
  STANDARD: {
    icon: "<:Ironman_chat_badge:700168465675190393>",
    label: "(Ironman)",
    message_id: leaderboard_ironman_message_id,
  },
  HARDCORE: {
    icon: "<:Hardcore_ironman_chat_badge:700168466019385495>",
    label: "(Hardcore Ironman)",
    message_id: leaderboard_hardcore_ironman_message_id,
  },
  ULTIMATE: {
    icon: "<:Ultimate_ironman_chat_badge:700168466292015104>",
    label: "(Ultimate Ironman)",
    message_id: leaderboard_ultimate_ironman_message_id,
  },
};

async function getTop(amount = 25, skill_id = 0, ironman = "NONE") {
  if (skill_id == 24)
    // Wealth
    return await connection
      .query(
        `SELECT username, netWorth AS wealth FROM members WHERE ironManMode='${ironman}' ORDER BY netWorth DESC LIMIT ${amount}`
      )
      .catch(error);
  else if (skill_id >= 0)
    // Skill
    return await connection
      .query(
        `SELECT username, xp_${skill_id} AS xp FROM highscores WHERE ironManMode='${ironman}' ORDER BY xp_${skill_id} DESC LIMIT ${amount}`
      )
      .catch(error);
  // Overall
  else
    return await connection
      .query(
        `SELECT username, overall_xp AS xp, total_level AS level FROM highscores WHERE ironManMode='${ironman}' ORDER BY total_level DESC, overall_xp DESC LIMIT ${amount}`
      )
      .catch(error);
}

function updateLeaderboard(client, ironmanMode = "NONE", reaction = "null") {
  const skill_id = skills.findIndex((skill) => skill.emoji == reaction);

  // Get the leaderboard channel
  client.channels.fetch(leaderboard_channel_id).then((leaderboard_channel) => {
    if (!leaderboard_channel) return error("Leaderboard channel not found!");

    // Get the message to be edited (must already exist)
    leaderboard_channel.messages
      .fetch(ironmanModes[ironmanMode].message_id)
      .then(async (leaderboard_message) => {
        if (!leaderboard_message)
          return error("Leaderboard message to edit not found!");

        // Get the results
        const results = await getTop(25, skill_id, ironmanMode);
        const output = [
          `${
            ironmanModes[ironmanMode].icon || ironmanModes.NONE.icon
          } __***Top ${results.length} ${
            skills[skill_id] ? skills[skill_id].name : "Overall"
          }:***__ ${ironmanModes[ironmanMode].label || ""}`,
          ...results.map(
            (res, place) =>
              `**#${place + 1}** \`${
                res.wealth != null
                  ? RuneScape.formatMoney(res.wealth).padStart(6, " ")
                  : `level ${
                      skills[skill_id]
                        ? RuneScape.xp_to_level(res.xp)
                            .toString()
                            .padEnd(3, " ")
                        : res.level.toString().padEnd(4, " ")
                    } (${RuneScape.formatNumber(res.xp)} xp)`
              }\` **${res.username}**`
          ),
          "",
          "_React with a skill emoji to change leaderboards._",
        ];

        // Remove user reactions
        leaderboard_message.reactions.cache.forEach((reaction) => {
          reaction.users.cache.forEach((user) => {
            if (!user.bot) reaction.users.remove(user);
          });
        });

        /*// DISABLED FOR NOW, ONLY NEEDED ON INITIAL RUN
        // Add default reactions
        const addReaction = (message, reaction, cb) => {
          setTimeout(async () => {
            console.log(reaction);
            await message.react(reaction).catch((O_o) => {});
            cb();
          }, 100);
        };

        const reactions = skills
          .filter((skill) =>
            [
              "Attack",
              "Strength",
              "Defence",
              "Magic",
              "Ranged",
              "Hitpoints",
              "Wealth",
            ].includes(skill.name)
          )
          .map((skill) => {
            return skill.emoji;
          });
        reactions.reduce(
          (promiseChain, reaction) =>
            promiseChain.then(
              () =>
                new Promise((resolve) => {
                  addReaction(leaderboard_message, reaction, resolve);
                })
            ),
          Promise.resolve()
        );
        */

        leaderboard_message.edit(output);
      });
  });
}

async function listenToLeaderboardReactions(client) {
  client.on("messageReactionAdd", async (reaction, user) => {
    await reaction.fetch();
    switch (reaction.message.id) {
      case leaderboard_message_id:
        return updateLeaderboard(client, "NONE", reaction.emoji.id);
      case leaderboard_ironman_message_id:
        return updateLeaderboard(client, "STANDARD", reaction.emoji.id);
      case leaderboard_hardcore_ironman_message_id:
        return updateLeaderboard(client, "HARDCORE", reaction.emoji.id);
      case leaderboard_ultimate_ironman_message_id:
        return updateLeaderboard(client, "ULTIMATE", reaction.emoji.id);
    }
  });

  /*const filter = (reaction, user) => !user.bot;
  leaderboard_message
    .awaitReactions(filter, { max: 1 })
    .then((collected) => {
      const reaction = collected.first();
      updateLeaderboard(guild, ironmanMode, reaction.emoji.id);
    })
    .catch(error);*/
}

module.exports = {
  updateLeaderboard,
  listenToLeaderboardReactions,
};
