module.exports = (client) => {

  client.on("guildMemberAdd", async (member) => {

    if (!member.user.bot) return;

    const owner = await member.guild.fetchOwner();

    owner.send(
`⚠️ A bot was added to **${member.guild.name}**

Bot: ${member.user.tag}
ID: ${member.id}

If this was not intended, remove the bot immediately.`
    ).catch(() => {});

  });

};