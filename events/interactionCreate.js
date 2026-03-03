const { Events } = require('discord.js');
const ticketManager = require('../utils/ticketManager');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    try {

      // -------------------------
      // SELECT MENUS (Tickets)
      // -------------------------
      if (interaction.isStringSelectMenu()) {
        if (interaction.replied || interaction.deferred) return;
        return await ticketManager.handleCategorySelect(interaction, client);
      }

      // -------------------------
      // MODALS (Tickets)
      // -------------------------
      if (interaction.isModalSubmit()) {
        if (interaction.replied || interaction.deferred) return;
        return await ticketManager.handleModal(interaction, client);
      }

      // -------------------------
      // BUTTONS (ONLY ticket ones)
      // -------------------------
      if (interaction.isButton()) {

        // ⚠️ Only handle ticket buttons here
        // Prevents conflict with collectors in other commands
        if (!interaction.customId.startsWith('ticket_')) return;

        if (interaction.replied || interaction.deferred) return;
        return await ticketManager.handleButton(interaction, client);
      }

    } catch (error) {
      console.error('❌ InteractionCreate Error:', error);

      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Something went wrong.',
          flags: 64 // ephemeral (new method)
        }).catch(() => {});
      }
    }
  }
};