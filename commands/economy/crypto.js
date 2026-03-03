const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'crypto',
    description: 'Gamble on fake crypto 🚀',
    async execute(message, args, client) {
        if (!client.economy) client.economy = {};
        const userId = message.author.id;

        // Initialize user
        if (!client.economy[userId]) client.economy[userId] = { money: 0, bank: 0 };

        let bet = args[0]?.toLowerCase();
        if (!bet) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('⚠️ Bet Missing')
                    .setDescription('Usage: `.crypto <amount>` or `.crypto all`')
                    .setColor('#FF4500')
                    .setTimestamp()
            ]});
        }

        if (bet === 'all') bet = client.economy[userId].money;
        else bet = parseInt(bet);

        if (isNaN(bet) || bet <= 0) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('⚠️ Invalid Bet')
                    .setDescription('Enter a number or `all`.')
                    .setColor('#FF4500')
                    .setTimestamp()
            ]});
        }

        if (bet > client.economy[userId].money) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('💸 Not Enough Cash')
                    .setDescription('You don\'t have that much cash to bet.')
                    .setColor('#FF0000')
                    .setTimestamp()
            ]});
        }

        // Simulate crypto price change
        const changePercent = Math.floor(Math.random() * 41) - 20; // -20% to +20%
        const win = changePercent > 0;
        const multiplier = 1 + changePercent / 100;
        let outcomeText = '';
        let winnings = 0;

        if (win) {
            winnings = Math.floor(bet * multiplier);
            client.economy[userId].money += winnings;
            outcomeText = `🚀 Crypto went **up ${changePercent}%**! You won $${winnings}!`;
        } else {
            client.economy[userId].money -= bet;
            outcomeText = `💀 Crypto crashed **${changePercent}%**! You lost $${bet}.`;
        }

        // Dark humor comments
        const darkComments = [
            "Hope you didn't sell your kidneys for this… 😂",
            "Crypto: where dreams go to die 💀",
            "At least your loss is consistent with your luck 😈",
            "Money down the drain, enjoy the view 🩸"
        ];

        const comment = win
            ? "Nice! Even a broken clock is right twice a day 😏"
            : darkComments[Math.floor(Math.random() * darkComments.length)];

        const embed = new EmbedBuilder()
            .setTitle('💹 Crypto Gamble')
            .setColor('#FF4500')
            .setDescription(`${outcomeText}\n\n${comment}`)
            .addFields(
                { name: '💰 Cash', value: `$${client.economy[userId].money}`, inline: true },
                { name: '🏦 Bank', value: `$${client.economy[userId].bank}`, inline: true }
            )
            .setFooter({ text: 'Crypto is risky… handle with care 😈' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};