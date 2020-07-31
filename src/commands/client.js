module.exports = {
  name        : 'client',
  aliases     : [],
  description : 'Get the latest client download link(s)',
  args        : [],
  guildOnly   : false,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : [],
  execute     : async (msg, args) =>  msg.channel.send('Download the latest client here:\nhttps://github.com/2009scape/2009Scape/releases/latest/download/2009Scape.jar'),
};
