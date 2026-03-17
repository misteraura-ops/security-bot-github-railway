const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    // Ignore bots and DMs
    if (message.author.bot || !message.guild) return;

    // Ensure prefixes are an array
    const prefixes = Array.isArray(client.prefixes) ? client.prefixes : ['.'];
    const prefix = prefixes.find(p => message.content.startsWith(p));
    if (!prefix) return;

    // ----------------------
    // Maintenance Check
    // ----------------------
    if (client.isMaintenance && message.author.id !== process.env.OWNER_ID) {
      const maintenanceEmbed = new EmbedBuilder()
        .setTitle('⚠️ Bot Under Maintenance')
        .setColor('#e67e22')
        .setDescription(`The bot is currently under maintenance.\nPlease DM <@${process.env.OWNER_ID}> for updates.`)
        .setFooter({ text: 'MMPANEL • Maintenance Mode' })
        .setTimestamp();

      return message.channel.send({ embeds: [maintenanceEmbed] }).catch(() => {});
    }

    // ----------------------
    // Command Handling
    // ----------------------
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find(cmd => Array.isArray(cmd.aliases) && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
      // Execute the command
      await command.execute(message, args, client);
    } catch (err) {
      console.error('Command execution error:', err);
      return message.reply('⚠️ Error executing that command.');
    }
  }
};