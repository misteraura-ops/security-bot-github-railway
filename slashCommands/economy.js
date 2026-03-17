const { SlashCommandBuilder } = require("discord.js");
const eco = require("../systems/economySystem");
const ui = require("../systems/uiBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("economy")
    .setDescription("Shows your economy panel"),

  async execute(interaction) {
    const userData = eco.getUser(interaction.user.id);
    await interaction.reply({
      embeds: [ui.mainPanel(interaction.user, userData)],
      components: ui.mainButtons(),
      ephemeral: false
    });
  }
};