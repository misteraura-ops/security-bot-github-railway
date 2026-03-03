const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        const prefix = client.prefixes.find(p => message.content.startsWith(p));
        if (!prefix) return;

        // ----------------------
        // Maintenance Check
        // ----------------------
        if (client.isMaintenance && message.author.id !== process.env.OWNER_ID) {
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
        const command = client.commands.get(commandName);
        if (!command) return;

        command.execute(message, args, client).catch(console.error);
    }
};