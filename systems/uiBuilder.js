const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  mainPanel(user, data) {
    return new EmbedBuilder()
      .setColor('#00F5FF') // bright cyan
      .setAuthor({ name: `${user.username}'s Economy`, iconURL: user.displayAvatarURL() })
      .setDescription(`
💰 **Wallet:** \`${data.wallet}\`
🏦 **Bank:** \`${data.bank}\`

✨ **Level:** \`${data.level}\`
⚡ **XP:** \`${data.xp}\`

> Choose an action below 👇
`)
      .setFooter({ text: 'Economy System • Smooth UI Mode' });
  },

  mainButtons() {
    return [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('eco_work').setLabel('Work').setEmoji('💼').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('eco_daily').setLabel('Daily').setEmoji('🎁').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('eco_crime').setLabel('Crime').setEmoji('🕵️').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('eco_beg').setLabel('Beg').setEmoji('🙏').setStyle(ButtonStyle.Secondary)
      ),

      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('eco_gamble').setLabel('Gamble').setEmoji('🎲').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('eco_profile').setLabel('Profile').setEmoji('👤').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('eco_leaderboard').setLabel('Top').setEmoji('🏆').setStyle(ButtonStyle.Success)
      )
    ];
  }
};