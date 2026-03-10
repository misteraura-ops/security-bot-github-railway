// events/guildInvite.js
const { EmbedBuilder } = require('discord.js');

const inviteCache = new Map();

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        try {
            const INVITE_CHANNEL_ID = '1479054141312471092';
            const inviteChannel = await member.guild.channels.fetch(INVITE_CHANNEL_ID).catch(() => null);
            if (!inviteChannel) return;

            const newInvites = await member.guild.invites.fetch();
            const oldInvites = inviteCache.get(member.guild.id);

            let usedInvite = null;

            if (oldInvites) {
                usedInvite = newInvites.find(i => {
                    const old = oldInvites.get(i.code);
                    return old && i.uses > old.uses;
                });
            }

            inviteCache.set(
                member.guild.id,
                new Map(newInvites.map(inv => [inv.code, inv]))
            );

            const inviter = usedInvite?.inviter || 'Unknown';
            const inviteCode = usedInvite?.code || 'Unknown';
            const inviteUses = usedInvite?.uses || 'Unknown';

            const embed = new EmbedBuilder()
                .setTitle('🎉 New Member Joined!')
                .setDescription(
                    `✨ ${member} has joined **Trade Market**!\n\n` +
                    `Welcome to the marketplace — trade safely and enjoy the community.`
                )
                .setColor('#8B5CF6')
                .addFields(
                    { name: '👤 Member', value: `${member}`, inline: true },
                    { name: '📨 Invited By', value: `${inviter}`, inline: true },
                    { name: '🔗 Invite Code', value: `${inviteCode}`, inline: true },
                    { name: '📊 Invite Uses', value: `${inviteUses}`, inline: true },
                    { name: '🏪 Server', value: 'Trade Market', inline: true },
                    { name: '📈 Member Count', value: `${member.guild.memberCount}`, inline: true }
                )
                .setFooter({ text: 'Trade Market • Invite Tracker' })
                .setTimestamp();

            inviteChannel.send({ embeds: [embed] });

        } catch (err) {
            console.error('Error in guildInvite event:', err);
        }
    },
};