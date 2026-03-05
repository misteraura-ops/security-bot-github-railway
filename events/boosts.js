// events/boosts.js
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to store custom embed image
const boostConfigPath = path.join(__dirname, '../../db/boostConfig.json');
let boostConfig = fs.existsSync(boostConfigPath)
  ? JSON.parse(fs.readFileSync(boostConfigPath, 'utf-8'))
  : { image: null };

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember, client) {
    try {
      const boostChannelId = '1479043884301553664';
      const boostChannel = await newMember.guild.channels.fetch(boostChannelId).catch(() => null);
      if (!boostChannel) return;

      // Detect if user started boosting
      const wasBoosting = oldMember.premiumSince;
      const isBoosting = newMember.premiumSince;

      if (!wasBoosting && isBoosting) {
        // Boost detected!
        const embed = new EmbedBuilder()
          .setTitle('🚀 Server Boost!')
          .setDescription(`${newMember} has boosted the server! Thank you for supporting us!`)
          .setColor('#FFD700')
          .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
          .setImage(boostConfig.image || null)
          .addFields(
            { name: 'Member', value: `${newMember.user.tag}`, inline: true },
            { name: 'Total Boosts', value: `${newMember.guild.premiumSubscriptionCount}`, inline: true }
          )
          .setFooter({ text: 'Kai Kingdom MM System • Boosts' })
          .setTimestamp();

        return boostChannel.send({ content: `<@${newMember.id}>`, embeds: [embed] });
      }
    } catch (err) {
      console.error('Error handling boost event:', err);
    }
  },

  // Command: .setembedboost <imageURL>
  async handleCommand(message, args) {
    if (!args[0]) return message.reply('❌ Please provide an image URL.');

    const imageUrl = args[0];
    // Basic validation (checks for image extensions)
    if (!imageUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i)) {
      return message.reply('❌ Invalid image URL. Must be an image ending with jpg, png, gif, webp, bmp.');
    }

    boostConfig.image = imageUrl;
    fs.writeFileSync(boostConfigPath, JSON.stringify(boostConfig, null, 2));

    return message.reply(`✅ Boost embed image updated successfully!`);
  }
};