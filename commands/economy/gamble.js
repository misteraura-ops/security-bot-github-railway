const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../../utils/economy');

module.exports = {
    name: 'gamble',
    async execute(message, args) {

        const bet = parseInt(args[0]);
        if (!bet || bet <= 0) return message.reply('⚠️ Enter a valid bet.');

        const data = getUser(message.author.id);
        if (data.wallet < bet) return message.reply('💀 You’re broke.');

        const roll = Math.random();

        let resultText;
        let multiplier;

        if (roll < 0.45) {
            multiplier = -1;
            resultText = "You got folded.";
        } else if (roll < 0.85) {
            multiplier = 1;
            resultText = "You doubled up.";
        } else {
            multiplier = 3;
            resultText = "JACKPOT x3";
        }

        const change = bet * multiplier;
        data.wallet += change;
        updateUser(message.author.id, data);

        const embed = new EmbedBuilder()
            .setColor(change > 0 ? '#00ff00' : '#ff0000')
            .setTitle('🎰 HIGH STAKES GAMBLE')
            .setDescription(`
\`\`\`
BET: $${bet}
RESULT: ${resultText}
CHANGE: ${change > 0 ? '+' : ''}$${change}
NEW WALLET: $${data.wallet}
\`\`\`
            `)
            .setFooter({ text: "Risk defines power." })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};