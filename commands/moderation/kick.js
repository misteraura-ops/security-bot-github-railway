const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const fs = require('fs');
const path = require('path');

// Config from .env
const OWNER_ID = process.env.OWNER_ID;
const KICK_PERM = process.env.KICK_PERM; 
const WHITELIST = process.env.WHITELIST?.split(',') || [];
const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

// Cooldowns tracker
const cooldowns = new Map();

module.exports = {
    name: 'kick',
    description: 'Kick a member with full MMPANEL confirmation, DM, and case logging.',
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
            const lastKick = cooldowns.get(authorId) || 0;
            const now = Date.now();
            if (now - lastKick < COOLDOWN_MS) {
                const remaining = Math.ceil((COOLDOWN_MS - (now - lastKick)) / 60000);
                return message.channel.send({
                    embeds: [new EmbedBuilder().setColor('#e67e22').setDescription(`⏱ You are on cooldown. Please wait **${remaining} minute(s)** before kicking again.`)]
                });
            }
        }

        // ----------------------
        // Input Validation
        // ----------------------
        if (!args[0]) {
            return message.channel.send({
                embeds: [new EmbedBuilder().setColor('#2b2d31').setDescription('❌ Please provide a mention, username, or user ID to kick.')]
            });
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        // ----------------------
        // Resolve Target
        // ----------------------
        let target;
        if (message.mentions.members.first()) {
            target = message.mentions.members.first();
        } else {
            target = await message.guild.members.fetch(args[0]).catch(() => null);
            if (!target) target = message.guild.members.cache.find(m => m.user.username.toLowerCase() === args[0].toLowerCase());
        }
        const targetId = target ? target.id : args[0];
        const targetTag = target?.user?.tag || args[0];

        // ----------------------
        // DM Embed
        // ----------------------
        const dmEmbed = new EmbedBuilder()
            .setTitle(`⚠️ You have been kicked from ${message.guild.name}`)
            .setColor('#c0392b')
            .setDescription(`You were kicked by **${message.author.tag}**`)
            .addFields(
                { name: 'Reason', value: reason, inline: false },
                { name: 'Moderator', value: message.author.tag, inline: true }
            )
            .setFooter({ text: 'MMPANEL • Automated moderation' })
            .setTimestamp();

        // ----------------------
        // Data folder + files
        // ----------------------
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

        const caseFile = path.join(dataDir, 'cases.json');
        if (!fs.existsSync(caseFile)) fs.writeFileSync(caseFile, '{}');
        const casesData = JSON.parse(fs.readFileSync(caseFile, 'utf-8'));
        const guildCases = casesData[message.guild.id] || [];
        const caseNumber = guildCases.length + 1;

        // ----------------------
        // Warn history
        // ----------------------
        const warnFile = path.join(dataDir, 'warns.json');
        if (!fs.existsSync(warnFile)) fs.writeFileSync(warnFile, '{}');
        const warnsData = JSON.parse(fs.readFileSync(warnFile, 'utf-8'));
        let warnHistory = 'No previous warns';
        const userWarns = warnsData[message.guild.id]?.[targetId] || [];
        if (userWarns.length) {
            warnHistory = userWarns.map((w, i) => `#${i+1}: ${w.reason} (${w.date})`).join('\n');
        }

        // ----------------------
        // OWNER_ID bypass panel
        // ----------------------
        if (authorId === OWNER_ID) {
            try {
                if (target) await target.kick(reason);
                await client.users.fetch(targetId).then(u => u.send({ embeds: [dmEmbed] })).catch(() => {});

                // Apply cooldown (not needed for OWNER_ID)
                // Save case
                guildCases.push({ case: caseNumber, user: targetId, moderator: authorId, reason, action: 'kick', date: new Date() });
                casesData[message.guild.id] = guildCases;
                fs.writeFileSync(caseFile, JSON.stringify(casesData, null, 4));

                // Mod-log
                const modLog = await client.getModLogChannel(message.guild);
                if (modLog) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('⚠️ Member Kicked')
                        .setColor('#c0392b')
                        .addFields(
                            { name: 'User', value: targetTag, inline: false },
                            { name: 'Moderator', value: message.author.tag, inline: false },
                            { name: 'Reason', value: reason, inline: false },
                            { name: 'Case Number', value: `#${caseNumber}`, inline: false }
                        )
                        .setTimestamp();
                    modLog.send({ embeds: [logEmbed] });
                }

                return message.channel.send({ embeds: [new EmbedBuilder().setColor('#27ae60').setDescription(`✅ ${targetTag} kicked successfully.`)] });
            } catch (err) {
                console.error(err);
                return message.channel.send({ embeds: [new EmbedBuilder().setColor('#e74c3c').setDescription('❌ Failed to kick.') ] });
            }
        }

        // ----------------------
        // Normal user: show panel
        // ----------------------
        const embed = new EmbedBuilder()
            .setTitle('Moderation Panel: Kick Member')
            .setColor('#c0392b')
            .setThumbnail(target?.user.displayAvatarURL({ dynamic: true }) || 'https://i.imgur.com/Uw1fJ3K.png')
            .setDescription(`You are about to **kick** ${target ? `<@${targetId}>` : targetId}\nPlease confirm below.`)
            .addFields(
                { name: 'Target', value: target ? `<@${targetId}>` : targetId, inline: true },
                { name: 'Moderator', value: `<@${authorId}>`, inline: true },
                { name: 'Reason', value: reason, inline: false },
                { name: 'Warn History', value: warnHistory, inline: false },
                { name: 'Status', value: '⏳ Awaiting confirmation...', inline: false },
                { name: 'Case Number', value: `#${caseNumber}`, inline: true }
            )
            .setFooter({ text: 'MMPANEL • Click Confirm to execute' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('kick_confirm').setLabel('✅ Confirm Kick').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('kick_cancel').setLabel('❌ Cancel').setStyle(ButtonStyle.Secondary)
            );

        const panel = await message.channel.send({ embeds: [embed], components: [row] });

        // ----------------------
        // Collector
        // ----------------------
        const collector = panel.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== authorId) return interaction.reply({ content: 'Only the command executor can click!', flags: 64 });
            await interaction.deferUpdate();

            if (interaction.customId === 'kick_confirm') {
                try {
                    const tasks = [];
                    if (target) tasks.push(target.kick(reason));
                    tasks.push(client.users.fetch(targetId).then(u => u.send({ embeds: [dmEmbed] })).catch(() => {}));

                    if (!WHITELIST.includes(authorId)) cooldowns.set(authorId, Date.now());

                    guildCases.push({ case: caseNumber, user: targetId, moderator: authorId, reason, action: 'kick', date: new Date() });
                    casesData[message.guild.id] = guildCases;
                    tasks.push(fs.writeFileSync(caseFile, JSON.stringify(casesData, null, 4)));

                    // Mod-log
                    const modLog = await client.getModLogChannel(message.guild);
                    if (modLog) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('⚠️ Member Kicked')
                            .setColor('#c0392b')
                            .addFields(
                                { name: 'User', value: targetTag, inline: false },
                                { name: 'Moderator', value: message.author.tag, inline: false },
                                { name: 'Reason', value: reason, inline: false },
                                { name: 'Case Number', value: `#${caseNumber}`, inline: false }
                            )
                            .setTimestamp();
                        tasks.push(modLog.send({ embeds: [logEmbed] }));
                    }

                    await Promise.all(tasks);

                    const updated = EmbedBuilder.from(embed).setColor('#27ae60').spliceFields(4, 1, { name: 'Status', value: '✅ Member successfully kicked' });
                    await panel.edit({ embeds: [updated], components: [] });

                } catch (err) {
                    console.error(err);
                    const failed = EmbedBuilder.from(embed).setColor('#e74c3c').spliceFields(4, 1, { name: 'Status', value: '❌ Failed to kick. Check ID or permissions.' });
                    await panel.edit({ embeds: [failed], components: [] });
                }

                collector.stop();
            }

            if (interaction.customId === 'kick_cancel') {
                const cancelled = EmbedBuilder.from(embed).setColor('#7f8c8d').spliceFields(4, 1, { name: 'Status', value: '⚠️ Kick cancelled.' });
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