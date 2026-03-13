const fs = require("fs");

module.exports = (client) => {

client.on("ready", async () => {

client.guilds.cache.forEach(async guild => {

const data = {
roles: [],
members: {}
};

guild.roles.cache
.filter(r => !r.managed)
.sort((a,b)=>b.position-a.position)
.forEach(role => {

data.roles.push({
name: role.name,
color: role.color,
permissions: role.permissions.bitfield,
hoist: role.hoist,
mentionable: role.mentionable
});

});

const members = await guild.members.fetch();

members.forEach(member => {

data.members[member.id] = member.roles.cache
.filter(r => !r.managed)
.map(r => r.name);

});

fs.writeFileSync(`./backups/${guild.id}_roles.json`, JSON.stringify(data,null,2));

});

console.log("Role backups saved");

});

};