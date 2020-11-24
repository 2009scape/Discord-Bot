require("dotenv").config();
const fs = require("fs");
const Discord = require("discord.js");
const { prefix, leaderboard_message_id } = require("./config.json");
const { info, warn, error } = require("./helpers/logging.js");
const RunOnInterval = require("./helpers/RunOnInterval.class.js");
const {
  updateLeaderboard,
  listenToLeaderboardReactions,
} = require("./helpers/leaderboard");
const { dailyMessage } = require("./helpers/dailyMessage");
const { connection } = require("./database.js");

const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
client.commands = new Discord.Collection();

// Load commands
const commandFiles = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// For keeping track of cooldown timers
const cooldowns = new Discord.Collection();

client.once("ready", async () => {
  info(`Logged in as ${client.user.tag}!`);

  listenToLeaderboardReactions(client);
  // Start our functions that run on specific intervals
  new RunOnInterval(
    9 * 60 * 6e4, //9 hours
    () => {
      dailyMessage(client);
    },
    false
  );
  new RunOnInterval(
    60 * 6e4, //1 Hour
    () => {
      updateLeaderboard(client, "NONE");
      updateLeaderboard(client, "STANDARD");
      updateLeaderboard(client, "ULTIMATE");
      updateLeaderboard(client, "HARDCORE");
    },
    true
  );
  new RunOnInterval(
    6e4, //1 Minute
    async () => {
      const results = await connection
        .query("SELECT COUNT(*) AS players FROM `members` WHERE online=1")
        .catch(error);
      const players = results[0] ? results[0].players : 0;
      client.user.setActivity(
        `Hop on and join us! <3`
      );
    },
    true
  );
});

client
  .on("error", (e) => error("Error Thrown:", e))
  .on("warn", (warning) => warn(warning))
  .on("message", (message) => {
    // Either not a command or a bot, ignore
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) {
      // Auto react to comments if 2+ lines start with an emoji
      const emoji_regex = /^((?:<:.+?:)\d+|[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/;
      const lines = message.content.split(/\r?\n/).map((line) => line.trim());
      const answers = lines.filter((line) => emoji_regex.test(line));
      if (answers.length < 2) return;
      const addReaction = (reaction, cb) => {
        setTimeout(async () => {
          await message.react(reaction).catch((O_o) => {});
          cb();
        }, 100);
      };

      const reactions = answers.map((answer) => answer.match(emoji_regex)[1]);
      reactions.reduce(
        (promiseChain, reaction) =>
          promiseChain.then(
            () =>
              new Promise((resolve) => {
                addReaction(reaction, resolve);
              })
          ),
        Promise.resolve()
      );
    }

    const args = message.content.slice(prefix.length).trim().split(/,?\s+/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );

    if (!command) return;

    info(`Running resolved command [${commandName}]!`);

    if (command.guildOnly && message.channel.type !== "text") {
      return message.channel.send("I can't execute that command inside DMs!");
    }

    if (
      message.channel.type === "text" &&
      message.channel
        .memberPermissions(message.member)
        .missing(command.userperms).length
    ) {
      return message.reply(
        "You do not have the required permissions to run this command."
      );
    }

    if (
      message.channel.type === "text" &&
      message.channel
        .memberPermissions(message.guild.me)
        .missing(command.botperms).length
    ) {
      return message.reply(
        "I do not have the required permissions to run this command."
      );
    }

    if (command.args.filter((arg) => !arg.endsWith("?")).length > args.length) {
      return message.channel.send([
        "You didn't provide enough command arguments!",
        `The proper usage would be: \`${prefix}${
          command.name
        }${command.args.map((arg) => ` [${arg}]`).join("")}\``,
      ]);
    }

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(
          `Please wait ${timeLeft.toFixed(
            1
          )} more second(s) before reusing the \`${command.name}\` command.`
        );
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      command.execute(message, args, commandName);
    } catch (e) {
      error("Error executing command:", e);
      message.reply("There was an error trying to execute that command!");
    }
  });

function login(token, attempt = 1) {
  info("Logging in...");
  if (!token) {
    error("There's no Discord token. See the README for details.");
  }

  client.login(token).catch((e) => {
    if (e.code == "ETIMEDOUT") {
      const minutes = Math.min(attempt, 10);
      error(
        `Login timed out (${attempt}), retrying in ${minutes} minute${
          minutes > 1 ? "s" : ""
        }...`
      );
      setTimeout(() => {
        login(token, ++attempt);
      }, minutes * 6e4);
    } else {
      error(`Login error: ${e}`);
    }
  });
}

login(process.env.DISCORD_TOKEN);
