const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports.createMMPanel = async (guild) => {
  const embed = new EmbedBuilder()
    .setTitle('🎯 Middleman Service Panel')
    .setDescription('Select a trade category to create a Middleman ticket.\n\n✅ Make sure to fill all fields correctly!')
    .setColor('Blue')
    .addFields(
      { name: 'Rules', value: '1️⃣ Be honest\n2️⃣ Provide valid user IDs\n3️⃣ Wait for CLAIM_ID to claim\n4️⃣ Avoid scams', inline: false },
      { name: 'Info', value: 'Choose the type of trade from the dropdown below to open a ticket.' }
    )
    .setFooter({ text: 'Kai Kingdom | Trusted Middleman Services' });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('mm_category')
    .setPlaceholder('Select trade category')
    .addOptions([
      { label: 'Crypto', value: 'crypto', description: 'Digital currency trade' },
      { label: 'In-game Items', value: 'ingame', description: 'Game items & currencies' },
      { label: 'Roblox', value: 'roblox', description: 'Roblox items/currency' },
      { label: 'Steam', value: 'steam', description: 'Steam items or games' },
      { label: 'Gift Cards', value: 'giftcards', description: 'Various gift cards' },
      { label: 'NFTs', value: 'nft', description: 'Non-fungible tokens' },
      { label: 'Other', value: 'other', description: 'Any other trade' }
    ]);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  return { embeds: [embed], components: [row] };
};

module.exports.handleInteraction = async (interaction, client) => {
  if (interaction.isStringSelectMenu() && interaction.customId === 'mm_category') {
    const category = interaction.values[0];
    const modal = new ModalBuilder()
      .setCustomId(`mm_modal_${category}`)
      .setTitle(`${category} Trade Form`);

    // Example fields
    const fields = [
      { id: 'trader', label: 'Trader User', placeholder: '@User', style: TextInputStyle.Short },
      { id: 'item', label: 'Item/Asset', placeholder: 'Item name or BTC', style: TextInputStyle.Short },
      { id: 'amount', label: 'Amount/Price', placeholder: '0.01 BTC / $20', style: TextInputStyle.Short },
      { id: 'notes', label: 'Additional Notes', placeholder: 'Any info/warnings', style: TextInputStyle.Paragraph }
    ];

    fields.forEach(f => {
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(f.id)
            .setLabel(f.label)
            .setStyle(f.style)
            .setPlaceholder(f.placeholder)
            .setRequired(true)
        )
      );
    });

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('mm_modal_')) {
    const values = {};
    interaction.fields.fields.forEach((f, k) => values[k] = f.value);

    // Tickets category
    let category = interaction.guild.channels.cache.find(c => c.name === 'Tickets' && c.type === 4);
    if (!category) {
      category = await interaction.guild.channels.create({ name: 'Tickets', type: 4 });
    }

    // Ticket channel
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: 0,
      parent: category.id,
      permissionOverwrites: [
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: process.env.CLAIM_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle('📝 New Middleman Ticket')
      .addFields(
        { name: 'Trader', value: values.trader },
        { name: 'Item/Asset', value: values.item },
        { name: 'Amount/Price', value: values.amount },
        { name: 'Notes', value: values.notes }
      )
      .setColor('Green')
      .setFooter({ text: `Ticket ID: ${ticketChannel.id}` });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('add_user').setLabel('Add User').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('remove_user').setLabel('Remove User').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setStyle(ButtonStyle.Secondary)
      );

    await ticketChannel.send({ content: `<@${interaction.user.id}> <@&${process.env.CLAIM_ID}>`, embeds: [embed], components: [row] });
    return interaction.reply({ content: `✅ Ticket created: ${ticketChannel}`, ephemeral: true });
  }
};