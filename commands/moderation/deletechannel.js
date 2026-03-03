const { ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'deletechannel',
  description: 'Deletes a channel safely',
  async execute(message, args, client) {
    try {
      let target = message.channel;

      // Check if channel exists
      if (!target || !target.guild) {
        return message.author.send('❌ Channel not found or already deleted.').catch(() => {});
      }

      const channelName = target.name;

      await target.delete(`Deleted by ${message.author.tag}`).catch(err => {
        console.error('❌ Error in deletechannel command:', err);
      });

      // Send confirmation to user via DM instead of channel
      await message.author.send(`✅ Channel **${channelName}** has been deleted.`).catch(() => {});

    } catch (err) {
      console.error('❌ Error in deletechannel command:', err);

      // Try to DM the user if the channel is gone
      try {
        await message.author.send('❌ Something went wrong while deleting the channel.').catch(() => {});
      } catch {}
    }
  }
};