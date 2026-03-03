const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../../utils/economy');

module.exports = {
    name: 'duel',
    async execute(message, args) {

        const target = message.mentions.users.first();
        const bet = parseInt(args[1]);

        if (!target || !bet) return message.reply('Usage: .duel @user <bet>');

        const user = getUser(message.author.id);
        const opponent = getUser(target.id);

        if (user.wallet < bet || opponent.wallet < bet)
            return message.reply('Both need enough money.');

        const winner = Math.random() < 0.5 ? message.author : target;

        if (winner.id === message.author.id) {
            user.wallet += bet;
            opponent.wallet -= bet;
        } else {
            user.wallet -= bet;
            opponent.wallet += bet;
        }

        updateUser(message.author.id, user);
        updateUser(target.id, opponent);

        const embed = new EmbedBuilder()
            .setColor('#8B0000')
            .setTitle('⚔️ MONEY DUEL')
            .setDescription(`
Bet :: $${bet}
Winner :: ${winner}

${winner === message.author ? 'You took their money.' : 'You got folded.'}
            `)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};