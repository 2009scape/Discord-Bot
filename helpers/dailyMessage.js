const {
  error,
} = require('./logging.js');
const {
  daily_message_channel_id,
} = require('../config.json');


async function dailyMessage(guild){
  // Get the leaderboard channel
  const daily_message_channel = guild.channels.get(daily_message_channel_id);
  if (!daily_message_channel) return error('Daily message channel not found!');

  daily_message_channel.send('__**Don\'t forget to vote daily!**__\n_or i\'ll delete your runescape account..._\nhttps://www.runelocus.com/top-rsps-list/vote-46171/');
}

module.exports = {
  dailyMessage,
};
