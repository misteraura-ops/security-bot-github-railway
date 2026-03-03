const { EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        try {
            // 1️⃣ Check if 'welcome' channel exists
            let channel = member.guild.channels.cache.find(
                c => c.name === 'welcome' && c.type === ChannelType.GuildText
            );

            // 2️⃣ If not, create it
            if (!channel) {
                channel = await member.guild.channels.create({
                    name: 'welcome',
                    type: ChannelType.GuildText,
                    reason: 'Auto-created welcome channel',
                });
            }

            // 3️⃣ Generate random tuff welcome messages
            const welcomes = [
                `🔥 Brace yourself, ${member} has entered the chaos!`,
                `💀 Another victim joins the madness: ${member}`,
                `⚡ Watch out! ${member} just stepped into our den.`,
                `👑 Bow down, mortals! ${member} is now among us.`,
                `💥 ${member}, welcome to the playground of legends.`
            ];
            const randomMsg = welcomes[Math.floor(Math.random() * welcomes.length)];

            // 4️⃣ Fun panel design
            const embed = new EmbedBuilder()
                .setTitle('👋 Welcome to the server!')
                .setDescription(randomMsg)
                .setColor('#FF0000')
                .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Server Name', value: member.guild.name, inline: true },
                    { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
                    { name: 'Tough Level', value: '💥 Maximum', inline: true }
                )
                .setFooter({ text: 'Be ready to rumble!' })
                .setTimestamp();

            // 5️⃣ Send the embed
            channel.send({ content: `<@${member.id}>`, embeds: [embed] });
        } catch (err) {
            console.error('Error in guildMemberAdd event:', err);
        }
    },
};