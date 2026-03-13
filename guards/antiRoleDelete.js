const actionMap = new Map();

module.exports = (client) => {

client.on("roleDelete", async (role) => {

const logs = await role.guild.fetchAuditLogs({type:32,limit:1});
const entry = logs.entries.first();

if(!entry) return;

const user = entry.executor;

if(process.env.WHITELIST?.includes(user.id)) return;

const now = Date.now();

if(!actionMap.has(user.id)) actionMap.set(user.id,[]);

const timestamps = actionMap.get(user.id);
timestamps.push(now);

const filtered = timestamps.filter(t => now - t < 5000);

actionMap.set(user.id,filtered);

if(filtered.length >= 2){

const member = await role.guild.members.fetch(user.id);
member.ban({reason:"Anti Nuke - Role Delete Spam"});

}

});

};