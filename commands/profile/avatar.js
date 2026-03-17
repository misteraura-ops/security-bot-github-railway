const { MessageAttachment, MessageEmbed } = require('discord.js');
const Canvas = require('@napi-rs/canvas');

module.exports = {
    name: 'avatar',
    aliases: ['av', 'pfp'],
    description: 'Display a user\'s avatar in a creative 4K panel',
    usage: '[user]',
    async execute(message, args) {
        try {
            const user = message.mentions.users.first() || message.author;

            // 4K Canvas
            const canvas = Canvas.createCanvas(3840, 2160);
            const ctx = canvas.getContext('2d');

            // Background
            const background = await Canvas.loadImage('https://i.ibb.co/4JgRjxJ/abstract-bg.jpg'); // 4K background
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Avatar circle
            const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png', size: 4096 }));
            const size = 800;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, size / 2, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, canvas.width / 2 - size / 2, canvas.height / 2 - size / 2, size, size);

            // Create attachment
            const attachment = new MessageAttachment(await canvas.encode('png'), 'avatar.png');

            // Embed
            const embed = new MessageEmbed()
                .setTitle(`Avatar of ${user.tag}`)
                .setColor('RANDOM')
                .setImage('attachment://avatar.png')
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

            message.channel.send({ embeds: [embed], files: [attachment] });

        } catch (err) {
            console.error(err);
            message.channel.send('⚠️ Could not generate avatar.');
        }
    },
};