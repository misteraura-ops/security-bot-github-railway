const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'av',
  description: 'Displays a user\'s avatar.',
  usage: '.av [@user|userID]',
  async execute(message, args, client) {
    try {
      // Get the user from mention or ID, default to message author
      let user;
      if (args[0]) {
        user = await message.guild.members.fetch(args[0]).catch(() => null);
        if (user) user = user.user;
      }
      if (!user) user = message.mentions.users.first() || message.author;

      // Create embed
      const avatarEmbed = new EmbedBuilder()
        .setTitle(`${user.tag}'s Avatar`)
        .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setColor('Random')
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await message.channel.send({ embeds: [avatarEmbed] });
    } catch (err) {
      console.error('Avatar Command Error:', err);
      message.channel.send('❌ Unable to fetch avatar. Make sure the ID or mention is valid.');
    }
  },
};