const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../../utils/economy');

module.exports = {
    name: 'coinflip',
    async execute(message, args) {

        const choice = args[0];
        const bet = parseInt(args[1]);

        if (!['heads','tails'].includes(choice))
            return message.reply('Choose heads or tails.');

        if (!bet || bet <= 0)
            return message.reply('Enter valid bet.');

        const user = getUser(message.author.id);
        if (user.wallet < bet)
            return message.reply('You’re broke.');

        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const win = result === choice;

        const change = win ? bet : -bet;
        user.wallet += change;
        updateUser(message.author.id, user);

        const embed = new EmbedBuilder()
            .setColor(win ? '#00ff00' : '#8B0000')
            .setTitle('🪙 COINFLIP DUEL')
            .setDescription(`
🎯 YOU PICKED: ${choice.toUpperCase()}
🪙 RESULT: ${result.toUpperCase()}

💰 CHANGE: ${win ? '+' : ''}$${change}
💵 WALLET: $${user.wallet}
            `)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};