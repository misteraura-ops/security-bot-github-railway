// commands/middleman/verify.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'verifypanel',
    description: 'Sends a verification panel DM to users (currently disabled)',
    async execute(message, args) {
        const ALLOWED_USER_ID = '1112091588462649364'; // Only this ID can use the command

        // -------------------------
        // Restrict command usage
        // -------------------------
        if (message.author.id !== ALLOWED_USER_ID) {
            return message.reply('❌ You are not allowed to run this command.');
        }

        try {
            // -------------------------
            // Prepare DM embed
            // -------------------------
            const embed = new EmbedBuilder()
                .setTitle('🔒 Trade Market Verification Panel')
                .setDescription(
                    '⚠️ **Verification System is currently unavailable**\n\n' +
                    'The verification panel is temporarily not working.\n' +
                    'Please **contact a staff member** for assistance.\n\n' +
                    '💡 _This is an automated message for Trade Market users._'
                )
                .setColor('#8B5CF6') // Purple theme
                .setFooter({ text: 'Trade Market • Verification System' })
                .setTimestamp();

            // -------------------------
            // Send DM to command executor (or could be channel)
            // -------------------------
            await message.author.send({ embeds: [embed] }).catch(() => {
                message.reply('❌ Unable to DM the user. They may have DMs disabled.');
            });

            // -------------------------
            // Optional confirmation in channel
            // -------------------------
            message.reply('✅ Verification panel DM sent (or attempted).');

        } catch (err) {
            console.error('Error in verify command:', err);
            message.reply('❌ An error occurred while sending the verification panel.');
        }
    }
};