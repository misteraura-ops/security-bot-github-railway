const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'withdraw',
    description: 'Withdraw money from your bank 💵 Use `.withdraw all` to withdraw everything',
    async execute(message, args, client) {
        if (!client.economy) client.economy = {};
        const userId = message.author.id;

        if (!client.economy[userId]) client.economy[userId] = { money: 0, bank: 0 };

        let amount = args[0]?.toLowerCase();

        if (!amount) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('⚠️ Withdraw Error')
                    .setDescription('Usage: `.withdraw <amount>` or `.withdraw all`')
                    .setColor('#FF4500')
                    .setTimestamp()
            ]});
        }

        if (amount === 'all') amount = client.economy[userId].bank;
        else amount = parseInt(amount);

        if (isNaN(amount) || amount <= 0) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('⚠️ Invalid Amount')
                    .setDescription('Enter a number or `all`.')
                    .setColor('#FF4500')
                    .setTimestamp()
            ]});
        }

        if (amount > client.economy[userId].bank) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('🏦 Not Enough in Bank')
                    .setDescription('You don\'t have that much in your bank.')
                    .setColor('#FF0000')
                    .setTimestamp()
            ]});
        }

        client.economy[userId].bank -= amount;
        client.economy[userId].money += amount;

        const embed = new EmbedBuilder()
            .setTitle('💵 Money Withdrawn')
            .setColor('#00FF00')
            .setDescription(`<@${userId}> withdrew **$${amount}** from their bank.`)
            .addFields(
                { name: '💰 Cash', value: `$${client.economy[userId].money}`, inline: true },
                { name: '🏦 Bank', value: `$${client.economy[userId].bank}`, inline: true }
            )
            .setFooter({ text: 'Cash updated 💀' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};