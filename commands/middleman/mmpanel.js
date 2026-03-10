require('dotenv').config();
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  name: 'mmpanel',
  async execute(message, args, client) {

    // Only OWNER_ID can run
    if (message.author.id !== process.env.OWNER_ID?.trim()) return;

    // -----------------------------
    // Trade categories with detailed descriptions
    // -----------------------------
    const categories = [
      { label: 'Crypto', value: 'Crypto', emoji: '💸', desc: 'Secure crypto trades — BTC, ETH, tokens, verified transactions' },
      { label: 'Game Items', value: 'InGame', emoji: '🕹️', desc: 'Trade in-game items safely — skins, lootboxes, accounts' },
      { label: 'NFTs', value: 'NFT', emoji: '🖼️', desc: 'Verified NFT trades — art, collectibles, digital assets' },
      { label: 'Services', value: 'Services', emoji: '🛠️', desc: 'Offer or request services — coding, guides, designs' },
      { label: 'Trading', value: 'Trading', emoji: '📊', desc: 'Secure trading deals — P2P, stocks, market exchanges' },
      { label: 'Accounts', value: 'Accounts', emoji: '🔑', desc: 'Account exchanges — game/social accounts, safe transfer' },
      { label: 'Other', value: 'Other', emoji: '📌', desc: 'Other trades — fully secure and monitored' },
    ];

    // -----------------------------
    // Enhanced panel embed
    // -----------------------------
    const embed = new EmbedBuilder()
      .setTitle('🔒 Trade Market • Official Middleman Service')
      .setDescription(
        `Welcome to **Trade Market Secure Middleman System** — your trades are **safe, verified, and professional**.\n\n` +
        `✨ **Verified Middlemen Ensure:**\n` +
        `• 🛡️ Safe transactions — assets protected\n` +
        `• ❌ Zero scam tolerance — strict enforcement\n` +
        `• 🔍 Transparent deal handling\n` +
        `• 💰 Secure asset holding until completion\n\n` +
        `📜 **Middleman Rules:**\n` +
        `• ✍️ Both traders must clearly confirm deal terms\n` +
        `• 🔒 Terms cannot change once assets are held\n` +
        `• ⚠️ Fake proof results in blacklist\n` +
        `• 🚫 Impersonation results in permanent ban\n` +
        `• 💸 Crypto trades require valid transaction proof\n` +
        `• ✅ Payments must be verified before release\n` +
        `• 🏛️ Middleman decisions are final\n\n` +
        `🛡️ **Security Notice:**\n` +
        `• Only trust tickets opened from this panel\n` +
        `• Staff will **never DM you first**\n` +
        `• Verify staff roles before trusting\n` +
        `• All tickets are logged and archived\n\n` +
        `\u200B\n📌 **Select your trade category below to begin**`
      )
      .setColor('#8B5CF6')
      .setFooter({ text: 'Trade Market • MM Panel', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    // -----------------------------
    // Dropdown menu
    // -----------------------------
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticketCategorySelect')
      .setPlaceholder('➤ Select your trade category')
      .addOptions(
        categories.map(c => ({
          label: `【${c.emoji}】 ${c.label}`,
          value: c.value,
          description: c.desc
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // -----------------------------
    // Send the panel
    // -----------------------------
    await message.channel.send({ embeds: [embed], components: [row] });
  }
};