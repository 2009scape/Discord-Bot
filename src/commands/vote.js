module.exports = {
  name        : 'vote',
  aliases     : [],
  description : 'Get the voting link(s)',
  args        : [],
  guildOnly   : false,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : [],
  execute     : async (msg, args) =>  msg.channel.send('Don\'t forget to vote!\nhttps://www.runelocus.com/top-rsps-list/vote-46171/'),
};
