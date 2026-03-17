const { SlashCommandBuilder } = require('discord.js');
const eco = require('../../systems/economySystem');
const ui = require('../../systems/uiBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work to earn money'),

  async execute(interaction) {
    const userData = await eco.getUser(interaction.user.id);
    const ready = await eco.checkCooldown(interaction.user.id, 'lastWork', 5 * 60 * 1000);
    if (!ready) return interaction.reply({ content: '⏳ You are tired. Try again later.', ephemeral: true });

    await eco.addMoney(interaction.user.id, Math.floor(Math.random() * 400 + 100));
    await eco.setCooldown(interaction.user.id, 'lastWork');

    const updated = await eco.getUser(interaction.user.id);
    await interaction.reply({ embeds: [ui.mainPanel(interaction.user, updated)], components: ui.mainButtons() });
  }
};
