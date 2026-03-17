const { MessageAttachment, MessageEmbed } = require('discord.js');
const Canvas = require('@napi-rs/canvas');

module.exports = {
    name: 'whois',
    aliases: ['w'],
    description: 'Get detailed info about a user in a 4K panel',
    usage: '[user]',
    async execute(message, args) {
        try {
            const member = message.mentions.members.first() || message.member;

            // 4K Canvas
            const canvas = Canvas.createCanvas(3840, 2160);
            const ctx = canvas.getContext('2d');

            // Background
            const background = await Canvas.loadImage('https://i.ibb.co/4JgRjxJ/abstract-bg.jpg'); // 4K background
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Username Text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 150px Sans';
            ctx.textAlign = 'center';
            ctx.fillText(member.user.tag, canvas.width / 2, 300);

            // Avatar Circle
            const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png', size: 4096 }));
            const size = 800;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, 800, size / 2, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, canvas.width / 2 - size / 2, 800 - size / 2, size, size);

            // Create attachment
            const attachment = new MessageAttachment(await canvas.encode('png'), 'whois.png');

            // Embed
            const embed = new MessageEmbed()
                .setTitle(`User Info: ${member.user.username}`)
                .setColor('RANDOM')
                .setDescription(
                    `**ID:** ${member.id}\n` +
                    `**Username:** ${member.user.tag}\n` +
                    `**Status:** ${member.presence?.status || 'offline'}\n` +
                    `**Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>\n` +
                    `**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n` +
                    `**Roles:** ${member.roles.cache.map(r => r.name).join(', ')}`
                )
                .setImage('attachment://whois.png')
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

            message.channel.send({ embeds: [embed], files: [attachment] });

        } catch (err) {
            console.error(err);
            message.channel.send('⚠️ Could not fetch user info.');
        }
    },
};