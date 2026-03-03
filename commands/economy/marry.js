const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../../utils/economy');

module.exports = {
    name: 'marry',
    async execute(message) {

        const target = message.mentions.users.first();
        if (!target) return;

        const user = getUser(message.author.id);
        const partner = getUser(target.id);

        if (user.marriedTo) return message.reply("You're already married.");
        if (partner.marriedTo) return message.reply("They're taken.");

        user.marriedTo = target.id;
        partner.marriedTo = message.author.id;

        updateUser(message.author.id, user);
        updateUser(target.id, partner);

        const embed = new EmbedBuilder()
            .setColor('#ff1493')
            .setTitle('💍 MARRIAGE CONFIRMED')
            .setDescription(`
${message.author} 🤝 ${target}

Officially bound by digital law.
            `)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};