const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'whois',
  description: 'Displays detailed information about a user.',
  usage: '.whois [@user|userID]',
  async execute(message, args, client) {
    try {
      // Get user
      let member;
      if (args[0]) {
        member = await message.guild.members.fetch(args[0]).catch(() => null);
      }
      if (!member) member = message.mentions.members.first() || message.member;

      const user = member.user;

      const embed = new EmbedBuilder()
        .setTitle(`User Info: ${user.tag}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setColor('Random')
        .addFields(
          { name: '🆔 ID', value: `${user.id}`, inline: true },
          { name: '👤 Username', value: `${user.username}`, inline: true },
          { name: '📛 Nickname', value: `${member.nickname || 'None'}`, inline: true },
          { name: '🟢 Status', value: `${member.presence?.status || 'Offline'}`, inline: true },
          { name: '🎉 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
          { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('WhoIs Command Error:', err);
      message.channel.send('❌ Could not fetch user info. Make sure the user exists in this server.');
    }
  },
};