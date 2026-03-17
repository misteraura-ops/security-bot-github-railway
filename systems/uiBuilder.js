const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  mainPanel(user, userData) {
    return new EmbedBuilder()
      .setTitle(`${user.username}'s Economy`)
      .setDescription(`💰 Balance: $${userData.money}`)
      .setColor("#1F2937")
      .setTimestamp();
  },

  mainButtons() {
    return [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("eco_work")
          .setLabel("Work")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("eco_daily")
          .setLabel("Daily")
          .setStyle(ButtonStyle.Success)
      )
    ];
  }
};