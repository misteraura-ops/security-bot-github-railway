const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'av',
  description: 'Displays a professional avatar panel.',
  usage: '.av [@user|userID]',
  async execute(message, args, client) {
    try {
      let user;
      if (args[0]) {
        const member = await message.guild.members.fetch(args[0]).catch(() => null);
        if (member) user = member.user;
      }
      if (!user) user = message.mentions.users.first() || message.author;

      const isBot = user.bot ? '🤖 Bot' : '👤 Human';
      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${user.tag} Avatar ${isBot}`)
        .setDescription(isBot === '🤖 Bot' ? 'This is a bot account. Certain user info may not apply.' : '')
        .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }))
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('Avatar Command Error:', err);
      message.channel.send('❌ Unable to fetch avatar. Make sure the ID or mention is valid.');
    }
  },
};