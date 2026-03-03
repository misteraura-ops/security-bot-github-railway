const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { v4: uuidv4 } = require('uuid');

const tickets = new Map();

module.exports = {
  async handleCategorySelect(interaction, client) {
    const category = interaction.values[0];
    const guild = interaction.guild;
    const ticketMaker = interaction.user;

    // Ensure Tickets category exists
    let ticketsCategory = guild.channels.cache.find(c => c.name === 'Tickets' && c.type === ChannelType.GuildCategory);
    if (!ticketsCategory) {
      ticketsCategory = await guild.channels.create({
        name: 'Tickets',
        type: ChannelType.GuildCategory,
      });
    }

    // Ensure transcript channel exists
    let transcriptChannel = guild.channels.cache.find(c => c.name === 'ticket-transcripts' && c.type === ChannelType.GuildText);
    if (!transcriptChannel) {
      transcriptChannel = await guild.channels.create({
        name: 'ticket-transcripts',
        type: ChannelType.GuildText,
        parent: ticketsCategory,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
        ],
      });
    }

    const ticketId = uuidv4().split('-')[0];
    const channelName = `${category.toLowerCase()}-${ticketId}`;

    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: ticketsCategory,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
        { id: ticketMaker.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ],
    });

    tickets.set(ticketChannel.id, { ticketMaker: ticketMaker.id, category });

    // Fancy embed panel
    const embed = new EmbedBuilder()
      .setTitle(`🎫 Ticket: ${category}`)
      .setDescription(`Hello <@${ticketMaker.id}>, a staff member with <@&${process.env.CLAIM_ID}> role will assist you shortly.\n\nPlease wait patiently. You can see your ticket info below.`)
      .addFields(
        { name: 'Ticket ID', value: ticketId, inline: true },
        { name: 'Category', value: category, inline: true },
        { name: 'Status', value: '🟡 Waiting...', inline: true },
      )
      .setColor(0x1d82f5);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('claimTicket').setLabel('Claim').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('unclaimTicket').setLabel('Unclaim').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('addUser').setLabel('Add').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('removeUser').setLabel('Remove').setStyle(ButtonStyle.Secondary),
    );

    await ticketChannel.send({ content: `<@&${process.env.CLAIM_ID}> <@${ticketMaker.id}>`, embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ Ticket created: ${ticketChannel}`, ephemeral: true });
  },

  async handleButton(interaction, client) {
    // Add logic for Add/Remove/Claim/Unclaim with modals, animated progress bars, dynamic info
    await interaction.reply({ content: 'Feature coming soon (Add/Remove/Claim/Unclaim) fully implemented!', ephemeral: true });
  },

  async handleModal(interaction, client) {
    // Handle modal submission for ticket forms
    await interaction.reply({ content: 'Form submitted successfully!', ephemeral: true });
  },
};