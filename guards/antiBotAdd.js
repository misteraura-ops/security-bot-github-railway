module.exports = (client) => {

client.on("guildMemberAdd", async (member) => {

if(!member.user.bot) return;

const logs = await member.guild.fetchAuditLogs({type:28,limit:1});
const entry = logs.entries.first();

if(!entry) return;

const user = entry.executor;

if(process.env.WHITELIST?.includes(user.id)) return;

const mod = await member.guild.members.fetch(user.id);

mod.ban({reason:"Anti Nuke - Unauthorized Bot Add"});

member.ban({reason:"Unauthorized Bot"});

});

};