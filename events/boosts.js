const { EmbedBuilder, Events } = require('discord.js');

module.exports = {
    name: Events.GuildBoost,
    async execute(guild, booster) {
        try {

            const channelId = '1479043884301553664';
            const channel = await guild.channels.fetch(channelId).catch(() => null);
            if (!channel) return;

            const messages = [
                `🚀 ${booster} just boosted **Trade Market**!`,
                `💎 ${booster} has boosted **Trade Market** — thank you for the support!`,
                `✨ **Trade Market** just received a boost from ${booster}!`,
                `⚡ ${booster} powered up **Trade Market** with a server boost!`,
                `🔥 ${booster} boosted **Trade Market**! Welcome to the boosters club.`
            ];

            const randomMsg = messages[Math.floor(Math.random() * messages.length)];

            const embed = new EmbedBuilder()
                .setTitle('🚀 Server Boost!')
                .setDescription(
                    `${randomMsg}\n\n` +
                    `💜 **Thank you for supporting Trade Market!**\n` +
                    `Boosts unlock better streaming quality, improved audio, and exclusive server perks.`
                )
                .setColor('#8B5CF6')
                .setImage('https://media.discordapp.net/attachments/1480184670606983240/1481043469962186846/file_00000000c2e87246a7a433b0c17cd064.png')
                .addFields(
                    { name: '💎 Booster', value: `${booster}`, inline: true },
                    { name: '🏪 Server', value: 'Trade Market', inline: true },
                    { name: '⚡ Total Boosts', value: `${guild.premiumSubscriptionCount}`, inline: true }
                )
                .setFooter({ text: 'Trade Market • Nitro Boost System' })
                .setTimestamp();

            channel.send({ embeds: [embed] });

        } catch (err) {
            console.error('Error in guildBoost event:', err);
        }
    },
};