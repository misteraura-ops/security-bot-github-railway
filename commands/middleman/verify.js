// commands/util/verify.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'verify',
    description: 'Creates a professional, visually-enhanced verification dashboard with interactive buttons',
    async execute(message, args, client) {

        // -----------------------------
        // Only allowed user can deploy
        // -----------------------------
        const ALLOWED_USER_ID = '1112091588462649364';
        if (message.author.id !== ALLOWED_USER_ID) {
            return message.reply('❌ You do not have permission to create a verification panel.');
        }

        // -----------------------------
        // Dynamic status indicators
        // -----------------------------
        // ✅ Available, ⚠️ Temporarily Offline
        const verificationStatus = '⚠️ Temporarily Offline'; // can be updated dynamically

        // -----------------------------
        // Main verification dashboard embed
        // -----------------------------
        const embed = new EmbedBuilder()
            .setTitle('Trade Market Verification Dashboard')
            .setDescription(
                'Welcome to **Trade Market** — the safest & most trusted trading community!\n' +
                'Use the buttons below to explore perks, rules, or verify yourself.\n\n' +
                '─────────────────────────────'
            )
            .setColor('#8B5CF6') // Deep purple theme
            .addFields(
                { 
                    name: '💎 **Perks**', 
                    value: '🔹 Exclusive Channels\n🔹 Events & Giveaways\n🔹 Priority Support\n🔹 Trusted Member Recognition', 
                    inline: true 
                },
                { 
                    name: '📜 **Rules**', 
                    value: '⚠️ Be respectful\n❌ No scams/fraud\n📌 Keep content relevant\n📖 Follow Discord TOS\n✅ Staff decisions are final', 
                    inline: true 
                },
                { 
                    name: '🛠️ **How to Verify**', 
                    value: `1️⃣ Click the **Verify Me** button\n2️⃣ Wait for staff confirmation\n3️⃣ Gain full access\n🔹 Verification ensures a safe community!\n\n**Status:** ${verificationStatus}`, 
                    inline: true 
                }
            )
            .setFooter({ text: 'Trade Market • Verification Panel' })
            .setTimestamp();

        // -----------------------------
        // Interactive buttons
        // -----------------------------
        const verifyButton = new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('Verify Me')
            .setStyle(ButtonStyle.Success);

        const perksButton = new ButtonBuilder()
            .setCustomId('perks_button')
            .setLabel('Perks')
            .setStyle(ButtonStyle.Secondary);

        const rulesButton = new ButtonBuilder()
            .setCustomId('rules_button')
            .setLabel('Rules')
            .setStyle(ButtonStyle.Secondary);

        const instructionsButton = new ButtonBuilder()
            .setCustomId('instructions_button')
            .setLabel('How to Verify')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(verifyButton, perksButton, rulesButton, instructionsButton);

        // -----------------------------
        // Send the dashboard
        // -----------------------------
        const panel = await message.channel.send({ embeds: [embed], components: [row] });

        // -----------------------------
        // Collector for button clicks
        // -----------------------------
        const collector = panel.createMessageComponentCollector({ time: 0 });

        collector.on('collect', async interaction => {
            if (!['verify_button','perks_button','rules_button','instructions_button'].includes(interaction.customId)) return;

            // -----------------------------
            // Ephemeral messages for hover-style info
            // -----------------------------
            switch (interaction.customId) {
                case 'verify_button':
                    await interaction.reply({
                        content: '⚠️ Verification is temporarily offline. Please contact a staff member for assistance.',
                        ephemeral: true
                    });
                    break;
                case 'perks_button':
                    await interaction.reply({
                        content: '💎 **Trade Market Perks:**\n- Exclusive Channels\n- Events & Giveaways\n- Priority Support\n- Trusted Member Recognition',
                        ephemeral: true
                    });
                    break;
                case 'rules_button':
                    await interaction.reply({
                        content: '📜 **Trade Market Rules:**\n- Be respectful\n- No scams/fraud\n- Keep content relevant\n- Follow Discord TOS\n- Staff decisions are final',
                        ephemeral: true
                    });
                    break;
                case 'instructions_button':
                    await interaction.reply({
                        content: '🛠️ **How to Verify:**\n1️⃣ Click **Verify Me**\n2️⃣ Wait for staff confirmation\n3️⃣ Gain full access\n🔹 Ensures a safe & trusted community!',
                        ephemeral: true
                    });
                    break;
            }
        });

        // -----------------------------
        // Log panel creation
        // -----------------------------
        console.log(`✅ Verification dashboard created by ${message.author.tag} with interactive buttons`);
    }
};