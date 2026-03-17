const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'whois',
  description: 'Show a professional profile panel of a user.',
  usage: '.whois [@user|ID]',
  async execute(message, args, client) {
    try {
      // Fetch member
      let member;
      if (args[0]) member = await message.guild.members.fetch(args[0]).catch(() => null);
      if (!member) member = message.mentions.members.first() || message.member;
      const user = member.user;

      // Basic fields for all users
      const fields = [
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '👤 Username', value: user.username, inline: true },
        { name: '📛 Nickname', value: member.nickname || 'None', inline: true },
        { name: '🟢 Status', value: member.presence?.status || 'Offline', inline: true },
        { name: '🎉 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
      ];

      // Bot-specific info
      if (user.bot) {
        fields.push(
          { name: '🤖 Bot', value: 'Yes', inline: true },
          { name: 'Verified Bot', value: user.flags?.has('VerifiedBot') ? 'Yes' : 'No', inline: true }
        );
      }

      // Roles (human only)
      if (!user.bot) {
        const roles = member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.toString());
        fields.push({ name: `🛡 Roles [${roles.length}]`, value: roles.length ? roles.join(', ') : 'None', inline: false });
      }

      // Build embed
      const embed = new EmbedBuilder()
        .setTitle(`${user.tag} — Profile Panel`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setColor(member.displayHexColor || 'Random')
        .addFields(fields)
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('WhoIs Command Error:', err);
      message.channel.send('❌ Could not fetch profile. Make sure the user exists.');
    }
  },
};