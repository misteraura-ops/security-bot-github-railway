const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'daily',
    description: 'Claim your daily money reward',
    async execute(message, args, client) {
        if (!client.economy) client.economy = {};
        if (!client.economy[message.author.id]) client.economy[message.author.id] = { money: 0, lastDaily: 0 };

        const now = Date.now();
        const cooldown = 24*60*60*1000; // 24h

        if (now - client.economy[message.author.id].lastDaily < cooldown) {
            const remaining = cooldown - (now - client.economy[message.author.id].lastDaily);
            const hrs = Math.floor(remaining/3600000);
            const mins = Math.floor((remaining%3600000)/60000);
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('⏳ Daily Cooldown')
                    .setDescription(`You already claimed today! Come back in **${hrs}h ${mins}m**`)
                    .setColor('#FF4500')
                    .setFooter({ text: 'Patience is key 💀' })
                    .setTimestamp()
            ]});
        }

        const reward = Math.floor(Math.random()*1000)+500; // 500-1500
        client.economy[message.author.id].money += reward;
        client.economy[message.author.id].lastDaily = now;

        const embed = new EmbedBuilder()
            .setTitle('💰 Daily Reward Claimed!')
            .setColor('#00FF7F')
            .setDescription(`${message.author} just grabbed **$${reward}** today!`)
            .addFields(
                { name: 'Total Money', value: `$${client.economy[message.author.id].money}`, inline: true },
                { name: 'Luck Bonus', value: reward > 1200 ? '🍀 You got a big bonus!' : '💀 Keep grinding!', inline: true },
            )
            .setTimestamp()
            .setFooter({ text: 'Come back tomorrow for more 💸' });

        message.reply({ embeds: [embed] });
    }
};