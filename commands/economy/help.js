const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Shows all fun/economy commands',
    async execute(message, args, client) {
        const category = args[0]?.toLowerCase();

        if (category !== 'economy') return message.reply({
            content: '💡 Usage: `.help economy`'
        });

        // Full list of economy/fun commands
        const commands = [
            { name: 'daily', desc: 'Claim your daily money reward 💰' },
            { name: 'balance', desc: 'Check your current balance 💸' },
            { name: 'work', desc: 'Work and earn money with dark humor 💼' },
            { name: 'rob', desc: 'Steal money from another user 💀' },
            { name: 'crypto', desc: 'Play with crypto and see if you get rich or broke 📉📈' },
            { name: 'slots', desc: 'Gamble in a slot machine 🎰 Risky, risky!' },
            { name: 'blackjack', desc: 'Play blackjack against the house 🃏' },
            { name: 'dailybonus', desc: 'Special extra reward for active users 💎' },
            { name: 'pay', desc: 'Send money to another user 💸' },
            { name: 'deposit', desc: 'Deposit money into your bank 🏦' },
            { name: 'withdraw', desc: 'Withdraw money from your bank 💰' },
            { name: 'leaderboard', desc: 'See who is richest in the server 🏆' }
        ];

        const embed = new EmbedBuilder()
            .setTitle('🔥 Fun & Economy Commands')
            .setColor('#FF4500')
            .setDescription('Here are all your fun & economy commands with dark humor and money vibes 💀💸')
            .setFooter({ text: 'Use wisely… or go broke 😎' })
            .setTimestamp();

        // Add a field for each command
        for (const cmd of commands) {
            embed.addFields({ name: `.${cmd.name}`, value: cmd.desc, inline: false });
        }

        message.reply({ embeds: [embed] });
    }
};