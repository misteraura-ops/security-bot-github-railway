const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  mainPanel(user, userData) {
    return new EmbedBuilder()
      .setTitle(`${user.username}'s Wallet 💰`)
      .setColor('#f1c40f')
      .setDescription(`Balance: **$${userData.money}**`)
      .setTimestamp()
      .setFooter({ text: 'Greed Bot Economy Panel' });
  },

  mainButtons() {
    return [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('eco_work').setLabel('💼 Work').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('eco_daily').setLabel('🎁 Daily').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('eco_gamble').setLabel('🎲 Gamble').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('eco_balance').setLabel('💰 Balance').setStyle(ButtonStyle.Secondary)
      )
    ];
  }
};