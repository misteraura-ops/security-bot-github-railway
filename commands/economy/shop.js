const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shop',
    async execute(message) {

        const embed = new EmbedBuilder()
            .setColor('#8B0000')
            .setTitle('💎 BLACK MARKET SHOP')
            .setDescription(`
🔪 Knife Boost — $5000 (Better rob success)
🛡 Armor — $8000 (Lower rob fine)
🎰 Lucky Charm — $12000 (Higher gamble win chance)
            `)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};