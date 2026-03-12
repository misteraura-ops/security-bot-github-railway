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
            traders: {},
            global: {
                totalProfit: 0,
                totalTrades: 0
            }
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
\`$log <trader> <profit> <split>\`

**Example**
\`$log @Trader 1200 70/30\`

**Arguments**

**Trader**
Mention or user ID of the trader.

**Profit**
Total profit from the trade.
Examples:
\`1200\`
\`1,200\`
\`1200$\`
\`1.2k\`

**Split**
Profit split between trader and host.

Examples:
\`50/50\`
\`60/40\`
\`70/30\`

**Attachments**
You can attach screenshots or proof of the trade when sending the command.

Example:
\`$log @User 1500 70/30\`
                `);

            return message.channel.send({ embeds: [guide] });
        }

        const traderArg = args[0];
        const profitArg = args[1];
        const splitArg = args[2];

        if (!traderArg || !profitArg || !splitArg) {
            return message.reply('❌ Invalid usage. Run `$log` to see the guide.');
        }

        const trader =
            message.mentions.users.first() ||
            await message.client.users.fetch(traderArg).catch(() => null);

        if (!trader) {
            return message.reply('❌ Trader not found.');
        }

        const profit = parseProfit(profitArg);

        if (!profit || isNaN(profit)) {
            return message.reply('❌ Invalid profit amount.');
        }

        if (!splitArg.includes('/')) {
            return message.reply('❌ Invalid split format. Example: 70/30');
        }

        const splitParts = splitArg.split('/');
        const traderPercent = Number(splitParts[0]);
        const hostPercent = Number(splitParts[1]);

        if (isNaN(traderPercent) || isNaN(hostPercent)) {
            return message.reply('❌ Invalid split numbers.');
        }

        const traderShare = Math.floor((profit * traderPercent) / 100);
        const hostShare = Math.floor((profit * hostPercent) / 100);

        ensureDataFile();

        const data = JSON.parse(fs.readFileSync(dataPath));

        if (!data.traders[trader.id]) {
            data.traders[trader.id] = {
                totalProfit: 0,
                traderShare: 0,
                hostShare: 0,
                trades: 0
            };
        }

        data.traders[trader.id].totalProfit += profit;
        data.traders[trader.id].traderShare += traderShare;
        data.traders[trader.id].hostShare += hostShare;
        data.traders[trader.id].trades += 1;

        data.global.totalProfit += profit;
        data.global.totalTrades += 1;

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        const attachments = message.attachments.map(a => a.url);

        const embed = new EmbedBuilder()
            .setTitle('💰 Trade Logged')
            .setColor('#2b2d31')
            .addFields(
                { name: 'Trader', value: `<@${trader.id}>`, inline: true },
                { name: 'Logged By', value: `<@${message.author.id}>`, inline: true },
                { name: 'Profit', value: `$${profit.toLocaleString()}`, inline: true },
                { name: 'Split', value: splitArg, inline: true },
                { name: 'Trader Earned', value: `$${traderShare.toLocaleString()}`, inline: true },
                { name: 'Host Earned', value: `$${hostShare.toLocaleString()}`, inline: true },
                { name: 'Trader Total Trades', value: `${data.traders[trader.id].trades}`, inline: true },
                { name: 'Trader Total Profit', value: `$${data.traders[trader.id].totalProfit.toLocaleString()}`, inline: true },
                { name: 'Server Total Profit', value: `$${data.global.totalProfit.toLocaleString()}`, inline: true }
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