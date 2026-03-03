const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'slots',
    description: 'Spin the slot machine 🎰 and try your luck!',
    async execute(message, args, client) {
        if (!client.economy) client.economy = {};
        const userId = message.author.id;

        // Initialize user
        if (!client.economy[userId]) client.economy[userId] = { money: 0, bank: 0 };

        // Check bet amount
        let bet = args[0]?.toLowerCase();
        if (!bet) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('⚠️ Bet Missing')
                    .setDescription('Usage: `.slots <amount>` or `.slots all`')
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
                    .setDescription('Enter a valid number or `all`.')
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

        // Slot emojis
        const slots = ['🍒', '🍋', '🍊', '🍉', '🍇', '💎', '7️⃣'];
        const roll = [
            slots[Math.floor(Math.random() * slots.length)],
            slots[Math.floor(Math.random() * slots.length)],
            slots[Math.floor(Math.random() * slots.length)]
        ];

        let outcome = '';
        let winnings = 0;

        // Check result
        if (roll[0] === roll[1] && roll[1] === roll[2]) {
            winnings = bet * 5; // Jackpot multiplier
            client.economy[userId].money += winnings;
            outcome = `🎉 JACKPOT! You won $${winnings}!`;
        } else if (roll[0] === roll[1] || roll[1] === roll[2] || roll[0] === roll[2]) {
            winnings = bet * 2; // small win
            client.economy[userId].money += winnings;
            outcome = `😊 Nice! Two match! You won $${winnings}!`;
        } else {
            client.economy[userId].money -= bet;
            outcome = `💀 Bad luck! You lost $${bet}.`;
        }

        // Fire embed panel
        const embed = new EmbedBuilder()
            .setTitle('🎰 Slot Machine')
            .setColor('#FF4500')
            .setDescription(`**${roll.join(' | ')}**\n\n${outcome}`)
            .addFields(
                { name: '💰 Cash', value: `$${client.economy[userId].money}`, inline: true },
                { name: '🏦 Bank', value: `$${client.economy[userId].bank}`, inline: true }
            )
            .setFooter({ text: 'Try your luck again!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};