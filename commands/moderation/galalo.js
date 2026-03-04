const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'galalo',
  description: 'Dynamic offer panel command with countdown',
  async execute(message, args, client) {

    // Only CLAIM_ID role can use
    if (!message.member.roles.cache.has(process.env.CLAIM_ID)) return;

    const targetUser = message.mentions.members.first();
    if (!targetUser) return;

    const regex = /"([^"]+)"/g;
    const matches = [...message.content.matchAll(regex)];
    const heading = matches[0]?.[1] || 'Exclusive Offer';
    const description = matches[1]?.[1] || `<@${targetUser.id}>, you have a unique chance to participate in our system!`;

    const H1T_ROLE = message.guild.roles.cache.get(process.env.H1T_ROLE);
    const BLACKLIST_ROLE = message.guild.roles.cache.get(process.env.BLACKLIST_ROLE);
    if (!H1T_ROLE || !BLACKLIST_ROLE) return;

    // Embed with countdown
    let timer = 180; // 3 min
    const embed = new EmbedBuilder()
      .setTitle(`✨ ${heading} ✨`)
      .setDescription(`${description}\n\n⏱ Time left: ${timer}s`)
      .setColor('#3498db')
      .setFooter({ text: `Interactive Offer • Only ${targetUser.user.tag} can respond` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('acceptOffer')
        .setLabel('✅ Accept Offer')
        .setEmoji('🟢')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('rejectOffer')
        .setLabel('❌ Decline Offer')
        .setEmoji('🔴')
        .setStyle(ButtonStyle.Danger)
    );

    const panelMessage = await message.channel.send({ embeds: [embed], components: [row] });

    // Countdown interval
    const interval = setInterval(async () => {
      timer--;
      if (timer <= 0) {
        clearInterval(interval);
        return panelMessage.edit({ content: '⏱ Offer expired without response.', embeds: [], components: [] });
      }
      const newEmbed = EmbedBuilder.from(embed).setDescription(`${description}\n\n⏱ Time left: ${timer}s`);
      panelMessage.edit({ embeds: [newEmbed] }).catch(() => {});
    }, 1000);

    // Collector
    const collector = panelMessage.createMessageComponentCollector({ time: 180000 });

    collector.on('collect', async interaction => {
      if (interaction.user.id !== targetUser.id)
        return interaction.reply({ content: '⚠️ Only the mentioned user can interact.', ephemeral: true });

      await interaction.deferUpdate();
      clearInterval(interval);

      if (interaction.customId === 'acceptOffer') {
        try {
          await targetUser.roles.add(H1T_ROLE);
          const acceptedEmbed = new EmbedBuilder()
            .setTitle('🎉 Offer Accepted 🎉')
            .setDescription(`<@${targetUser.id}> accepted!\n✅ Granted **${H1T_ROLE.name}**.\n💰 Potential reward: 100–500 coins`)
            .setColor('#2ecc71')
            .setFooter({ text: 'Good choice!' })
            .setTimestamp();

          panelMessage.edit({ embeds: [acceptedEmbed], components: [] });
        } catch {
          panelMessage.edit({ content: '❌ Failed to assign role.', embeds: [], components: [] });
        }
      }

      if (interaction.customId === 'rejectOffer') {
        try {
          await targetUser.roles.add(BLACKLIST_ROLE);
          const rejectedEmbed = new EmbedBuilder()
            .setTitle('❌ Offer Declined ❌')
            .setDescription(`<@${targetUser.id}> declined.\nAssigned **${BLACKLIST_ROLE.name}**.`)
            .setColor('#e74c3c')
            .setFooter({ text: 'Better luck next time!' })
            .setTimestamp();

          panelMessage.edit({ embeds: [rejectedEmbed], components: [] });
        } catch {
          panelMessage.edit({ content: '❌ Failed to assign role.', embeds: [], components: [] });
        }
      }

      collector.stop();
    });

    collector.on('end', collected => {
      clearInterval(interval);
      if (!collected.size)
        panelMessage.edit({ content: '⏱ Panel expired without response.', embeds: [], components: [] });
    });

  }
};