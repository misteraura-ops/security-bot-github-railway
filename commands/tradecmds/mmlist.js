const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'mmlist',
  description: 'Shows all middlemen with vouches and highest role (paginated)',
  async execute(message, args) {

    const CLAIM_ROLE_ID = '1465699111931215903'; // Middleman role
    const mmVouchesPath = path.join(__dirname, '../../db/mmVouches.json');
    const vouchData  = fs.existsSync(mmVouchesPath) ? JSON.parse(fs.readFileSync(mmVouchesPath)) : {};

    // Fetch all members to include everyone with the role
    await message.guild.members.fetch();

    const members = message.guild.members.cache.filter(m => m.roles.cache.has(CLAIM_ROLE_ID));

    if (!members.size) return message.channel.send('⚠️ No middlemen found in the server.');

    // Map member info with highest role ping
    const memberList = members.map(m => {
      const vouches = vouchData[m.id] || 0;
      const highestRole = m.roles.highest.id !== message.guild.id // exclude @everyone
        ? `<@&${m.roles.highest.id}>` 
        : 'No special role';
      return `**• ${m.displayName}** [${highestRole}]\n> ✨ Vouches: **${vouches}**`;
    });

    // Sort descending by vouches
    memberList.sort((a, b) => {
      const vA = parseInt(a.match(/\*\*(\d+)\*\*/)[1]);
      const vB = parseInt(b.match(/\*\*(\d+)\*\*/)[1]);
      return vB - vA;
    });

    // Pagination
    const pageSize = 10; // members per page
    let page = 0;
    const totalPages = Math.ceil(memberList.length / pageSize);

    const generateEmbed = (pageIndex) => {
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      const currentMembers = memberList.slice(start, end);

      return new EmbedBuilder()
        .setTitle('🎯 Eldorado.gg Trusted Middlemen')
        .setColor('#FFD700') // yellow theme
        .setDescription(currentMembers.join('\n\n'))
        .setFooter({ text: `Page ${pageIndex + 1} / ${totalPages} • Eldorado.gg MM System` })
        .setTimestamp()
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setAuthor({ name: 'Middlemen List', iconURL: message.guild.iconURL({ dynamic: true }) });
    };

    // Buttons for pagination
    const prevButton = new ButtonBuilder().setCustomId('prevPage').setLabel('⬅️ Previous').setStyle(ButtonStyle.Primary);
    const nextButton = new ButtonBuilder().setCustomId('nextPage').setLabel('Next ➡️').setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(prevButton, nextButton);

    const msg = await message.channel.send({ embeds: [generateEmbed(page)], components: [row] });

    const collector = msg.createMessageComponentCollector({ time: 5 * 60 * 1000 }); // 5 minutes

    collector.on('collect', i => {
      if (i.user.id !== message.author.id) return i.reply({ content: '❌ Only the command user can navigate.', ephemeral: true });

      if (i.customId === 'nextPage') {
        page = (page + 1) % totalPages;
      } else if (i.customId === 'prevPage') {
        page = (page - 1 + totalPages) % totalPages;
      }

      i.update({ embeds: [generateEmbed(page)], components: [row] });
    });

    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};