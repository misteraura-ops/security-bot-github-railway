const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const CLAIM_ROLE = process.env.CLAIM_ID;

module.exports = {
    name: 'sabmiddleman',
    description: 'Shows the Middleman Trade Procedure',

    async execute(message) {

        // Only CLAIM_ROLE can run
        if (!message.member.roles.cache.has(CLAIM_ROLE)) return;

        const embed = new EmbedBuilder()
            .setTitle('🛡 Middleman Trade Procedure')
            .setColor('#5865F2') // Discord blurple for professional look
            .setThumbnail('https://i.imgur.com/8KM1v8R.png') // optional MM icon
            .setDescription('Follow these steps to ensure a **fair, secure, and transparent trade** using a middleman (MM).')
            .addFields(
                {
                    name: '🔹 Step 1 – Middleman Setup',
                    value: '**Two Accounts Required:** The MM uses separate accounts for each trader. Both parties must add the MM on their respective accounts before the trade begins.'
                },
                {
                    name: '🔹 Step 2 – Item Collection',
                    value: '**Collect Items Sequentially:** Gather each party\'s items one at a time, following a clear order to avoid mistakes and ensure accountability.'
                },
                {
                    name: '🔹 Step 3 – Trade Distribution',
                    value: '**Return Items Safely:** After collecting, the MM rejoins the same server using the alternate account and returns items in the exact order they were collected.'
                },
                {
                    name: '🔹 Step 4 – Security & Fairness',
                    value: 'This structured process ensures the trade remains **fair, transparent, and secure** for everyone involved.'
                },
                {
                    name: '🔹 Step 5 – Optional Tip',
                    value: 'The final recipient may optionally provide a tip to the MM as a courtesy. Tips are **not mandatory** and can include Roblox items or real currency.'
                },
                {
                    name: '⚠️ Confirmation Required',
                    value: '**Both parties must confirm agreement** to this procedure before starting the trade.'
                }
            )
            .setFooter({ text: 'Middleman Trade Guide • Follow these steps carefully' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};