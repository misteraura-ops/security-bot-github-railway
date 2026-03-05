const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fakeboost',
    description: 'Simulates a server boost for testing the boost panel',
    async execute(message, args) {
        try {
            // Fixed channel for boost panel
            const channelId = '1479043884301553664';
            const channel = await message.guild.channels.fetch(channelId).catch(() => null);
            if (!channel) return message.reply('⚠️ Boost channel not found.');

            // Use either mentioned user or command author as "booster"
            const booster = message.mentions.members.first() || message.member;

            // Random boost message
            const messages = [
                `🚀 ${booster} just boosted the server! We appreciate your support.`,
                `💎 ${booster} has enhanced our realm with a boost — thank you!`,
                `✨ Server power increased! ${booster} contributed a boost. Stay legendary.`,
                `⚡ ${booster} is now officially powering up the MM server!`,
                `🔥 ${booster}, your boost has been recognized. Welcome to the elite circle!`
            ];
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];

            // Embed
            const embed = new EmbedBuilder()
                .setTitle('🚀 Server Boost Alert!')
                .setDescription(randomMsg)
                .setColor('#FFD700')
                .setImage('https://cdn.discordapp.com/attachments/1465701908780945521/1479046250501378118/IMG-20260305-WA0004.jpg?ex=69aa9ca9&is=69a94b29&hm=aee4780f2bbd23c9c7fac73d694d3757a274e6b760884dedb676f2b32e9812df&')
                .addFields(
                    { name: 'Booster', value: `${booster}`, inline: true },
                    { name: 'Server', value: message.guild.name, inline: true },
                    { name: 'Total Boosts', value: `${message.guild.premiumSubscriptionCount}`, inline: true }
                )
                .setFooter({ text: 'This is a test boost panel for Kai Kingdom MM Server' })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            return message.reply('✅ Fake boost simulated!');
        } catch (err) {
            console.error('Error in fakeboost command:', err);
            return message.reply('❌ An error occurred while simulating the boost.');
        }
    }
};