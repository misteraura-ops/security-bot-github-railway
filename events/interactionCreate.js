const fs = require("fs");
const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder
} = require("discord.js");

const eco = require("./systems/economySystem");
const ui = require("./systems/uiBuilder");
const ticketManager = require("../utils/ticketManager");

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    if (!interaction.guild) return;

    const guild = interaction.guild;
    const claimRoleId = "1465699111931215903";

    const allowedUsers = [
      process.env.OWNER_ID,
      process.env.SERVER_OWNER
    ];

    // ===============================
    // SAFE HELPERS
    // ===============================

    async function safeReply(msg) {
      try {
        if (interaction.replied) return;
        if (interaction.deferred) return interaction.editReply(msg);
        return interaction.reply(msg);
      } catch {}
    }

    async function safeDefer() {
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.deferReply({ ephemeral: true });
        }
      } catch {}
    }

    async function safeEdit(msg) {
      try {
        if (interaction.deferred) return interaction.editReply(msg);
      } catch {}
    }

    // ===============================
    // ECONOMY BUTTONS
    // ===============================

    if (interaction.isButton()) {
      const id = interaction.customId;
      const userData = await eco.getUser(interaction.user.id);

      // 💼 WORK
      if (id === "eco_work") {
        const now = Date.now();
        const cooldown = 5 * 60 * 1000;

        if (now - userData.lastWork < cooldown) {
          return interaction.reply({
            content: "⏳ You are tired. Try again later.",
            ephemeral: true
          });
        }

        await interaction.update({
          content: "💼 Working...",
          embeds: [],
          components: []
        });

        setTimeout(async () => {
          const amount = Math.floor(Math.random() * 400) + 100;

          await eco.addMoney(interaction.user.id, amount);
          await eco.setCooldown(interaction.user.id, "lastWork");

          const updated = await eco.getUser(interaction.user.id);

          const embed = ui.mainPanel(interaction.user, updated)
            .setDescription(`💼 **Work Complete**

You earned **$${amount}** 💰

Keep grinding 👇`);

          await interaction.editReply({
            content: "",
            embeds: [embed],
            components: ui.mainButtons()
          });
        }, 1200);
      }

      // 🎁 DAILY
      if (id === "eco_daily") {
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000;

        if (now - userData.lastDaily < cooldown) {
          return interaction.reply({
            content: "⏳ Already claimed daily.",
            ephemeral: true
          });
        }

        const amount = 1000;

        await eco.addMoney(interaction.user.id, amount);
        await eco.setCooldown(interaction.user.id, "lastDaily");

        const updated = await eco.getUser(interaction.user.id);

        const embed = ui.mainPanel(interaction.user, updated)
          .setDescription(`🎁 **Daily Reward**

You claimed **$${amount}** 💰`);

        return interaction.update({
          embeds: [embed],
          components: ui.mainButtons()
        });
      }
    }

    // ===============================
    // ROLE BACKUP / RESTORE
    // ===============================

    function getBackup(guildID) {
      const file = `./backups/${guildID}_roles.json`;
      if (!fs.existsSync(file)) return null;

      try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
      } catch {
        return null;
      }
    }

    async function restoreRoles(guildID) {
      const backup = getBackup(guildID);
      if (!backup) return false;

      const targetGuild = client.guilds.cache.get(guildID);
      if (!targetGuild) return false;

      const createdRoles = {};

      for (const role of backup.roles) {
        try {
          const newRole = await targetGuild.roles.create({
            name: role.name,
            color: role.color,
            permissions: BigInt(role.permissions),
            hoist: role.hoist,
            mentionable: role.mentionable
          });

          createdRoles[role.name] = newRole;
        } catch {}
      }

      for (const memberID in backup.members) {
        const member = await targetGuild.members.fetch(memberID).catch(() => null);
        if (!member) continue;

        for (const roleName of backup.members[memberID]) {
          const role = createdRoles[roleName];
          if (role) await member.roles.add(role).catch(() => {});
        }
      }

      return true;
    }

    if (interaction.isButton()) {
      if (interaction.customId.startsWith("restore_roles_")) {
        if (!allowedUsers.includes(interaction.user.id))
          return safeReply({ content: "❌ Not allowed.", ephemeral: true });

        await safeDefer();

        const guildID = interaction.customId.split("_")[2];
        const success = await restoreRoles(guildID);

        if (!success)
          return safeEdit({ content: "❌ Backup not found." });

        return safeEdit({
          content: `✅ Roles restored in **${guild.name}**`
        });
      }

      if (interaction.customId.startsWith("ignore_restore_")) {
        if (!allowedUsers.includes(interaction.user.id))
          return safeReply({ content: "❌ Not allowed.", ephemeral: true });

        return safeReply({
          content: "Restore ignored.",
          ephemeral: true
        });
      }
    }

    // ===============================
    // MEMBER RESOLVER
    // ===============================

    async function resolveMember(guild, input) {
      if (!input) return null;

      const mentionMatch = input.match(/<@!?(\d+)>/);
      if (mentionMatch)
        return guild.members.fetch(mentionMatch[1]).catch(() => null);

      if (!isNaN(input))
        return guild.members.fetch(input).catch(() => null);

      const cached = guild.members.cache.find(m =>
        m.user.username.toLowerCase() === input.toLowerCase() ||
        (m.nickname && m.nickname.toLowerCase() === input.toLowerCase())
      );

      if (cached) return cached;

      return guild.members.fetch()
        .then(list =>
          list.find(m =>
            m.user.username.toLowerCase() === input.toLowerCase() ||
            (m.nickname && m.nickname.toLowerCase() === input.toLowerCase())
          )
        )
        .catch(() => null);
    }

    // ===============================
    // TICKET SELECT MENU
    // ===============================

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "ticketCategorySelect"
    ) {
      const category = interaction.values[0];

      const modal = new ModalBuilder()
        .setCustomId(`mmForm-${category}`)
        .setTitle(`🎫 ${category} Trade Form`);

      const inputs = [
        ["trader", "Trader Name / Username", TextInputStyle.Short, true],
        ["trade", "Trade Details", TextInputStyle.Paragraph, true],
        ["extra", "Extra Info", TextInputStyle.Paragraph, false],
        ["contact", "Contact Method", TextInputStyle.Short, true]
      ];

      modal.addComponents(
        ...inputs.map(([id, label, style, required]) =>
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId(id)
              .setLabel(label)
              .setStyle(style)
              .setRequired(required)
          )
        )
      );

      return interaction.showModal(modal);
    }

    // ===============================
    // MODAL SUBMIT (TICKET CREATE)
    // ===============================

    if (
      interaction.isModalSubmit() &&
      interaction.customId.startsWith("mmForm-")
    ) {
      await safeDefer();

      const category = interaction.customId.split("-")[1];

      const traderInput = interaction.fields.getTextInputValue("trader");
      const tradeDetails = interaction.fields.getTextInputValue("trade");
      const extraInfo = interaction.fields.getTextInputValue("extra") || "None";
      const contactMethod = interaction.fields.getTextInputValue("contact");

      const ticketName = `ticket-${interaction.user.username}`.toLowerCase();

      const otherUser = await resolveMember(guild, traderInput);

      const ticketChannel = await ticketManager.createTicket(
        client,
        guild,
        ticketName,
        interaction.user.id,
        otherUser ? otherUser.id : null
      );

      const embed = new EmbedBuilder()
        .setTitle(`🎫 ${category} Ticket`)
        .setDescription(
          `Welcome <@${interaction.user.id}>!\nStaff: <@&${claimRoleId}>`
        )
        .addFields({
          name: "📌 Trade Info",
          value: `Trader: ${traderInput}
Details: ${tradeDetails}
Extra: ${extraInfo}
Contact: ${contactMethod}`
        })
        .setColor("#1F2937")
        .setTimestamp();

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("ticket-claim").setLabel("Claim").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("ticket-unclaim").setLabel("Unclaim").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("ticket-close").setLabel("Close").setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({
        content: `<@&${claimRoleId}> <@${interaction.user.id}>`,
        embeds: [embed],
        components: [buttons]
      });

      return safeEdit({
        content: `✅ Ticket created: <#${ticketChannel.id}>`
      });
    }

    // ===============================
    // TICKET BUTTONS
    // ===============================

    if (
      interaction.isButton() &&
      interaction.channel &&
      interaction.channel.name.startsWith("ticket-")
    ) {
      if (!interaction.member.roles.cache.has(claimRoleId))
        return safeReply({
          content: "❌ Not authorized.",
          ephemeral: true
        });

      switch (interaction.customId) {
        case "ticket-claim":
          return safeReply({
            embeds: [
              new EmbedBuilder()
                .setColor("Green")
                .setTitle("Ticket Claimed")
                .setDescription(`<@${interaction.user.id}> claimed this ticket`)
            ]
          });

        case "ticket-unclaim":
          return safeReply({
            embeds: [
              new EmbedBuilder()
                .setColor("Yellow")
                .setTitle("Ticket Unclaimed")
            ]
          });

        case "ticket-close":
          return ticketManager.closeTicket(interaction.channel, guild);
      }
    }
  }
};