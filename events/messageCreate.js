const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // Make sure prefixes are loaded as an array
        const prefixes = message.client.prefixes || ['.']; // fallback
        const prefix = prefixes.find(p => message.content.startsWith(p));
        if (!prefix) return;

        // ----------------------
        // Maintenance Check
        // ----------------------
        if (message.client.isMaintenance && message.author.id !== process.env.OWNER_ID) {
            const maintenanceEmbed = new EmbedBuilder()
                .setTitle('⚠️ Bot Under Maintenance')
                .setColor('#e67e22')
                .setDescription(`The bot is currently under maintenance.\nPlease DM <@${process.env.OWNER_ID}> to report issues or get updates.`)
                .setFooter({ text: 'MMPANEL • Maintenance Mode' })
                .setTimestamp();

            return message.channel.send({ embeds: [maintenanceEmbed] }).catch(() => {});
        }

        // ----------------------
        // Normal command execution
        // ----------------------
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = message.client.commands.get(commandName) ||
                        message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        try {
            await command.execute(message, args); // client is accessible via message.client inside commands
        } catch (err) {
            console.error(err);
            message.reply('⚠️ Error executing that command.');
        }
    }
};