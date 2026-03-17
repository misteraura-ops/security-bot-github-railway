const { PermissionsBitField } = require('discord.js');

const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'lock',
  description: 'Lock a channel for specific roles/users or everyone. `.lockhelp` for usage.',
  aliases: ['unlock'],
  usage: '.lock [@user|@role|perm|all|everyone] [duration]',
  async execute(message, args, client) {
    // Permission check
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== OWNER_ID) {
      return message.reply('❌ You do not have permission to use this command.');
    }

    const channel = message.channel;

    // Show help if requested
    if (args[0] === 'help' || args[0] === 'lockhelp') {
      return message.reply({
        content: `**🔒 Lock Command Help**
• \`.lock @user <duration>\` → Locks for a user
• \`.lock @role <duration>\` → Locks for a role
• \`.lock all\` or \`.lock everyone\` → Locks everyone
• \`.lock <duration>\` → Locks channel for all non-admins
• \`.unlock [@user|@role|all]\` → Unlocks channel
• Duration format: 10s, 5m, 1h, etc.`
      });
    }

    // Detect if unlocking
    const isUnlock = message.content.toLowerCase().startsWith('.unlock');

    // Handle targets
    let targetMembers = [];
    let targetRoles = [];
    let lockEveryone = false;
    let duration = null;

    if (args.length > 0) {
      // parse duration if last arg is like 10m, 5h, etc.
      const lastArg = args[args.length - 1];
      const durationMatch = lastArg.match(/^(\d+)(s|m|h)$/);
      if (durationMatch) {
        duration = parseInt(durationMatch[1]);
        const unit = durationMatch[2];
        if (unit === 's') duration *= 1000;
        if (unit === 'm') duration *= 60 * 1000;
        if (unit === 'h') duration *= 60 * 60 * 1000;
        args.pop();
      }

      const target = args[0].toLowerCase();

      if (target === 'all' || target === 'everyone') {
        lockEveryone = true;
      } else if (message.mentions.members.size > 0) {
        targetMembers = Array.from(message.mentions.members.values());
      } else if (message.mentions.roles.size > 0) {
        targetRoles = Array.from(message.mentions.roles.values());
      } else {
        // No mentions → default: everyone
        lockEveryone = true;
      }
    } else {
      lockEveryone = true;
    }

    // Permissions to allow (checkmark) 
    const allowPerms = [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory];

    // Helper: build overwrite object
    const buildOverwrite = (memberOrRole) => {
      // Start with all denied
      const denied = new PermissionsBitField(Object.values(PermissionsBitField.Flags));
      // Allow only the two
      const allowed = new PermissionsBitField(allowPerms);
      // Apply deny - allow
      return { deny: denied.remove(allowPerms), allow: allowed };
    };

    try {
      // LOCK / UNLOCK
      if (isUnlock) {
        const targets = lockEveryone ? [channel.guild.roles.everyone] : [...targetRoles, ...targetMembers];
        for (const t of targets) {
          await channel.permissionOverwrites.edit(t, {
            ViewChannel: true,
            ReadMessageHistory: true,
            SendMessages: true
          });
        }
        return message.reply('✅ Channel unlocked for selected target(s).');
      } else {
        const targets = lockEveryone ? [channel.guild.roles.everyone] : [...targetRoles, ...targetMembers];
        for (const t of targets) {
          await channel.permissionOverwrites.edit(t, buildOverwrite(t));
        }

        message.reply(`🔒 Channel locked for ${lockEveryone ? 'everyone' : targets.map(x => x.name || x.user.username).join(', ')}`);

        // TEMP LOCK
        if (duration) {
          setTimeout(async () => {
            for (const t of targets) {
              await channel.permissionOverwrites.edit(t, {
                ViewChannel: true,
                ReadMessageHistory: true,
                SendMessages: true
              });
            }
            channel.send(`✅ Temporary lock expired, channel unlocked for ${lockEveryone ? 'everyone' : targets.map(x => x.name || x.user.username).join(', ')}`);
          }, duration);
        }
      }
    } catch (err) {
      console.error(err);
      message.reply('❌ Something went wrong while updating channel permissions.');
    }
  }
};