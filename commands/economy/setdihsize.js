const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'setdihsize',
    description: 'Set a hidden dih size range for a user (OWNER only)',
    async execute(message, args, client) {

        // Only OWNER_ID
        if (message.author.id !== process.env.OWNER_ID) {
            return message.reply(`Only hot, sexy, nonchalant people like <@${process.env.OWNER_ID}> can use this command 😉`);
        }

        // Check syntax
        const target = message.mentions.users.first();
        if (!target) return message.reply('Please mention a user to set their dih size.');

        const num1 = parseInt(args[1]);
        const num2 = parseInt(args[2]);

        if (isNaN(num1) || isNaN(num2)) return message.reply('Please provide valid numbers for the range.');
        if (num1 < 1 || num2 < 1) return message.reply('Numbers must be at least 1.');
        if (num2 < num1) return message.reply('Second number must be greater than or equal to the first.');

        // Initialize storage if needed
        if (!client.userDihRanges) client.userDihRanges = new Map();

        // Store the hidden range
        client.userDihRanges.set(target.id, [num1, num2]);

        const embed = new EmbedBuilder()
            .setColor('#B22222') // Fire red
            .setTitle('📏 Dih Range Set')
            .setDescription(`Successfully set hidden dih size for ${target}.\nThey will get a random size within this range when using .dih.`)
            .setFooter({ text: 'Range is hidden from users!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};