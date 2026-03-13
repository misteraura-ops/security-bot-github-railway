const fs = require("fs");
const path = require("path");

async function backupRoles(client){

for(const guild of client.guilds.cache.values()){

try{

const roles = guild.roles.cache
.filter(r => r.name !== "@everyone");

const members = await guild.members.fetch();

const data = {
roles: [],
members: {}
};

for(const role of roles.values()){

data.roles.push({
name: role.name,
color: role.color,
permissions: role.permissions.bitfield,
hoist: role.hoist,
mentionable: role.mentionable
});

}

for(const member of members.values()){

const roleNames = member.roles.cache
.filter(r => r.name !== "@everyone")
.map(r => r.name);

if(roleNames.length > 0){
data.members[member.id] = roleNames;
}

}

if(!fs.existsSync("./backups")){
fs.mkdirSync("./backups");
}

fs.writeFileSync(
`./backups/${guild.id}_roles.json`,
JSON.stringify(data,null,2)
);

console.log(`Role backup saved for ${guild.name}`);

}catch(err){

console.log(`Backup failed for ${guild.name}`,err);

}

}

}

function startBackupSystem(client){

backupRoles(client);

setInterval(() => {

backupRoles(client);

}, 1000 * 60 * 60 * 10); // 10 hours

}

module.exports = { startBackupSystem };