const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const CLAIM_ROLE = process.env.CLAIM_ID;
const LOG_CHANNEL = process.env.TRADE_LOG_CHANNEL;

const dataPath = path.join(__dirname, '../../data/tradelogs.json');

function ensureDataFile() {
    if (!fs.existsSync(path.dirname(dataPath))) {
        fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    }

    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({
            traders: {}
        }, null, 2));
    }
}

function parseProfit(input) {
    if (!input) return null;

    let cleaned = input
        .toLowerCase()
        .replace(/\$/g, '')
        .replace(/,/g, '')
        .trim();

    if (cleaned.endsWith('k')) {
        return parseFloat(cleaned.replace('k', '')) * 1000;
    }

    return Number(cleaned);
}

module.exports = {
    name: 'log',

    async execute(message, args) {

        if (!message.member.roles.cache.has(CLAIM_ROLE)) {
            return message.reply('❌ You do not have permission to log trades.');
        }

        if (!args.length) {

            const guide = new EmbedBuilder()
                .setTitle('📊 Trade Log Command Guide')
                .setColor('#2b2d31')
                .setDescription(`
**Usage**
\`$log <h1t> <h1tter> <profit> <split>\`

**Example**
\`$log @H1T @H1TTER 1200 70/30\`

**Arguments**

**H1T**
Mention or user ID.

**H1TTER**
Mention or user ID.

**Profit**
Total trade profit.

Examples:
\`1200\`
\`1,200\`
\`1200$\`
\`1.2k\`

**Split**
You can write anything here.

Example:
\`$log @User1 @User2 1500 custom split\`
                `);

            return message.channel.send({ embeds: [guide] });
        }

        const h1tArg = args[0];
        const h1tterArg = args[1];
        const profitArg = args[2];
        const splitArg = args.slice(3).join(' ');

        if (!h1tArg || !h1tterArg || !profitArg || !splitArg) {
            return message.reply('❌ Invalid usage. Run `$log` to see the guide.');
        }

        const h1t =
            message.mentions.users.first() ||
            await message.client.users.fetch(h1tArg).catch(() => null);

        const h1tter =
            message.mentions.users.at(1) ||
            await message.client.users.fetch(h1tterArg).catch(() => null);

        if (!h1t || !h1tter) {
            return message.reply('❌ Could not find the users.');
        }

        const profit = parseProfit(profitArg);

        if (!profit || isNaN(profit)) {
            return message.reply('❌ Invalid profit amount.');
        }

        ensureDataFile();

        let data = JSON.parse(fs.readFileSync(dataPath));

        if (!data.traders) data.traders = {};

        if (!data.traders[h1t.id]) {
            data.traders[h1t.id] = {
                totalProfit: 0,
                trades: 0
            };
        }

        data.traders[h1t.id].totalProfit += profit;
        data.traders[h1t.id].trades += 1;

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        const attachments = message.attachments.map(a => a.url);

        const embed = new EmbedBuilder()
            .setTitle('💰 Trade Logged')
            .setColor('#2b2d31')
            .addFields(
                { name: 'Hit', value: `<@${h1t.id}>`, inline: true },
                { name: 'Hitter', value: `<@${h1tter.id}>`, inline: true },
                { name: 'Logged By', value: `<@${message.author.id}>`, inline: true },
                { name: 'Profit', value: `$${profit.toLocaleString()}`, inline: true },
                { name: 'Split', value: splitArg, inline: true },
                { name: 'Total Hits', value: `${data.traders[h1t.id].trades}`, inline: true },
                { name: 'Hitter Profit', value: `$${data.traders[h1t.id].totalProfit.toLocaleString()}`, inline: true }
            )
            .setTimestamp();

        if (attachments.length) {
            embed.setImage(attachments[0]);
        }

        const logChannel = message.guild.channels.cache.get(LOG_CHANNEL);

        if (!logChannel) {
            return message.reply('❌ Log channel not found.');
        }

        logChannel.send({
            embeds: [embed],
            files: attachments.slice(1)
        });

        message.reply('✅ Trade successfully logged.');
    }
};