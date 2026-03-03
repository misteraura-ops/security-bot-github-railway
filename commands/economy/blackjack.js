const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'blackjack',
    description: 'Play blackjack against the bot 🃏',
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
                    .setDescription('Usage: `.blackjack <amount>` or `.blackjack all`')
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

        // Card deck
        const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suits = ['♠', '♥', '♦', '♣'];

        function drawCard() {
            const card = cards[Math.floor(Math.random() * cards.length)];
            const suit = suits[Math.floor(Math.random() * suits.length)];
            return card + suit;
        }

        function getValue(hand) {
            let sum = 0, aces = 0;
            hand.forEach(c => {
                const val = c.slice(0, -1);
                if (['J','Q','K'].includes(val)) sum += 10;
                else if (val === 'A') { sum += 11; aces++; }
                else sum += parseInt(val);
            });
            while (sum > 21 && aces > 0) { sum -= 10; aces--; }
            return sum;
        }

        // Deal cards
        const playerHand = [drawCard(), drawCard()];
        const dealerHand = [drawCard(), drawCard()];

        // Player auto-play: hit until 17+
        while (getValue(playerHand) < 17) {
            playerHand.push(drawCard());
        }

        // Dealer auto-play: hit until 17+
        while (getValue(dealerHand) < 17) {
            dealerHand.push(drawCard());
        }

        const playerTotal = getValue(playerHand);
        const dealerTotal = getValue(dealerHand);

        let outcome = '';
        let winnings = 0;
        const darkHumor = [
            "Bot laughs as you lose 💀",
            "Better luck next time, mortal 😈",
            "Ouch… that one hurts 🩸",
            "At least you tried… barely 🥀"
        ];

        if ((playerTotal > 21) || (dealerTotal <= 21 && dealerTotal > playerTotal)) {
            // Player loses
            client.economy[userId].money -= bet;
            outcome = `💀 You lost $${bet}. ${darkHumor[Math.floor(Math.random() * darkHumor.length)]}`;
        } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
            // Player wins
            winnings = bet * 2;
            client.economy[userId].money += winnings;
            outcome = `🎉 You won $${winnings}! You crushed it!`;
        } else {
            // Tie
            outcome = `🤝 Push! No money lost.`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🃏 Blackjack')
            .setColor('#FF4500')
            .addFields(
                { name: '🧑 You', value: `${playerHand.join(' | ')} (Total: ${playerTotal})`, inline: true },
                { name: '🤖 Dealer', value: `${dealerHand.join(' | ')} (Total: ${dealerTotal})`, inline: true }
            )
            .setDescription(outcome)
            .addFields(
                { name: '💰 Cash', value: `$${client.economy[userId].money}`, inline: true },
                { name: '🏦 Bank', value: `$${client.economy[userId].bank}`, inline: true }
            )
            .setFooter({ text: 'Try your luck again!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};