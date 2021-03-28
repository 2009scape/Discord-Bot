module.exports = {
  name        : 'wiki',
  aliases     : [],
  description : 'Get the wiki link(s)',
  args        : [],
  guildOnly   : false,
  cooldown    : 3,
  botperms    : ['SEND_MESSAGES'],
  userperms   : [],
  execute     : async (msg, args) =>  msg.channel.send([
    'To access the Rs Wiki in 2009, you do so by adding this as a bookmark in your web browser and then clicking when you are viewing a Rs Wiki page: ',
    "javascript:window.location.href+='?action=history&year=2009&month=1';",
  ]),
};
