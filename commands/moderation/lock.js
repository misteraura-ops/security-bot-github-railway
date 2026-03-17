const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "lock",

  async execute(message, args, client) {
    const OWNER_ID = process.env.OWNER_ID;

    // -------------------------
    // PERMISSION CHECK
    // -------------------------
    if (
      message.author.id !== OWNER_ID &&
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply("❌ You need **Administrator** to use this.");
    }

    const channel = message.channel;
    const guild = message.guild;

    // -------------------------
    // HELP COMMAND
    // -------------------------
    if (message.content.startsWith(".lockhelp")) {
      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🔒 Lock Command Help")
        .setDescription("Lock channels in different ways.")
        .addFields(
          {
            name: ".lock",
            value: "Locks the channel for @everyone"
          },
          {
            name: ".lock all / everyone",
            value: "Locks the channel globally"
          },
          {
            name: ".lock @user",
            value: "Locks the channel for a specific user"
          },
          {
            name: ".lock @role",
            value: "Locks the channel for a role"
          },
          {
            name: ".lock <id>",
            value: "Locks using user/role ID"
          }
        );

      return message.reply({ embeds: [embed] });
    }

    // -------------------------
    // DEFAULT PERMS TO REMOVE
    // -------------------------
    const lockPerms = {
      ViewChannel: false,
      SendMessages: false,
      ReadMessageHistory: false
    };

    // -------------------------
    // LOCK EVERYONE
    // -------------------------
    if (!args[0] || args[0].toLowerCase() === "everyone" || args[0].toLowerCase() === "all") {
      await channel.permissionOverwrites.edit(guild.roles.everyone, lockPerms);

      return message.reply("🔒 Channel locked for **everyone**.");
    }

    // -------------------------
    // GET TARGET (USER / ROLE / ID)
    // -------------------------
    let target =
      message.mentions.members.first() ||
      message.mentions.roles.first() ||
      guild.members.cache.get(args[0]) ||
      guild.roles.cache.get(args[0]);

    if (!target) {
      return message.reply("❌ Invalid user/role.");
    }

    // -------------------------
    // APPLY LOCK
    // -------------------------
    await channel.permissionOverwrites.edit(target.id, lockPerms);

    return message.reply(`🔒 Channel locked for **${target.user ? target.user.tag : target.name}**.`);
  }
};