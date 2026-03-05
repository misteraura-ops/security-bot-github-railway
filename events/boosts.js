const { EmbedBuilder, Events } = require('discord.js');

module.exports = {
    name: Events.GuildBoost,
    async execute(guild, booster) {
        try {
            // 1️⃣ Fetch the fixed boosts channel
            const channelId = '1479043884301553664';
            const channel = await guild.channels.fetch(channelId).catch(() => null);
            if (!channel) return; // Exit if channel not found

            // 2️⃣ Generate a professional boost message
            const messages = [
                `🚀 ${booster} just boosted the server! We appreciate your support.`,
                `💎 ${booster} has enhanced our realm with a boost — thank you!`,
                `✨ Server power increased! ${booster} contributed a boost. Stay legendary.`,
                `⚡ ${booster} is now officially powering up the MM server!`,
                `🔥 ${booster}, your boost has been recognized. Welcome to the elite circle!`
            ];
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];

            // 3️⃣ Build the professional embed
            const embed = new EmbedBuilder()
                .setTitle('🚀 Server Boost Alert!')
                .setDescription(randomMsg)
                .setColor('#FFD700') // golden boost theme
                .setImage('https://cdn.discordapp.com/attachments/1465701908780945521/1479046250501378118/IMG-20260305-WA0004.jpg?ex=69aa9ca9&is=69a94b29&hm=aee4780f2bbd23c9c7fac73d694d3757a274e6b760884dedb676f2b32e9812df&')
                .addFields(
                    { name: 'Booster', value: `${booster}`, inline: true },
                    { name: 'Server', value: guild.name, inline: true },
                    { name: 'Total Boosts', value: `${guild.premiumSubscriptionCount}`, inline: true }
                )
                .setFooter({ text: 'Thank you for supporting Kai Kingdom MM Server!' })
                .setTimestamp();

            // 4️⃣ Send the embed in the fixed boosts channel
            channel.send({ embeds: [embed] });

        } catch (err) {
            console.error('Error in guildBoost event:', err);
        }
    },
};