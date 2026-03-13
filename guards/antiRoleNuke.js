const fs = require("fs");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const deleteMap = new Map();

module.exports = (client) => {

client.on("roleDelete", async (role) => {

const logs = await role.guild.fetchAuditLogs({type:32,limit:1});
const entry = logs.entries.first();

if(!entry) return;

const user = entry.executor;

if(
user.id === process.env.OWNER_ID ||
user.id === process.env.SERVER_OWNER
) return;

const now = Date.now();

if(!deleteMap.has(user.id)) deleteMap.set(user.id,[]);

const timestamps = deleteMap.get(user.id);
timestamps.push(now);

const filtered = timestamps.filter(t => now - t < 10000);
deleteMap.set(user.id, filtered);

if(filtered.length >= 3){

const member = await role.guild.members.fetch(user.id).catch(()=>null);
if(member) member.ban({reason:"Role Nuke Attempt"});

sendRestorePrompt(client, role.guild);

}

});

};