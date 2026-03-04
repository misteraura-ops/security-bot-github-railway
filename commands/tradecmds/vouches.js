const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'vouches',
  description: 'Shows the vouches of a user',
  async execute(message, args) {
    const mmVouchesPath = path.join(__dirname, '../../db/mmVouches.json');
    const vouchData = fs.existsSync(mmVouchesPath) ? JSON.parse(fs.readFileSync(mmVouchesPath)) : {};

    let member;

    if (args[0]) {
      // Resolve mentioned user / ID / username
      const input = args.join(' ');
      const mention = input.match(/<@!?(\d+)>/);
      if (mention) member = await message.guild.members.fetch(mention[1]).catch(() => null);
      else if (!isNaN(input)) member = await message.guild.members.fetch(input).catch(() => null);
      else member = message.guild.members.cache.find(
        m => m.user.username.toLowerCase() === input.toLowerCase() ||
             (m.nickname && m.nickname.toLowerCase() === input.toLowerCase())
      );
      if (!member) return; // silently fail if not found
    } else {
      member = message.member; // self if no args
    }

    const userVouches = vouchData[member.id] || 0;

    const embed = new EmbedBuilder()
      .setTitle(`📝 Vouches • ${member.user.tag}`)
      .setColor('#00BFFF')
      .setDescription(`This shows the current vouches for <@${member.id}>.`)
      .addFields(
        { name: 'Vouches', value: `${userVouches}`, inline: true },
        { name: 'Middleman Status', value: '✅ Trusted', inline: true },
        { name: 'Pro Tip', value: 'More vouches = more credibility in the MM system!' }
      )
      .setFooter({ text: 'Kai Kingdom MM System • Security Bot' })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] }).catch(() => {});
  }
};