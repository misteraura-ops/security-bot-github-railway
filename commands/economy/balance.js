const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'balance',
    description: 'Check your balance 💰',
    async execute(message, args, client) {
        if (!client.economy) client.economy = {};
        const userId = message.author.id;

        // Initialize user if missing
        if (!client.economy[userId]) client.economy[userId] = { money: 0, bank: 0 };

        const embed = new EmbedBuilder()
            .setTitle(`💸 Balance for ${message.author.username}`)
            .setColor('#FFD700')
            .addFields(
                { name: '💰 Cash', value: `$${client.economy[userId].money}`, inline: true },
                { name: '🏦 Bank', value: `$${client.economy[userId].bank}`, inline: true }
            )
            .setFooter({ text: 'Keep stacking that money 💀' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};