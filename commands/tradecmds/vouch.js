const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const VOUCH_DB = path.join(__dirname, '../../db/mmVouches.json');

module.exports = {
  name: 'vouch',
  description: 'Give a vouch to an MM',
  async execute(message, args) {
    if (!args[0]) return;

    const mention = args[0];
    const reason = args.slice(1).join(' ') || 'No reason provided';

    // Resolve member
    const mentionMatch = mention.match(/<@!?(\d+)>/);
    let member;
    if (mentionMatch) member = await message.guild.members.fetch(mentionMatch[1]).catch(() => null);
    if (!member && !isNaN(mention)) member = await message.guild.members.fetch(mention).catch(() => null);
    if (!member) member = message.guild.members.cache.find(
      m => m.user.username.toLowerCase() === mention.toLowerCase() ||
           (m.nickname && m.nickname.toLowerCase() === mention.toLowerCase())
    );

    if (!member) return;

    // Load DB
    const vouchDB = fs.existsSync(VOUCH_DB) ? JSON.parse(fs.readFileSync(VOUCH_DB, 'utf8')) : {};
    vouchDB[member.id] = (vouchDB[member.id] || 0) + 1;
    fs.writeFileSync(VOUCH_DB, JSON.stringify(vouchDB, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('💠 New Vouch Received')
      .setColor('#00BFFF')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'Vouched For', value: `<@${member.id}>`, inline: true },
        { name: 'Vouched By', value: `<@${message.author.id}>`, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Total Vouches', value: `${vouchDB[member.id]}`, inline: true }
      )
      .setFooter({ text: 'Kai Kingdom MM Trust System' })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] }).catch(() => {});
  },
};