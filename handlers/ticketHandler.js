const safeReply = require("../utils/safeReply");
const { createTicket, getTicket, updateTicket } = require("../utils/ticketState");

module.exports = {

  async handleButton(interaction) {
    const id = interaction.customId;

    if (id === "create_ticket") {
      return interaction.showModal(require("../modals/createTicketModal"));
    }

    if (id === "claim_ticket") {
      const ticket = getTicket(interaction.channel.id);
      if (!ticket) return safeReply(interaction, { content: "Invalid ticket.", flags: 64 });

      if (ticket.claimerId) {
        return safeReply(interaction, { content: "Already claimed.", flags: 64 });
      }

      updateTicket(interaction.channel.id, {
        claimerId: interaction.user.id,
        status: "CLAIMED"
      });

      return safeReply(interaction, {
        content: `Ticket claimed by <@${interaction.user.id}>`
      });
    }

  },

  async handleModal(interaction) {
    if (interaction.customId === "create_ticket_modal") {
      const tradeType = interaction.fields.getTextInputValue("trade_type");
      const trader = interaction.fields.getTextInputValue("trader_id");

      const channel = await interaction.guild.channels.create({
        name: `mm-${interaction.user.username}`,
        parent: require("../config").CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: ["ViewChannel"]
          },
          {
            id: interaction.user.id,
            allow: ["ViewChannel"]
          }
        ]
      });

      createTicket({
        id: Date.now().toString(),
        channelId: channel.id,
        creatorId: interaction.user.id,
        traderId: trader || null,
        claimerId: null,
        status: "OPEN"
      });

      await safeReply(interaction, {
        content: `Ticket created: <#${channel.id}>`,
        flags: 64
      });
    }
  },

  async handleUserSelect(interaction) {
    return safeReply(interaction, {
      content: "User select not implemented yet.",
      flags: 64
    });
  }
};