const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'galalo',
  description: 'Dynamic offer panel command',
  async execute(message, args, client) {

    // Only CLAIM_ID role can use
    if (!message.member.roles.cache.has(process.env.CLAIM_ID)) return;

    // Must mention a user
    const targetUser = message.mentions.members.first();
    if (!targetUser) return; // silently do nothing

    // Extract heading and description dynamically
    // Usage: .galalo @user "Heading Here" "Description Here"
    const regex = /"([^"]+)"/g;
    const matches = [...message.content.matchAll(regex)];

    const heading = matches[0]?.[1] || 'Hitting Application';
    const description = matches[1]?.[1] || 
`<@${targetUser.id}>, we regret to inform you that you have been scammed.  
However, there is a way to recover losses and potentially earn 2x–100x if you're active.  

**What is Hitting?**  
Hitting is where fake middlemans are used to scam others. You can join our system and participate safely.  

Click **Accept** or **Decline** to choose. You have 3 minutes to respond.`;

    // Roles from .env
    const H1T_ROLE = message.guild.roles.cache.get(process.env.H1T_ROLE);
    const BLACKLIST_ROLE = message.guild.roles.cache.get(process.env.BLACKLIST_ROLE);
    if (!H1T_ROLE || !BLACKLIST_ROLE) return;

    // Embed
    const embed = new EmbedBuilder()
      .setTitle(`✨ ${heading} ✨`)
      .setDescription(description)
      .setColor('#00FFAA')
      .setFooter({ text: 'Only the mentioned user can click the buttons.' })
      .setTimestamp();

    // Buttons
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

    // Send panel
    const panelMessage = await message.channel.send({ embeds: [embed], components: [row] });

    // Collector
    const collector = panelMessage.createMessageComponentCollector({ time: 180000 });

    collector.on('collect', async interaction => {
      if (interaction.user.id !== targetUser.id)
        return interaction.reply({ content: '⚠️ Only the mentioned user can interact.', ephemeral: true });

      await interaction.deferUpdate();

      if (interaction.customId === 'acceptOffer') {
        try {
          await targetUser.roles.add(H1T_ROLE);
          const acceptedEmbed = new EmbedBuilder()
            .setTitle('🎉 Offer Accepted 🎉')
            .setDescription(`<@${targetUser.id}> accepted the offer!\n✅ Granted **${H1T_ROLE.name}**.`)
            .setColor('#00FF00')
            .setFooter({ text: 'Good choice!' })
            .setTimestamp();

          await panelMessage.edit({ embeds: [acceptedEmbed], components: [] });
        } catch {
          await panelMessage.edit({ content: '❌ Failed to assign role.', embeds: [], components: [] });
        }
      }

      if (interaction.customId === 'rejectOffer') {
        try {
          await targetUser.roles.add(BLACKLIST_ROLE);
          const rejectedEmbed = new EmbedBuilder()
            .setTitle('⚠️ Offer Declined ⚠️')
            .setDescription(`<@${targetUser.id}> declined the offer!\n❌ Assigned **${BLACKLIST_ROLE.name}**.`)
            .setColor('#FF0000')
            .setFooter({ text: 'Bad choice!' })
            .setTimestamp();

          await panelMessage.edit({ embeds: [rejectedEmbed], components: [] });
        } catch {
          await panelMessage.edit({ content: '❌ Failed to assign role.', embeds: [], components: [] });
        }
      }

      collector.stop();
    });

    collector.on('end', collected => {
      if (!collected.size)
        panelMessage.edit({ content: '⏱ Panel expired without response.', embeds: [], components: [] });
    });

  }
};