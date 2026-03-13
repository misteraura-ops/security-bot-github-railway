const { EmbedBuilder } = require("discord.js");

module.exports = {
name: "antinuke",

async execute(message, args, client) {

if(!message.guild) return;

const allowed = [
process.env.OWNER_ID,
process.env.SERVER_OWNER
];

if(!allowed.includes(message.author.id)) return;

const embed = new EmbedBuilder()

.setTitle("🛡️ Anti-Nuke System")
.setColor("#2F3136")

.setDescription(`
This server has **Anti-Nuke Protection Enabled**.
Below are the active protection systems.
`)

.addFields(

{
name:"🗂 Role Backup System",
value:"• Automatically backs up **all roles** and **member role assignments**.\n• Backup runs every **10 hours**.\n• Stored in \`/backups/guildID_roles.json\`."
},

{
name:"♻️ Role Restore System",
value:"• Restores **all deleted roles** from backup.\n• Restores **all member roles**.\n• Triggered via restore buttons."
},

{
name:"🔐 Restore Authorization",
value:"Only the following users can restore roles:\n• **OWNER_ID**\n• **SERVER_OWNER**"
},

{
name:"📩 Restore Confirmation Buttons",
value:"When a role nuke happens the bot sends buttons:\n• **Restore Roles**\n• **Ignore Restore**"
},

{
name:"🧠 Interaction Protection",
value:"• Prevents interaction reply errors.\n• Prevents crashes if backup file is missing."
},

{
name:"📦 Backup Storage",
value:"Role backups are stored in:\n\`./backups/guildID_roles.json\`"
}

)

.setFooter({text:"Anti-Nuke Status Panel"})

.setTimestamp();

message.reply({embeds:[embed]});

}
};