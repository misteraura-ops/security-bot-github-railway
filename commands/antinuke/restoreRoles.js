const fs = require("fs");

module.exports = {
name:"restoreroles",

async execute(message){

if(message.author.id !== process.env.OWNER_ID)
return message.reply("Owner only.");

const data = JSON.parse(fs.readFileSync("./backups/roles.json"));

const guild = message.guild;

const createdRoles = {};

for(const role of data.roles){

const newRole = await guild.roles.create({
name:role.name,
color:role.color,
permissions:role.permissions
});

createdRoles[role.name] = newRole;

}

for(const memberID in data.members){

const member = await guild.members.fetch(memberID).catch(()=>null);

if(!member) continue;

const roles = data.members[memberID];

for(const roleName of roles){

const role = createdRoles[roleName];

if(role) member.roles.add(role).catch(()=>{});

}

}

message.reply("Roles restored successfully.");

}
};