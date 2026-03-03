const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const { getUser, updateUser } = require('../../utils/economy');

let heistActive = false;

module.exports = {
    name: 'heist',
    async execute(message) {
        if (heistActive) return message.reply('A heist is already active!');

        heistActive = true;
        const participants = new Map();

        const embed = new EmbedBuilder()
            .setTitle('🧨 Heist Started!')
            .setColor('#ff0000')
            .setDescription('Click **Join** to enter the heist!');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('joinHeist').setLabel('Join').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('startHeist').setLabel('Start').setStyle(ButtonStyle.Danger)
        );

        const sent = await message.channel.send({ embeds: [embed], components: [row] });

        const filter = i => i.message.id === sent.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'joinHeist') {
                if (participants.has(i.user.id)) return i.reply({ content: 'Already joined!', ephemeral: true });
                participants.set(i.user.id, getUser(i.user.id));
                await i.reply({ content: 'Joined the heist!', ephemeral: true });
            }
            if (i.customId === 'startHeist') {
                if (participants.size < 2) return i.reply({ content: 'Need at least 2 participants!', ephemeral: true });

                let totalLoot = Math.floor(Math.random() * 5000) + 5000;
                const perPlayer = Math.floor(totalLoot / participants.size);

                participants.forEach((user, id) => {
                    user.wallet += perPlayer;
                    updateUser(id, user);
                });

                await i.update({ embeds: [embed.setDescription(`Heist complete! Total loot: $${totalLoot}\nEach participant got: $${perPlayer}`)], components: [] });
                collector.stop();
                heistActive = false;
            }
        });
    }
};