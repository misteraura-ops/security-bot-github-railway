const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'addmoney',
    description: 'OWNER only: Add money to a user\'s balance',
    async execute(message, args, client) {
        const OWNER_ID = process.env.OWNER_ID;

        if (message.author.id !== OWNER_ID) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('❌ Access Denied')
                    .setDescription(`Only the legendary <@${OWNER_ID}> can use this command!`)
                    .setColor('#FF0000')
                    .setTimestamp()
            ]});
        }

        const amount = parseInt(args[0]);
        const target = message.mentions.users.first();

        if (!target || isNaN(amount) || amount <= 0) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('⚠️ Invalid Usage')
                    .setDescription('Usage: `.addmoney <amount> <@user>`')
                    .setColor('#FF8C00')
                    .setTimestamp()
            ]});
        }

        // Initialize economy object if needed
        if (!client.economy) client.economy = {};
        if (!client.economy[target.id]) client.economy[target.id] = { money: 0 };

        client.economy[target.id].money += amount;

        const embed = new EmbedBuilder()
            .setTitle('💸 Money Added')
            .setColor('#00FF00')
            .setDescription(`<@${message.author.id}> added **$${amount}** to <@${target.id}>'s balance!`)
            .addFields(
                { name: 'User', value: `<@${target.id}>`, inline: true },
                { name: 'New Balance', value: `$${client.economy[target.id].money}`, inline: true },
                { name: 'Action By', value: `<@${OWNER_ID}>`, inline: true }
            )
            .setFooter({ text: '💀 Handle the riches wisely!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};