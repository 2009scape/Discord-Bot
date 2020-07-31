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
    'https://github.com/2009scape/2009Scape/wiki',
    'https://runescape.wiki/ then find the page you are looking for and add `?action=history&year=2009&month=1` to the end of the URI',
  ]),
};
