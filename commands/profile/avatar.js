const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'av',
  description: 'Display a user\'s avatar with a professional panel.',
  usage: '.av [@user|ID]',
  async execute(message, args, client) {
    try {
      // Fetch user
      let user;
      if (args[0]) {
        const fetchedMember = await message.guild.members.fetch(args[0]).catch(() => null);
        if (fetchedMember) user = fetchedMember.user;
      }
      if (!user) user = message.mentions.users.first() || message.author;

      // Build embed
      const avatarEmbed = new EmbedBuilder()
        .setTitle(`${user.username}'s Avatar`)
        .setURL(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setColor(user.accentColor || 'Random')
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      // Extra info for bots
      if (user.bot) {
        avatarEmbed.addFields(
          { name: '🤖 Bot', value: 'Yes', inline: true },
          { name: 'Bot ID', value: user.id, inline: true },
          { name: 'Avatar URL', value: `[Click Here](${user.displayAvatarURL({ dynamic: true })})`, inline: false }
        );
      }

      await message.channel.send({ embeds: [avatarEmbed] });
    } catch (err) {
      console.error('Avatar Command Error:', err);
      message.channel.send('❌ Could not fetch avatar. Ensure the ID/mention is valid.');
    }
  },
};