module.exports = {
  name        : 'exit',
  aliases     : ['kill'],
  description : 'Make the bot shutdown',
  args        : [],
  guildOnly   : true,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : ['ADMINISTRATOR'],
  execute     : async (msg, args) => {
    msg.channel.send('Exiting...').then(()=>process.exit(0));
  },
};
