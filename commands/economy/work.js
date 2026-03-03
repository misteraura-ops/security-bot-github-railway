const { EmbedBuilder } = require('discord.js');

const workResponses = [
    "You delivered a pizza but the cat ate it 🐱💀. Got some money anyway.",
    "You tried hacking the bank 💻💀. Caught? Nope, got $",
    "You sold some black market apples 🍎💀. Money in your pocket."
];

module.exports = {
    name: 'work',
    description: 'Work and earn money with savage random events',
    async execute(message, args, client) {
        if (!client.economy) client.economy = {};
        if (!client.economy[message.author.id]) client.economy[message.author.id] = { money: 0 };

        const earned = Math.floor(Math.random()*500)+100; // 100-600
        client.economy[message.author.id].money += earned;

        const randomMsg = workResponses[Math.floor(Math.random()*workResponses.length)];

        const embed = new EmbedBuilder()
            .setTitle('💼 Work Done!')
            .setColor('#00CED1')
            .setDescription(`${message.author}, ${randomMsg.replace('$', earned)}`)
            .addFields(
                { name: 'Earned', value: `$${earned}`, inline: true },
                { name: 'Total Money', value: `$${client.economy[message.author.id].money}`, inline: true },
                { name: 'Extra', value: '💀 Dark humor included!' }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};