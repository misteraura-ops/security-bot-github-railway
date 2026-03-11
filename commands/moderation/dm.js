const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const OWNER_ID = '1112091588462649364';
const SERVER_OWNER = '1135999619541774386';
const WHITELIST = process.env.WHITELIST ? process.env.WHITELIST.split(',').map(id => id.trim()) : [];
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const DM_LOG_CHANNEL = process.env.DM_LOG_CHANNEL;

const cooldowns = new Map();
const dataDir = path.join(__dirname, 'data');
const progressFile = path.join(dataDir, 'dm_progress.json');
const embedConfigFile = path.join(dataDir, 'dm_embed_config.json');

module.exports = {
  name: 'dm',
  description: 'Send DM to user(s) or role(s). Use .dmembed for embed messages.',
  async execute(message, args, client) {
    const authorId = message.author.id;

    if (authorId !== OWNER_ID && authorId !== SERVER_OWNER && !WHITELIST.includes(authorId))
      return message.channel.send('❌ You do not have permission.');

    if (!args[0] || !args[1]) return message.channel.send('❌ Provide target(s) and a message.');

    const text = args.slice(1).join(' ');
    const isEmbed = message.content.startsWith('.dmembed');

    // Cooldown
    if (authorId !== OWNER_ID && authorId !== SERVER_OWNER && !WHITELIST.includes(authorId)) {
      const last = cooldowns.get(authorId) || 0;
      const now = Date.now();
      if (now - last < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - last) / 1000);
        return message.channel.send(`⏱ Wait **${remaining}s** before sending again.`);
      }
    }

    await fs.mkdir(dataDir, { recursive: true });
    const progressData = JSON.parse(await fs.readFile(progressFile, 'utf-8').catch(() => '{}'));
    const embedConfig = JSON.parse(await fs.readFile(embedConfigFile, 'utf-8').catch(() => '{}'));

    // -------------------------
    // Resolve multiple targets
    // -------------------------
    const targets = [];
    const resolvedRoles = [];
    const mentionArgs = args[0].split(','); // comma separated multiple targets

    for (const argRaw of mentionArgs) {
      const arg = argRaw.trim();

      // Role mention <@&ID>
      const roleMentionMatch = arg.match(/^<@&(\d+)>$/);
      if (roleMentionMatch) {
        const role = message.guild.roles.cache.get(roleMentionMatch[1]);
        if (role) {
          resolvedRoles.push(role);
          targets.push(...role.members.map(m => m.user));
          continue;
        }
      }

      // User mention <@ID> or <@!ID>
      const userMentionMatch = arg.match(/^<@!?(\d+)>$/);
      if (userMentionMatch) {
        try { targets.push(await client.users.fetch(userMentionMatch[1])); continue; } catch {}
      }

      // Numeric ID
      if (!isNaN(arg)) {
        try { targets.push(await client.users.fetch(arg)); continue; } catch {
          const role = message.guild.roles.cache.get(arg);
          if (role) { resolvedRoles.push(role); targets.push(...role.members.map(m => m.user)); continue; }
        }
      }

      // Role by name
      const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === arg.toLowerCase());
      if (role) { resolvedRoles.push(role); targets.push(...role.members.map(m => m.user)); continue; }

      // Username / nickname
      const member = message.guild.members.cache.find(
        m => m.user.username.toLowerCase() === arg.toLowerCase() ||
             (m.nickname && m.nickname.toLowerCase() === arg.toLowerCase())
      );
      if (member) targets.push(member.user);
    }

    // Remove duplicates
    const uniqueTargets = [...new Map(targets.map(u => [u.id, u])).values()];
    if (!uniqueTargets.length) return message.channel.send('❌ No valid users or roles found.');

    const key = `${message.guild.id}_${authorId}_${isEmbed ? 'embed' : 'text'}`;
    const sentList = progressData[key] || [];
    const finalTargets = uniqueTargets.filter(u => !sentList.includes(u.id));
    if (!finalTargets.length) return message.channel.send('✅ All users have already received this DM.');

    // Confirmation embed
    const confirmEmbed = new EmbedBuilder()
      .setTitle('📨 DM Confirmation')
      .setColor('#3498db')
      .setDescription(`You are about to DM **${finalTargets.length} user(s)**`)
      .addFields(
        { name: 'Targets', value: [
            ...resolvedRoles.map(r => `Role: <@&${r.id}> (${r.members.size} members)`),
            ...finalTargets.slice(0, 10).map(u => `User: <@${u.id}>`)
          ].join('\n') + (finalTargets.length > 10 ? `\n...and ${finalTargets.length-10} more users` : ''), inline: false },
        { name: 'Message Preview', value: text.length > 1024 ? text.slice(0,1020)+'...' : text }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('dm_confirm').setLabel('✅ Confirm').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('dm_cancel').setLabel('❌ Cancel').setStyle(ButtonStyle.Danger)
    );

    const panel = await message.channel.send({ embeds: [confirmEmbed], components: [row] });
    const collector = panel.createMessageComponentCollector({ time: 30000 });

    collector.on('collect', async i => {
      if (i.user.id !== authorId) return i.reply({ content: 'Only the command executor can click!', ephemeral: true });
      await i.deferUpdate();

      if (i.customId === 'dm_confirm') {
        cooldowns.set(authorId, Date.now());
        await sendDMs(finalTargets, text, isEmbed, message, client, key, progressData, embedConfig, resolvedRoles);
        await panel.edit({ embeds: [EmbedBuilder.from(confirmEmbed).setColor('#2ecc71').setDescription('✅ DMs sending started!')], components: [] });
        collector.stop();
      }

      if (i.customId === 'dm_cancel') {
        await panel.edit({ embeds: [EmbedBuilder.from(confirmEmbed).setColor('#e74c3c').setDescription('❌ DM cancelled.')], components: [] });
        collector.stop();
      }
    });

    collector.on('end', collected => {
      if (!collected.size) {
        panel.edit({ embeds: [EmbedBuilder.from(confirmEmbed).setColor('#95a5a6').setDescription('⏱ Confirmation timed out.')], components: [] }).catch(() => {});
      }
    });
  }
};

