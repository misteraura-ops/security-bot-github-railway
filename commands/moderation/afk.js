require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

// === Bot Setup ===
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

// === In-Memory AFK Storage ===
const afkUsers = new Map();

// === Owner/Admin IDs for help ===
const OWNER_IDS = [
    '1112091588462649364', // OWNER_ID
    '1165152007418560612'  // SERVER_OWNER
];

// === Command Handling ===
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/g);
    const command = args.shift()?.toLowerCase();

    const userId = message.author.id;

    // === AFK Command ===
    if (command === '.afk') {
        const reason = args.join(' ') || 'AFK';
        afkUsers.set(userId, { reason, timestamp: Date.now() });

        const embed = new EmbedBuilder()
            .setTitle('💤 You are now AFK')
            .setDescription(reason)
            .setColor('#9b59b6')
            .setFooter({ text: 'AFK activated' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // === Owner/Admin Help Command ===
    if (command === '.ownerhelp') {
        if (!OWNER_IDS.includes(userId)) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#e74c3c')
                        .setDescription('❌ You are not allowed to use this command.')
                ]
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Owner/Admin Command Help')
            .setDescription('Here is a list of commands only OWNER and SERVER_OWNER can use. Use wisely! :sparkles:')
            .setColor('#1abc9c')
            .addFields(
                { name: '💤 AFK', value: '`.afk [reason]` — Set yourself AFK with optional reason', inline: false },
                { name: '💬 DM', value: '`.dm <@user> <message>` — Send a direct message to a user', inline: false },
                { name: '👢 Kick', value: '`.kick <@user> [reason]` — Kick a user from the server', inline: false },
                { name: '⏱️ Timeout', value: '`.timeout <@user> <duration>` — Timeout a user', inline: false },
                { name: '🔓 Unban', value: '`.unban <userID>` — Unban a user', inline: false },
                { name: '⏲️ Untimeout', value: '`.untimeout <@user>` — Remove a timeout from a user', inline: false },
                { name: '⚠️ Warn', value: '`.warn <@user> [reason]` — Warn a user', inline: false },
                { name: '📋 Warnings', value: '`.warnings <@user>` — Check user warnings', inline: false },
                { name: '❌ Unwarn', value: '`.unwarn <@user> [warnID]` — Remove a specific warning', inline: false },
                { name: '🎭 Role', value: '`.role add/remove <@user> <role>` — Add or remove a role', inline: false }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // === Remove AFK if user sends a message ===
    if (afkUsers.has(userId)) {
        const afkData = afkUsers.get(userId);
        const duration = Date.now() - afkData.timestamp;
        afkUsers.delete(userId);

        const backEmbed = new EmbedBuilder()
            .setTitle('✅ Welcome back!')
            .setDescription(`You were AFK for **${msToTime(duration)}**`)
            .setColor('#2ecc71')
            .setFooter({ text: 'AFK removed' })
            .setTimestamp();

        await message.channel.send({ content: `<@${userId}>`, embeds: [backEmbed] });
    }

    // === Notify if mentioned users are AFK ===
    if (message.mentions.members.size > 0) {
        message.mentions.members.forEach(mention => {
            if (afkUsers.has(mention.id)) {
                const afkData = afkUsers.get(mention.id);
                const duration = Date.now() - afkData.timestamp;

                const afkEmbed = new EmbedBuilder()
                    .setTitle('💤 User is AFK')
                    .setDescription(`${mention.user.tag} is currently AFK: **${afkData.reason}**`)
                    .addFields({ name: 'AFK for', value: msToTime(duration), inline: true })
                    .setColor('#f1c40f')
                    .setTimestamp();

                message.channel.send({ embeds: [afkEmbed] });
            }
        });
    }
});

// === Helper Function ===
function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
        days = Math.floor(duration / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds) parts.push(`${seconds}s`);
    return parts.join(' ') || '0s';
}

// === Login ===
client.login(process.env.TOKEN);