const { EmbedBuilder, userFlags } = require('discord.js');

module.exports = {
  name: 'whois',
  description: 'Displays a professional Dyno/Carl-like profile panel for a user.',
  usage: '.whois [@user|userID]',
  async execute(message, args, client) {
    try {
      let member;
      if (args[0]) {
        member = await message.guild.members.fetch(args[0]).catch(() => null);
      }
      if (!member) member = message.mentions.members.first() || message.member;

      const user = member.user;

      // Convert badges (flags) to emoji / readable strings
      const badges = user.flags?.toArray() || [];
      const badgeDisplay = badges.length ? badges.map(b => `\`${b}\``).join(' | ') : 'None';

      // User status
      const statusMap = {
        online: '🟢 Online',
        idle: '🌙 Idle',
        dnd: '⛔ Do Not Disturb',
        offline: '⚫ Offline',
      };
      const status = member.presence?.status ? statusMap[member.presence.status] : '⚫ Offline';

      // Nitro / Boost info
      const isNitro = user.avatar?.startsWith('a_') ? '💎 Nitro Animated Avatar' : '—';

      // Determine if user is a bot
      const isBot = user.bot ? '🤖 Bot' : '👤 Human';

      // Roles (humans only)
      const roles = !user.bot
        ? member.roles.cache
            .filter(r => r.id !== message.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(r => r.toString())
            .slice(0, 10)
            .join(', ') || 'None'
        : '—';

      // Dates (humans only)
      const joinedAt = !user.bot
        ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
        : '—';
      const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;

      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${user.tag} ${isBot}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
        .addFields(
          { name: '🆔 ID', value: `${user.id}`, inline: true },
          { name: 'Status', value: status, inline: true },
          { name: 'Nitro', value: isNitro, inline: true },
          { name: 'Badges', value: badgeDisplay, inline: false },
          { name: 'Joined Server', value: joinedAt, inline: true },
          { name: 'Account Created', value: createdAt, inline: true },
          { name: 'Top Roles', value: roles, inline: false }
        )
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('WhoIs Command Error:', err);
      message.channel.send('❌ Could not fetch user info. Make sure the user exists.');
    }
  },
};