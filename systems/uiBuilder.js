const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  mainPanel(user, data) {
    return new EmbedBuilder()
      .setTitle(`${user.username}'s Wallet 💰`)
      .setDescription(`Balance: **$${data.money}**`)
      .setColor("#f1c40f");
  },

  mainButtons() {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("eco_work")
          .setLabel("💼 Work")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("eco_daily")
          .setLabel("🎁 Daily")
          .setStyle(ButtonStyle.Success)
      );
    return [row];
  }
};