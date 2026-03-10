// commands/fakeinvite.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fakeinvite',
    description: 'Simulates invite events for testing the panel',
    async execute(message, args) {
        const ALLOWED_USER_ID = '1112091588462649364';
        const INVITE_CHANNEL_ID = '1479054141312471092';

        if (message.author.id !== ALLOWED_USER_ID) return;

        const guild = message.guild;

        const members = guild.members.cache.filter(m => !m.user.bot);
        if (members.size < 2) return message.reply('❌ Not enough members to simulate invite.');

        const shuffled = members.random(2);
        const member = shuffled[0];
        const inviter = shuffled[1];

        const inviteCodes = ['tmA92', 'trade7X', 'market88', 'safeMM1', 'tmVIP'];
        const randomCode = inviteCodes[Math.floor(Math.random() * inviteCodes.length)];

        const inviteUses = Math.floor(Math.random() * 50) + 1;

        const scenarios = ['normal', 'vanity', 'bot', 'alt'];
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

        let description = '';
        let fields = [];

        if (scenario === 'normal') {
            description = `✨ ${member} joined **Trade Market** using an invite.`;
            fields = [
                { name: '👤 Member', value: `${member}`, inline: true },
                { name: '📨 Invited By', value: `${inviter}`, inline: true },
                { name: '🔗 Invite Code', value: `${randomCode}`, inline: true },
                { name: '📊 Invite Uses', value: `${inviteUses}`, inline: true }
            ];
        }

        if (scenario === 'vanity') {
            description = `⭐ ${member} joined **Trade Market** using the **vanity invite**.`;
            fields = [
                { name: '👤 Member', value: `${member}`, inline: true },
                { name: '🔗 Invite Type', value: 'Vanity URL', inline: true },
                { name: '🏪 Server', value: 'Trade Market', inline: true }
            ];
        }

        if (scenario === 'bot') {
            description = `🤖 ${member} joined **Trade Market** (Bot detected).`;
            fields = [
                { name: '🤖 Bot', value: `${member}`, inline: true },
                { name: '📨 Added By', value: `${inviter}`, inline: true },
                { name: '🏪 Server', value: 'Trade Market', inline: true }
            ];
        }

        if (scenario === 'alt') {
            description = `⚠️ ${member} joined **Trade Market**.\nPossible **new/alt account detected**.`;
            fields = [
                { name: '👤 Member', value: `${member}`, inline: true },
                { name: '📨 Invited By', value: `${inviter}`, inline: true },
                { name: '🔗 Invite Code', value: `${randomCode}`, inline: true },
                { name: '⚠️ Account Flag', value: 'New Account', inline: true }
            ];
        }

        const embed = new EmbedBuilder()
            .setTitle('🎉 Member Join Event')
            .setDescription(description)
            .setColor('#8B5CF6')
            .addFields(fields)
            .setFooter({ text: 'Trade Market • Invite Tracker Test' })
            .setTimestamp();

        const inviteChannel = await guild.channels.fetch(INVITE_CHANNEL_ID).catch(() => null);
        if (!inviteChannel) return message.reply('❌ Invite channel not found.');

        await inviteChannel.send({ embeds: [embed] });

        return message.reply(`✅ Fake invite event simulated (${scenario})`);
    }
};