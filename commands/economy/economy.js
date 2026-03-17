const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const eco = require('../../systems/economySystem');
const ui = require('../../systems/uiBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Open the economy panel'),

  async execute(interaction) {
    const user = await eco.getUser(interaction.user.id);

    const embed = ui.mainPanel(interaction.user, user);

    const buttons = ui.mainButtons();

    await interaction.reply({
      embeds: [embed],
      components: buttons
    });
  }
};