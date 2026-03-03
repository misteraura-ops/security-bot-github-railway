const { EmbedBuilder } = require('discord.js');
const { getUser, getLevel } = require('../../utils/economy');

module.exports = {
    name: 'profile',
    async execute(message) {

        const user = getUser(message.author.id);
        const level = getLevel(user.xp);

        const embed = new EmbedBuilder()
            .setColor('#8B0000')
            .setTitle('👑 CRIMINAL PROFILE')
            .setDescription(`
💰 WALLET :: $${user.wallet}
🏦 BANK   :: $${user.bank}

⭐ XP      :: ${user.xp}
👑 LEVEL   :: ${level}

🏠 HOUSE   :: ${user.house ? user.house : 'None'}
💍 MARRIED :: ${user.marriedTo ? `<@${user.marriedTo}>` : 'Single'}
            `)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};