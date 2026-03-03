const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'leaderboard',
    description: 'Shows the top richest users in the server 💸',
    async execute(message, args, client) {
        // Initialize economy object if missing
        if (!client.economy) client.economy = {};

        // Convert economy object to array of [userId, money]
        const usersArray = Object.entries(client.economy);

        if (usersArray.length === 0) {
            return message.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('📉 Leaderboard Empty')
                    .setDescription('No balances recorded yet! Have your users do `.daily`, `.work` or other economy commands.')
                    .setColor('#FF8C00')
                    .setTimestamp()
            ]});
        }

        // Sort descending by money
        usersArray.sort((a, b) => b[1].money - a[1].money);

        // Take top 10 users
        const topUsers = usersArray.slice(0, 10);

        // Build leaderboard text
        let leaderboardText = '';
        let rank = 1;
        for (const [userId, data] of topUsers) {
            const user = await message.client.users.fetch(userId).catch(() => null);
            const username = user ? user.username : `Unknown User (${userId})`;
            leaderboardText += `**${rank}. ${username}** – $${data.money}\n`;
            rank++;
        }

        const embed = new EmbedBuilder()
            .setTitle('💸 Server Richest Users')
            .setColor('#FFD700')
            .setDescription(leaderboardText)
            .setFooter({ text: 'Do you have what it takes to reach the top? 🔥' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};