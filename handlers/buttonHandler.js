const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ticketManager = require('../utils/ticketManager');

module.exports = async (interaction) => {
    try {
        const { customId, guild, member, channel } = interaction;
        const CLAIM_ROLE = guild.roles.cache.get(process.env.CLAIM_ID);
        const OWNER_ID = process.env.OWNER_ID;

        const ticket = ticketManager.activeTickets.get(channel.id);
        if (!ticket) return interaction.reply({ content: '❌ Not a valid ticket channel.', ephemeral: true });

        const updateEmbed = async (statusText) => {
            const embed = new EmbedBuilder()
                .setTitle(`🎟️ Ticket: ${channel.name}`)
                .setColor('#2B2D31')
                .setDescription(`**Creator:** <@${ticket.creatorId}>\n**Status:** ${statusText}\n\n**Trade Info:**\n${Object.entries(ticket.tradeInfo).map(([k,v]) => `• **${k}**: ${v}`).join('\n')}`)
                .setFooter({ text: 'Security MM System • Professional Trade Handling' });

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('claim').setLabel('Claim').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('unclaim').setLabel('Unclaim').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('add').setLabel('Add User').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('remove').setLabel('Remove User').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(ButtonStyle.Secondary)
                );

            await channel.send({ embeds: [embed], components: [buttons] });
        };

        switch(customId) {
            case 'claim':
                if (!member.roles.cache.has(CLAIM_ROLE?.id)) return interaction.reply({ content: '❌ No permission to claim.', ephemeral: true });
                ticket.claimedBy = member.id;
                await updateEmbed(`Claimed by <@${member.id}>`);
                return interaction.reply({ content: '✅ Ticket claimed.', ephemeral: true });

            case 'unclaim':
                if (!member.roles.cache.has(CLAIM_ROLE?.id)) return interaction.reply({ content: '❌ No permission to unclaim.', ephemeral: true });
                ticket.claimedBy = null;
                await updateEmbed('Unclaimed');
                return interaction.reply({ content: '✅ Ticket unclaimed.', ephemeral: true });

            case 'add':
                if (!member.roles.cache.has(CLAIM_ROLE?.id)) return interaction.reply({ content: '❌ No permission.', ephemeral: true });
                const userToAdd = interaction.message.mentions?.members.first();
                if (!userToAdd) return interaction.reply({ content: '❌ Mention a user to add.', ephemeral: true });
                await channel.permissionOverwrites.edit(userToAdd.id, { ViewChannel: true, SendMessages: true });
                await updateEmbed(`Added user ${userToAdd.user.tag}`);
                return interaction.reply({ content: `✅ Added ${userToAdd.user.tag}`, ephemeral: true });

            case 'remove':
                if (!member.roles.cache.has(CLAIM_ROLE?.id)) return interaction.reply({ content: '❌ No permission.', ephemeral: true });
                const userToRemove = interaction.message.mentions?.members.first();
                if (!userToRemove) return interaction.reply({ content: '❌ Mention a user to remove.', ephemeral: true });
                await channel.permissionOverwrites.edit(userToRemove.id, { ViewChannel: false });
                await updateEmbed(`Removed user ${userToRemove.user.tag}`);
                return interaction.reply({ content: `✅ Removed ${userToRemove.user.tag}`, ephemeral: true });

            case 'close':
                if (!member.roles.cache.has(CLAIM_ROLE?.id) && member.id !== OWNER_ID) return interaction.reply({ content: '❌ Only claimer or owner can close.', ephemeral: true });
                await ticketManager.closeTicket(channel);
                return interaction.reply({ content: '✅ Ticket closed & transcript saved.', ephemeral: true });
        }

    } catch (err) {
        console.error('Button Handler Error:', err);
        if (interaction.isRepliable()) await interaction.reply({ content: '❌ Button error.', ephemeral: true });
    }
};