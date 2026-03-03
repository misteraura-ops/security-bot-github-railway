const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'testpanel',
    description: 'Shows a test interactive panel',
    async execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setTitle('🔥 Test Panel')
            .setDescription('Click a button below to see a reaction!')
            .setColor('Red');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('btn1')
                    .setLabel('Click Me!')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('btn2')
                    .setLabel('No, Click Me!')
                    .setStyle(ButtonStyle.Secondary)
            );

        const sent = await message.channel.send({ embeds: [embed], components: [row] });

        const collector = sent.createMessageComponentCollector({ time: 15000 });

        collector.on('collect', i => {
            if (i.customId === 'btn1') i.reply({ content: 'You clicked button 1!', ephemeral: true });
            else if (i.customId === 'btn2') i.reply({ content: 'You clicked button 2!', ephemeral: true });
        });

        collector.on('end', collected => {
            sent.edit({ components: [] }); // Disable buttons after collection ends
        });
    }
};