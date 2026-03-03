const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'deposit',
    description: 'Deposit money into your bank 💰 Use `.deposit all` to deposit everything',
    async execute(message, args, client) {
        if (!client.economy) client.economy = {};
        const userId = message.author.id;

        if (!client.economy[userId]) client.economy[userId] = { money: 0, bank: 0 };

        let amount = args[0]?.toLowerCase();

        if (!amount) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('⚠️ Deposit Error')
                    .setDescription('Usage: `.deposit <amount>` or `.deposit all`')
                    .setColor('#FF4500')
                    .setTimestamp()
            ]});
        }

        if (amount === 'all') amount = client.economy[userId].money;
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

        if (amount > client.economy[userId].money) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('💸 Not Enough Cash')
                    .setDescription('You don\'t have that much cash to deposit.')
                    .setColor('#FF0000')
                    .setTimestamp()
            ]});
        }

        client.economy[userId].money -= amount;
        client.economy[userId].bank += amount;

        const embed = new EmbedBuilder()
            .setTitle('🏦 Money Deposited')
            .setColor('#00FF00')
            .setDescription(`<@${userId}> deposited **$${amount}** into their bank.`)
            .addFields(
                { name: '💰 Cash', value: `$${client.economy[userId].money}`, inline: true },
                { name: '🏦 Bank', value: `$${client.economy[userId].bank}`, inline: true }
            )
            .setFooter({ text: 'Bank secure 🔒' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};