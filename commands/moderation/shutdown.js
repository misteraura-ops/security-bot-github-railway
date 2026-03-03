const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shutdown',
    description: 'Puts the bot into maintenance mode with a professional animated sequence.',
    async execute(message, args, client) {
        if (message.author.id !== process.env.OWNER_ID) return;

        client.isMaintenance = true;

        const totalSteps = 20; // number of animation steps
        const barLength = 10; // progress bar length

        // Initial embed
        const embed = new EmbedBuilder()
            .setTitle('⚡ Bot Maintenance Initiated')
            .setColor('#e67e22')
            .setDescription('The bot is entering maintenance mode...\nPlease wait while systems go offline.')
            .addFields(
                { name: 'Initiated by', value: `<@${message.author.id}>`, inline: true },
                { name: 'Status', value: 'Starting shutdown sequence...', inline: true }
            )
            .setFooter({ text: 'MMPANEL • Maintenance Mode' })
            .setTimestamp();

        const msg = await message.channel.send({ embeds: [embed] });

        // Dynamic animation with server/member stats
        for (let step = 1; step <= totalSteps; step++) {
            const progress = Math.round((step / totalSteps) * barLength);
            const bar = '▰'.repeat(progress) + '▱'.repeat(barLength - progress);
            const percentage = Math.round((step / totalSteps) * 100);

            const statusText = `Progress: ${bar} ${percentage}%\nServers: ${client.guilds.cache.size} | Users: ${client.users.cache.size}`;

            await msg.edit({
                embeds: [
                    EmbedBuilder.from(embed)
                        .setDescription(`🔧 The bot is entering maintenance mode...\n${statusText}`)
                        .spliceFields(1, 1, { name: 'Status', value: `Shutdown progress: ${step}/${totalSteps}` })
                        .setColor('#f39c12')
                ]
            });

            await new Promise(r => setTimeout(r, 300)); // 0.3s per step
        }

        // Final maintenance embed
        await msg.edit({
            embeds: [
                EmbedBuilder.from(embed)
                    .setTitle('🛠 Bot Under Maintenance')
                    .setDescription('✅ The bot is now **under maintenance**.\nOnly the owner can run commands.')
                    .setColor('#c0392b')
                    .spliceFields(1, 1, { name: 'Status', value: 'Maintenance Active' })
            ]
        });
    }
};