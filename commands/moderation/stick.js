const { PermissionsBitField } = require('discord.js');

let stickyMessages = {};

module.exports = {
  name: 'stick',
  description: 'Stick a message in the channel',

  async execute(message, args) {

    const REQUIRED_ROLE_ID = '1465697938155110411';

    const member = message.member;
    const requiredRole = message.guild.roles.cache.get(REQUIRED_ROLE_ID);

    if (!requiredRole) return;

    const hasPermission = member.roles.cache.some(r => r.position >= requiredRole.position);

    if (!hasPermission) return;

    const content = args.join(' ');
    if (!content) return message.reply('Provide a message to stick.');

    const sent = await message.channel.send({
      content: content,
      allowedMentions: { parse: [] } // prevents @everyone / @here ping
    });

    stickyMessages[message.channel.id] = {
      message: content,
      lastId: sent.id
    };

    message.delete().catch(() => {});
  }
};

// Sticky handler
module.exports.stickyListener = async (message) => {
  if (message.author.bot) return;

  const data = stickyMessages[message.channel.id];
  if (!data) return;

  try {
    const prev = await message.channel.messages.fetch(data.lastId).catch(() => null);
    if (prev) await prev.delete().catch(() => {});
  } catch {}

  const newMsg = await message.channel.send({
    content: data.message,
    allowedMentions: { parse: [] }
  });

  data.lastId = newMsg.id;
};