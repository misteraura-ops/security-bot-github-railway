const { EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
    name: 'botstatus',
    description: 'Shows live bot status with detailed info (OWNER_ID only)',
    async execute(message, args, client) {
        if (message.author.id !== process.env.OWNER_ID) return; // Silent for everyone else

        const statusEmbed = new EmbedBuilder()
            .setTitle(`🤖 ${client.user.username} • Bot Dashboard`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setColor(client.isMaintenance ? '#e67e22' : '#27ae60')
            .setFooter({ text: 'MMPANEL • Live Bot Status' })
            .setTimestamp();

        const panelMessage = await message.channel.send({ embeds: [statusEmbed] });

        // Render progress bar
        const renderBar = (percent, length = 20) => {
            const filled = '█'.repeat(Math.round(length * percent));
            const empty = '─'.repeat(length - Math.round(length * percent));
            return `\`${filled}${empty}\``;
        };

        // Update loop
        const interval = setInterval(() => {
            if (!panelMessage.editable) return clearInterval(interval);

            const uptimeMS = client.uptime || 0;
            const days = Math.floor(uptimeMS / 86400000);
            const hours = Math.floor((uptimeMS % 86400000) / 3600000);
            const minutes = Math.floor((uptimeMS % 3600000) / 60000);
            const seconds = Math.floor((uptimeMS % 60000) / 1000);
            const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            const memoryMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const totalMemMB = (os.totalmem() / 1024 / 1024).toFixed(0);
            const memoryPercent = memoryMB / totalMemMB;

            const cpuModel = os.cpus()[0].model;
            const servers = client.guilds.cache.size;
            const users = client.users.cache.size;
            const ping = client.ws.ping;
            const pingPercent = Math.min(ping / 500, 1); // cap at 500ms

            const maintenanceStatus = client.isMaintenance ? '🛠️ Under Maintenance' : '✅ Online';

            // Animated dots for "loading" feel
            const loadingDots = ['.', '..', '...', '....'];
            const dot = loadingDots[Math.floor((Date.now() / 1000) % loadingDots.length)];

            statusEmbed
                .setColor(client.isMaintenance ? '#e67e22' : '#27ae60')
                .setTitle(`🤖 ${client.user.username} • Bot Dashboard ${dot}`)
                .setFields(
                    { name: 'Status', value: maintenanceStatus, inline: true },
                    { name: 'Servers', value: `${servers}`, inline: true },
                    { name: 'Users', value: `${users}`, inline: true },
                    { name: 'Uptime', value: uptimeString, inline: false },
                    { name: 'Memory Usage', value: `${memoryMB} / ${totalMemMB} MB ${renderBar(memoryPercent)}`, inline: false },
                    { name: 'Ping', value: `${ping}ms ${renderBar(pingPercent)}`, inline: false },
                    { name: 'CPU', value: cpuModel, inline: false },
                    { name: 'Maintenance Mode', value: client.isMaintenance ? '🟠 Active (use .restore)' : '🟢 Inactive', inline: false }
                )
                .setTimestamp();

            panelMessage.edit({ embeds: [statusEmbed] }).catch(() => clearInterval(interval));
        }, 5000);

        // Stop updates after 3 minutes automatically
        setTimeout(() => clearInterval(interval), 180000);
    }
};