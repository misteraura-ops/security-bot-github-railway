const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

// Config from .env
const OWNER_ID = process.env.OWNER_ID;
const KICK_PERM = process.env.KICK_PERM; // roles allowed to unban
const WHITELIST = process.env.WHITELIST?.split(',') || [];
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

// Cooldowns tracker
const cooldowns = new Map();

module.exports = {
    name: 'unban',
    description: 'Unban a member with full MMPANEL confirmation, DM, and case logging.',
    async execute(message, args, client) {
        const authorId = message.author.id;

        // ----------------------
        // Permission Check
        // ----------------------
        if (authorId !== OWNER_ID && !message.member.roles.cache.some(r => r.name === KICK_PERM)) {
            return message.channel.send({
                embeds: [new EmbedBuilder().setColor('#2b2d31').setDescription('❌ You do not have permission to use this command.')]
            });
        }

        // ----------------------
        // Cooldown Check
        // ----------------------
        if (authorId !== OWNER_ID && !WHITELIST.includes(authorId)) {
            const lastUnban = cooldowns.get(authorId) || 0;
            const now = Date.now();
            if (now - lastUnban < COOLDOWN_MS) {
                const remaining = Math.ceil((COOLDOWN_MS - (now - lastUnban)) / 60000);
                return message.channel.send({
                    embeds: [new EmbedBuilder().setColor('#e67e22').setDescription(`⏱ You are on cooldown. Wait **${remaining} minute(s)**.`)]
                });
            }
        }

        if (!args[0]) {
            return message.channel.send({
                embeds: [new EmbedBuilder().setColor('#2b2d31').setDescription('❌ Provide a user ID or username to unban.')]
            });
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';
        const targetIdentifier = args[0];

        // ----------------------
        // Data folder + files
        // ----------------------
        const dataDir = path.join(__dirname, 'data');
        await fs.mkdir(dataDir, { recursive: true });

        const caseFile = path.join(dataDir, 'cases.json');
        const warnFile = path.join(dataDir, 'warns.json');
        await Promise.all([
            fs.writeFile(caseFile, '{}').catch(() => {}),
            fs.writeFile(warnFile, '{}').catch(() => {})
        ]);

        const casesData = JSON.parse(await fs.readFile(caseFile, 'utf-8').catch(() => '{}'));
        const guildCases = casesData[message.guild.id] || [];
        const caseNumber = guildCases.length + 1;

        // ----------------------
        // Resolve banned user
        // ----------------------
        let banEntry;
        try { banEntry = await message.guild.bans.fetch(targetIdentifier); } catch {}
        if (!banEntry) {
            const bans = await message.guild.bans.fetch();
            banEntry = bans.find(b => b.user.username.toLowerCase() === targetIdentifier.toLowerCase());
        }
        const banId = banEntry?.user?.id || targetIdentifier;
        const banTag = banEntry?.user?.tag || targetIdentifier;

        // ----------------------
        // Warn history
        // ----------------------
        const warnsData = JSON.parse(await fs.readFile(warnFile, 'utf-8').catch(() => '{}'));
        const userWarns = warnsData[message.guild.id]?.[banId] || [];
        const warnHistory = userWarns.length ? userWarns.map((w, i) => `#${i+1}: ${w.reason} (${w.date})`).join('\n') : 'No previous warns';

        // ----------------------
        // DM Embed
        // ----------------------
        const dmEmbed = new EmbedBuilder()
            .setTitle(`You have been unbanned from ${message.guild.name}`)
            .setColor('#27ae60')
            .setDescription(`You were unbanned by **${message.author.tag}**`)
            .addFields(
                { name: 'Reason', value: reason, inline: false },
                { name: 'Moderator', value: message.author.tag, inline: true }
            )
            .setFooter({ text: 'MMPANEL • Automated moderation' })
            .setTimestamp();

        // ----------------------
        // Confirmation Panel
        // ----------------------
        const embed = new EmbedBuilder()
            .setTitle('Moderation Panel: Unban Member')
            .setColor('#27ae60')
            .setThumbnail(banEntry?.user.displayAvatarURL?.({ dynamic: true }) || 'https://i.imgur.com/Uw1fJ3K.png')
            .setDescription(`You are about to **unban** ${banEntry ? `<@${banId}>` : banId}\nPlease confirm below.`)
            .addFields(
                { name: 'Target', value: banId, inline: true },
                { name: 'Moderator', value: `<@${authorId}>`, inline: true },
                { name: 'Reason', value: reason, inline: false },
                { name: 'Warn History', value: warnHistory, inline: false },
                { name: 'Status', value: 'Awaiting confirmation...', inline: false },
                { name: 'Case Number', value: `#${caseNumber}`, inline: true }
            )
            .setFooter({ text: 'MMPANEL • Click Confirm to execute' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('unban_confirm').setLabel('Confirm Unban').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('unban_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
            );

        const panel = await message.channel.send({ embeds: [embed], components: [row] });

        // ----------------------
        // Collector
        // ----------------------
        const collector = panel.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== authorId) return interaction.reply({ content: 'Only the command executor can click!', flags: 64 });

            await interaction.deferUpdate();

            if (interaction.customId === 'unban_confirm') {
                try {
                    const tasks = [];
                    tasks.push(client.users.fetch(banId).then(u => u.send({ embeds: [dmEmbed] })).catch(() => {}));
                    tasks.push(message.guild.members.unban(banId, reason));

                    if (authorId !== OWNER_ID && !WHITELIST.includes(authorId)) cooldowns.set(authorId, Date.now());

                    // Save case
                    guildCases.push({ case: caseNumber, user: banId, moderator: authorId, reason, action: 'unban', date: new Date() });
                    casesData[message.guild.id] = guildCases;
                    tasks.push(fs.writeFile(caseFile, JSON.stringify(casesData, null, 4)));

                    // Mod log
                    const modLog = await client.getModLogChannel(message.guild);
                    if (modLog) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Member Unbanned')
                            .setColor('#27ae60')
                            .addFields(
                                { name: 'User', value: banTag, inline: false },
                                { name: 'Moderator', value: message.author.tag, inline: false },
                                { name: 'Reason', value: reason, inline: false },
                                { name: 'Case Number', value: `#${caseNumber}`, inline: false }
                            )
                            .setTimestamp();
                        tasks.push(modLog.send({ embeds: [logEmbed] }));
                    }

                    await Promise.all(tasks);

                    const updated = EmbedBuilder.from(embed).setColor('#27ae60').spliceFields(4, 1, { name: 'Status', value: '✅ Member successfully unbanned' });
                    await panel.edit({ embeds: [updated], components: [] });

                } catch (err) {
                    console.error(err);
                    const failed = EmbedBuilder.from(embed).setColor('#e74c3c').spliceFields(4, 1, { name: 'Status', value: '❌ Failed to unban. Check ID or permissions.' });
                    await panel.edit({ embeds: [failed], components: [] });
                }

                collector.stop();
            }

            if (interaction.customId === 'unban_cancel') {
                const cancelled = EmbedBuilder.from(embed).setColor('#7f8c8d').spliceFields(4, 1, { name: 'Status', value: 'Unban cancelled.' });
                await panel.edit({ embeds: [cancelled], components: [] });
                collector.stop();
            }
        });

        collector.on('end', collected => {
            if (!collected.size) {
                const timeout = EmbedBuilder.from(embed).setColor('#95a5a6').spliceFields(4, 1, { name: 'Status', value: '⏱ Confirmation timed out.' });
                panel.edit({ embeds: [timeout], components: [] }).catch(() => {});
            }
        });
    }
};