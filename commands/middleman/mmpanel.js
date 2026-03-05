require('dotenv').config();
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  name: 'mmpanel',
  async execute(message, args, client) {
    // Only OWNER_ID can run
    if (message.author.id !== process.env.OWNER_ID) return;

    const categories = [
      { label: 'Crypto', value: 'Crypto', emoji: '💸' },
      { label: 'Game Items', value: 'InGame', emoji: '🕹️' },
      { label: 'NFTs', value: 'NFT', emoji: '🖼️' },
      { label: 'Services', value: 'Services', emoji: '🛠️' },
      { label: 'Trading', value: 'Trading', emoji: '📊' },
      { label: 'Accounts', value: 'Accounts', emoji: '🔑' },
      { label: 'Other', value: 'Other', emoji: '📌' },
    ];

    // Professional, spacious, premium embed
    const embed = new EmbedBuilder()
      .setTitle('🔒 Eldorado.gg • Official Middleman Service')
      .setDescription(
        `Welcome to **Eldorado.gg Secure Middleman System** — your trades are safe, verified, and professional.\n\n` +
        `✨ **Verified Middlemen Ensure:**\n` +
        `• 🛡️ Safe Transactions — all assets protected\n` +
        `• ❌ Zero Scam Tolerance — strict rules enforced\n` +
        `• 🔍 Transparent Deal Handling — full visibility\n` +
        `• 💰 Secure Asset Holding — until deal completion\n\n` +
        `📜 **Middleman Rules:**\n` +
        `• ✍️ Both traders must confirm terms clearly\n` +
        `• 🔒 Terms cannot be changed once MM holds assets\n` +
        `• ⚠️ Fake proof = instant blacklist\n` +
        `• 🚫 Impersonation = permanent ban\n` +
        `• 💸 Crypto trades require valid transaction proof\n` +
        `• ✅ Payments must be verified before release\n` +
        `• 🏛️ Middleman decisions are final\n\n` +
        `🛡️ **Security Notice:**\n` +
        `• ⚠️ Only trust tickets from this official panel\n` +
        `• 💬 Staff will never DM you first\n` +
        `• 🟢 Check role color & join date before trusting\n` +
        `• 📚 All tickets are logged & archived\n\n` +
        `📌 **Select your trade category below to begin**\n` +
        `🎯 Make your trade fast, secure, and professional!`
      )
      .setColor('#1F2937')
      .setFooter({ text: 'Eldorado.gg MM Panel', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    // Dropdown menu: professional, spaced, clear
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticketCategorySelect')
      .setPlaceholder('➤ Select your trade category')
      .addOptions(
        categories.map(c => ({
          label: `【${c.emoji}】 ${c.label}`,
          value: c.value,
          description: `Create a secure ${c.label} trade ticket`,
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};