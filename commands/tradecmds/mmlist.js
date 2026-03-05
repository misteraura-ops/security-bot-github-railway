const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'mmlist',
  description: 'Shows a list of all middlemen (auto-updates every 5 hours)',
  async execute(message, args) {

    const CLAIM_ROLE_ID = '1465699111931215903'; // Middleman role
    const channel = message.channel;

    // Function to build the embed
    async function buildEmbed() {
      // Fetch fresh members to sync
      await message.guild.members.fetch();

      const members = message.guild.members.cache.filter(m => m.roles.cache.has(CLAIM_ROLE_ID));

      const lines = members.map(m => `**• ${m.user.username}**`).join('\n');

      const embed = new EmbedBuilder()
        .setTitle('🎯 Trusted Middlemen')
        .setColor('#FFD700') // Yellow theme
        .setDescription(lines || 'No middlemen found.')
        .setFooter({ text: 'Eldorado.gg MM System • Security Bot' })
        .setTimestamp()
        .setThumbnail(message.guild.iconURL({ dynamic: true }));

      return embed;
    }

    // Send initial message
    const initialEmbed = await buildEmbed();
    const sentMessage = await channel.send({ embeds: [initialEmbed] });

    // Auto-update every 5 hours
    setInterval(async () => {
      try {
        const updatedEmbed = await buildEmbed();
        await sentMessage.edit({ embeds: [updatedEmbed] });
      } catch (err) {
        console.error('Error updating MM list embed:', err);
      }
    }, 5 * 60 * 60 * 1000); // 5 hours
  }
};