const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../../utils/economy');

module.exports = {
    name: 'race',
    async execute(message, args) {

        const bet = parseInt(args[0]);
        if (!bet || bet <= 0) return message.reply('Enter valid bet.');

        const user = getUser(message.author.id);
        if (user.wallet < bet) return message.reply('Broke.');

        const win = Math.random() < 0.5;
        const change = win ? bet * 2 : -bet;

        user.wallet += change;
        updateUser(message.author.id, user);

        const embed = new EmbedBuilder()
            .setColor(win ? '#00ff00' : '#8B0000')
            .setTitle('🏎️ STREET RACE')
            .setDescription(`
Result :: ${win ? 'YOU WON' : 'YOU LOST'}
💰 Change :: ${win ? '+' : ''}$${change}
Wallet :: $${user.wallet}
            `)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};