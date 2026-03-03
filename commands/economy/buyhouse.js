const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../../utils/economy');

const houses = {
    shack: { price: 5000, income: 200 },
    apartment: { price: 15000, income: 600 },
    mansion: { price: 50000, income: 2000 }
};

module.exports = {
    name: 'buyhouse',
    async execute(message, args) {

        const choice = args[0];
        if (!houses[choice]) return message.reply('Options: shack, apartment, mansion');

        const user = getUser(message.author.id);

        if (user.wallet < houses[choice].price)
            return message.reply('Not enough money.');

        user.wallet -= houses[choice].price;
        user.house = choice;

        updateUser(message.author.id, user);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏠 PROPERTY PURCHASED')
            .setDescription(`
HOUSE :: ${choice.toUpperCase()}
COST  :: $${houses[choice].price}

You now earn $${houses[choice].income} daily.
            `)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};