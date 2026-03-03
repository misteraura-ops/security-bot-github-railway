const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  name: 'mmpanel',
  async execute(message, args, client) {
    const categories = [
      { label: 'Crypto', value: 'Crypto', emoji: '💰' },
      { label: 'In-game Items', value: 'InGame', emoji: '🎮' },
      { label: 'NFT', value: 'NFT', emoji: '🖼️' },
      { label: 'Services', value: 'Services', emoji: '⚙️' },
      { label: 'Trading', value: 'Trading', emoji: '📈' },
      { label: 'Accounts', value: 'Accounts', emoji: '🗝️' },
      { label: 'Other', value: 'Other', emoji: '📌' },
    ];

    const embed = new EmbedBuilder()
      .setTitle('🔒 ⚔ Kai Kingdom • Official Middleman Service ⚔')
      .setDescription(`Welcome to Kai Kingdom Secure Middleman System — your trades are safe, transparent, and protected.

✨ Verified middlemen ensure:
• 🛡️ Safe Transactions
• ❌ Zero Scam Tolerance
• 🔍 Transparent Deal Handling
• 💰 Secure Asset Holding

━━━━━━━━━━━━━━━━
📜 Middleman Rules
• ✍️ Confirm deal terms clearly
• 🔒 Terms locked after MM holds assets
• ⚠️ Fake proof = blacklist
• 🚫 Impersonation = permanent ban
• 💸 Crypto trades require TX proof
• ✅ Payments verified before release
• 🏛️ MM decision final

━━━━━━━━━━━━━━━━
🛡️ Security Notice
• ⚠️ Only trust official tickets
• 💬 Staff never DM first
• 🟢 Check role color & join date
• 📚 Tickets logged & archived
━━━━━━━━━━━━━━━━
📌 Select trade category below to begin
🎯 Make your trade safe, fast, and professional!`)
      .setColor(0x1d82f5); // integer color

    const select = new StringSelectMenuBuilder()
      .setCustomId('ticketCategorySelect')
      .setPlaceholder('Select trade category')
      .addOptions(categories.map(c => ({
        label: c.label,
        value: c.value,
        emoji: c.emoji
      })));

    const row = new ActionRowBuilder().addComponents(select);

    await message.channel.send({ embeds: [embed], components: [row] }).catch(console.error);
  },
};