const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'restore',
    description: 'Brings the bot back online from maintenance mode with animated sequence.',
    async execute(message, args, client) {
        if (message.author.id !== process.env.OWNER_ID) return;

        client.isMaintenance = false;

        const totalSteps = 20; // animation steps
        const barLength = 10; // progress bar length

        // Initial embed
        const embed = new EmbedBuilder()
            .setTitle('⚡ Bot Restoration Initiated')
            .setColor('#27ae60')
            .setDescription('Booting systems back online...\nPlease wait while the bot comes back online.')
            .addFields(
                { name: 'Initiated by', value: `<@${message.author.id}>`, inline: true },
                { name: 'Status', value: 'Starting restoration sequence...', inline: true }
            )
            .setFooter({ text: 'MMPANEL • Restoring Bot' })
            .setTimestamp();

        const msg = await message.channel.send({ embeds: [embed] });

        // Dynamic animation
        for (let step = 1; step <= totalSteps; step++) {
            const progress = Math.round((step / totalSteps) * barLength);
            const bar = '▰'.repeat(progress) + '▱'.repeat(barLength - progress);
            const percentage = Math.round((step / totalSteps) * 100);

            const statusText = `Progress: ${bar} ${percentage}%\nServers: ${client.guilds.cache.size} | Users: ${client.users.cache.size}`;

            await msg.edit({
                embeds: [
                    EmbedBuilder.from(embed)
                        .setDescription(`🟢 Booting systems online...\n${statusText}`)
                        .spliceFields(1, 1, { name: 'Status', value: `Restoration progress: ${step}/${totalSteps}` })
                        .setColor('#2ecc71')
                ]
            });

            await new Promise(r => setTimeout(r, 300)); // 0.3s per step
        }

        // Final online embed
        await msg.edit({
            embeds: [
                EmbedBuilder.from(embed)
                    .setTitle('✅ Bot Online')
                    .setDescription('The bot is now **fully operational**.\nAll commands are available.')
                    .setColor('#27ae60')
                    .spliceFields(1, 1, { name: 'Status', value: 'Bot Operational' })
            ]
        });
    }
};