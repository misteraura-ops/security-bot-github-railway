const { SlashCommandBuilder } = require('discord.js');
const eco = require('../../systems/economySystem');
const ui = require('../../systems/uiBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your wallet balance'),

  async execute(interaction) {
    const userData = await eco.getUser(interaction.user.id);
    const embed = ui.mainPanel(interaction.user, userData);
    await interaction.reply({ embeds: [embed], components: ui.mainButtons(), ephemeral: false });
  }
};