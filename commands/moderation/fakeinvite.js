// commands/fakeinvite.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fakeinvite',
    description: 'Simulates an invite for testing the panel with two random users',
    async execute(message, args) {
        const ALLOWED_USER_ID = '1112091588462649364';
        const INVITE_CHANNEL_ID = '1479054141312471092';

        if (message.author.id !== ALLOWED_USER_ID) return; // silently ignore others

        const guild = message.guild;

        // Filter out bots
        const members = guild.members.cache.filter(m => !m.user.bot);
        if (members.size < 2) return message.reply('❌ Not enough members to simulate.');

        // Pick two completely random members
        let invitedMember = members.random();
        let inviterMember = members.random();

        // Ensure they are not the same user
        while (inviterMember.id === invitedMember.id) {
            inviterMember = members.random();
        }

        // Generate fake invite count (for testing)
        const fakeInviteCount = Math.floor(Math.random() * 50) + 1;

        // Create professional panel embed
        const embed = new EmbedBuilder()
            .setTitle('🎉 New Invite!')
            .setDescription(`${invitedMember} has joined the server via an invite!`)
            .setColor('#00BFFF')
            .addFields(
                { name: 'Invited Member', value: `${invitedMember}`, inline: true },
                { name: 'Inviter', value: `${inviterMember}`, inline: true },
                { name: 'Total Invites', value: `${fakeInviteCount}`, inline: true }
            )
            .setFooter({ text: 'Kai Kingdom Invite Tracker • Test Panel' })
            .setTimestamp();

        // Send embed to the invite panel channel
        const inviteChannel = await guild.channels.fetch(INVITE_CHANNEL_ID).catch(() => null);
        if (!inviteChannel) return;

        inviteChannel.send({ embeds: [embed] });
        message.reply(`✅ Fake invite simulated: ${inviterMember.user.tag} invited ${invitedMember.user.tag}`);
    }
};