// DM sender with batch, embed customization, and DM_LOG_CHANNEL
async function sendDMs(targets, text, isEmbed, message, client, key, progressData, embedConfig, resolvedRoles) {
  const progressEmbed = new EmbedBuilder()
    .setTitle('📨 Sending DMs...')
    .setDescription(`0 / ${targets.length} sent`)
    .setColor('#3498db')
    .setFooter({ text: `Initiated by ${message.author.tag}` })
    .setTimestamp();

  const cancelButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('dm_stop').setLabel('⏹ Stop Sending').setStyle(ButtonStyle.Danger)
  );

  const progressMessage = await message.channel.send({ embeds: [progressEmbed], components: [cancelButton] });

  let sent = 0, failed = 0, stopped = false;
  const collector = progressMessage.createMessageComponentCollector({ time: 0 });
  collector.on('collect', async i => {
    if (i.user.id !== message.author.id) return i.reply({ content: 'Only the command executor can stop this.', ephemeral: true });
    if (i.customId === 'dm_stop') stopped = true;
    await i.deferUpdate();
  });

  const batchSize = 5;
  for (let i = 0; i < targets.length; i += batchSize) {
    if (stopped) break;
    const batch = targets.slice(i, i + batchSize);
    await Promise.all(batch.map(async user => {
      try {
        let dmEmbed = null;
        if (isEmbed) {
          let color = '#3498db', title = '📩 Message from Staff', footer = `Sent by ${message.author.tag}`;
          for (const role of resolvedRoles) {
            if (embedConfig[role.id]) {
              const cfg = embedConfig[role.id];
              color = cfg.color || color;
              title = cfg.title || title;
              footer = cfg.footer || footer;
              break; // use first matching role
            }
          }
          dmEmbed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(text).setFooter({ text: footer }).setTimestamp();
          await user.send({ embeds: [dmEmbed] });
        } else {
          await user.send(text);
        }
        sent++;
        progressData[key] = progressData[key] || [];
        progressData[key].push(user.id);
      } catch {
        failed++;
      }
    }));

    await fs.writeFile(progressFile, JSON.stringify(progressData, null, 4));

    const barLength = 20;
    const progress = Math.floor((sent / targets.length) * barLength);
    const bar = '█'.repeat(progress) + '—'.repeat(barLength - progress);
    const updatedEmbed = EmbedBuilder.from(progressEmbed)
      .setDescription(`Progress: [${bar}]\n✅ Sent: ${sent}\n❌ Failed: ${failed}\n📨 Total: ${targets.length}`);
    await progressMessage.edit({ embeds: [updatedEmbed] });

    await new Promise(res => setTimeout(res, 500)); // smooth sending
  }

  const finalEmbed = EmbedBuilder.from(progressEmbed)
    .setTitle(stopped ? '🛑 DM Sending Stopped' : '📬 DM Sending Complete')
    .setColor(stopped ? '#e74c3c' : '#2ecc71')
    .setDescription(`✅ Sent: ${sent}\n❌ Failed: ${failed}\n📨 Total: ${targets.length}`);
  await progressMessage.edit({ embeds: [finalEmbed], components: [] });

  // DM log
  try {
    if (DM_LOG_CHANNEL) {
      const logChannel = await message.guild.channels.fetch(DM_LOG_CHANNEL).catch(() => null);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('📌 DM Log')
          .setColor('#9b59b6')
          .addFields(
            { name: 'Sent By', value: `<@${message.author.id}>`, inline: true },
            { name: 'Targets', value: [
                ...resolvedRoles.map(r => `Role: <@&${r.id}> (${r.members.size} members)`),
                ...targets.slice(0, 10).map(u => `User: <@${u.id}>`)
              ].join('\n') + (targets.length > 10 ? `\n...and ${targets.length-10} more users` : ''), inline: true },
            { name: 'Message', value: text.length > 1024 ? text.slice(0,1020)+'...' : text, inline: false }
          )
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  } catch (err) { console.error('DM log failed', err); }

  if (!stopped) {
    delete progressData[key];
    await fs.writeFile(progressFile, JSON.stringify(progressData, null, 4));
  }
}