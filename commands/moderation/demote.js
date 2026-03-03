const { EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;

// ENV
const OWNER_ID = process.env.OWNER_ID;
const WHITELIST = process.env.WHITELIST?.split(',') || [];
const PROMOTE_PERM = process.env.PROMOTE_PERM;
const COOLDOWN_MS = 20 * 60 * 1000;

// Roles from ENV
const roleList = [];
for (let i = 1; i <= 12; i++) {
    if (process.env[`ROLE${i}`]) roleList.push(process.env[`ROLE${i}`]);
}

// Key permissions to track
const KEY_PERMISSIONS = ['Administrator', 'ManageGuild', 'ManageRoles', 'KickMembers', 'BanMembers'];

// Cooldown tracker
const cooldowns = new Map();

module.exports = {
    name: 'demote',
    description: 'Demote a user by removing roles from highest to lowest.',
    async execute(message, args, client) {
        const executorId = message.author.id;

        // ----------------------
        // Permission check
        // ----------------------
        if (executorId !== OWNER_ID && !message.member.roles.cache.some(r => r.name === PROMOTE_PERM) && !WHITELIST.includes(executorId)) {
            return message.channel.send({ embeds: [new EmbedBuilder().setColor('#e74c3c').setDescription('❌ You do not have permission.')] });
        }

        // ----------------------
        // Cooldown check
        // ----------------------
        if (executorId !== OWNER_ID && !WHITELIST.includes(executorId)) {
            const lastUse = cooldowns.get(executorId) || 0;
            const now = Date.now();
            if (now - lastUse < COOLDOWN_MS) {
                const remaining = Math.ceil((COOLDOWN_MS - (now - lastUse)) / 60000);
                return message.channel.send({ embeds: [new EmbedBuilder().setColor('#e67e22').setDescription(`⏱ You are on cooldown. Wait **${remaining} minute(s)**.`)] });
            }
        }

        if (!args[0]) return message.channel.send({ embeds: [new EmbedBuilder().setColor('#e74c3c').setDescription('❌ Usage: .demote @user <role/roleid>')] });

        // Resolve target
        let target = message.mentions.members.first();
        if (!target) target = await message.guild.members.fetch(args[0]).catch(() => null);
        if (!target) return message.channel.send({ embeds: [new EmbedBuilder().setColor('#e74c3c').setDescription('❌ Could not find that user.')] });

        // Resolve role index
        let roleId = args[1];
        if (!roleList.includes(roleId)) {
            const roleObj = message.guild.roles.cache.get(roleId) || message.guild.roles.cache.find(r => r.name.toLowerCase() === args[1].toLowerCase());
            if (!roleObj) return message.channel.send({ embeds: [new EmbedBuilder().setColor('#e74c3c').setDescription('❌ Could not find that role.')] });
            roleId = roleObj.id;
        }
        const roleIndex = roleList.indexOf(roleId);
        if (roleIndex === -1) return message.channel.send({ embeds: [new EmbedBuilder().setColor('#e74c3c').setDescription('❌ Role not in configured role list.')] });

        // ----------------------
        // Progress embed
        // ----------------------
        const progressEmbed = new EmbedBuilder()
            .setTitle('Demotion Progress')
            .setColor('#e67e22')
            .setDescription(`Starting demotion of **${target.user.tag}**...`)
            .setTimestamp();
        const panel = await message.channel.send({ embeds: [progressEmbed] });

        // ----------------------
        // Demotion logic (remove roles from high → low)
        // ----------------------
        const rolesToRemove = roleList.slice(0, roleIndex + 1).reverse().map(id => message.guild.roles.cache.get(id)).filter(Boolean);
        const prevPerms = target.permissions.toArray();
        const removedRoles = [];

        for (let i = 0; i < rolesToRemove.length; i++) {
            const role = rolesToRemove[i];
            try {
                await target.roles.remove(role);
                removedRoles.push(role.name);

                // Update embed every 2 roles
                if (i % 2 === 0 || i === rolesToRemove.length - 1) {
                    const embed = new EmbedBuilder()
                        .setTitle('Demotion Progress')
                        .setColor('#e67e22')
                        .setDescription(`Demoting **${target.user.tag}**\nProgress: [${'■'.repeat(i + 1)}${'□'.repeat(rolesToRemove.length - i - 1)}]`)
                        .addFields({ name: 'Roles Removed', value: removedRoles.join(', ') || 'None' })
                        .setTimestamp();
                    await panel.edit({ embeds: [embed] }).catch(() => {});
                }
            } catch (err) {
                console.error(`Failed to remove ${role.name} from ${target.user.tag}`, err);
            }
        }

        // ----------------------
        // DM demoted user
        // ----------------------
        const userEmbed = new EmbedBuilder()
            .setTitle('⚠ You have been demoted')
            .setColor('#e67e22')
            .setDescription(`The following roles have been removed from you:\n**${removedRoles.join(', ')}**`)
            .setFooter({ text: `Demoted by ${message.member.user.tag}` })
            .setTimestamp();
        target.send({ embeds: [userEmbed] }).catch(() => {});

        // ----------------------
        // DM OWNER_ID
        // ----------------------
        if (OWNER_ID) {
            const owner = await client.users.fetch(OWNER_ID).catch(() => null);
            if (owner) {
                const newPerms = target.permissions.toArray();
                const lost = prevPerms.filter(p => !newPerms.includes(p) && KEY_PERMISSIONS.includes(p));

                const deltaEmbed = new EmbedBuilder()
                    .setTitle(`Demotion Info: ${target.user.tag}`)
                    .setColor('#e67e22')
                    .addFields(
                        { name: 'Roles Removed', value: removedRoles.join(', '), inline: false },
                        { name: 'Lost Key Permissions', value: lost.length ? lost.join(', ') : 'None', inline: false }
                    )
                    .setTimestamp();
                owner.send({ embeds: [deltaEmbed] }).catch(() => {});
            }
        }

        // ----------------------
        // Finalize
        // ----------------------
        const finalEmbed = new EmbedBuilder()
            .setTitle('Demotion Complete')
            .setColor('#e67e22')
            .setDescription(`✅ ${target.user.tag} has been demoted successfully!`)
            .addFields({ name: 'Roles Removed', value: removedRoles.join(', ') });
        await panel.edit({ embeds: [finalEmbed], components: [] }).catch(() => {});

        // Apply cooldown
        if (executorId !== OWNER_ID && !WHITELIST.includes(executorId)) cooldowns.set(executorId, Date.now());
    }
};