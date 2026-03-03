const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rob',
    description: 'Try to rob another user 💀💸',
    async execute(message, args, client) {
        if (!client.economy) client.economy = {};
        const userId = message.author.id;

        // Initialize user
        if (!client.economy[userId]) client.economy[userId] = { money: 0, bank: 0 };

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('⚠️ Missing Target')
                    .setDescription('Usage: `.rob @user`')
                    .setColor('#FF4500')
                    .setTimestamp()
            ]});
        }

        if (targetUser.id === userId) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('💀 Nice Try')
                    .setDescription('You cannot rob yourself!')
                    .setColor('#FF0000')
                    .setTimestamp()
            ]});
        }

        // Initialize target
        if (!client.economy[targetUser.id]) client.economy[targetUser.id] = { money: 0, bank: 0 };

        const targetCash = client.economy[targetUser.id].money;
        if (targetCash <= 0) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('💤 Empty Wallet')
                    .setDescription(`${targetUser.username} has no cash to rob!`)
                    .setColor('#FFA500')
                    .setTimestamp()
            ]});
        }

        const success = Math.random() < 0.5; // 50% chance
        let embed = new EmbedBuilder().setColor('#FF4500').setTimestamp();

        if (success) {
            const stolenAmount = Math.floor(Math.random() * (targetCash / 2)) + 1;
            client.economy[userId].money += stolenAmount;
            client.economy[targetUser.id].money -= stolenAmount;

            embed
                .setTitle('💰 Robbery Successful!')
                .setDescription(`You successfully stole $${stolenAmount} from ${targetUser.username}!`)
                .addFields(
                    { name: '🤑 Your Cash', value: `$${client.economy[userId].money}`, inline: true },
                    { name: '🏦 Bank', value: `$${client.economy[userId].bank}`, inline: true }
                )
                .setFooter({ text: 'Steal wisely… dark humor included 😈' });
        } else {
            const lossAmount = Math.floor(client.economy[userId].money * 0.2); // lose 20% of cash
            client.economy[userId].money -= lossAmount;

            const darkComments = [
                "Ouch! You got caught and humiliated 💀",
                "Better luck next time, karma is real 😈",
                "Even your shadow laughs at your failure 😂"
            ];

            embed
                .setTitle('💀 Robbery Failed!')
                .setDescription(`${darkComments[Math.floor(Math.random() * darkComments.length)]}\nYou lost $${lossAmount} in the mess!`)
                .addFields(
                    { name: '🤑 Your Cash', value: `$${client.economy[userId].money}`, inline: true },
                    { name: '🏦 Bank', value: `$${client.economy[userId].bank}`, inline: true }
                )
                .setFooter({ text: 'Maybe try a safer hustle next time 😏' });
        }

        message.reply({ embeds: [embed] });
    }
};