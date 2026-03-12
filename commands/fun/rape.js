const { EmbedBuilder } = require('discord.js');

module.exports = {
    // ----------------------
    // CHANGE THIS TO RENAME THE COMMAND
    // ----------------------
    name: 'rape', // <-- You can change this to anything like 'screenshot' or 'image'
    description: 'Display a screenshot or image in an embed.',

    async execute(message, args) {

        // ----------------------
        // Get the mentioned user
        // ----------------------
        const target = message.mentions.users.first();
        if (!target) return message.channel.send('❌ Mention the bud u wanna rape!');

        // ----------------------
        // DISPLAY TEXT (editable)
        // ----------------------
        const displayText = ` **${message.author} raped ${target}** for the **1st time**. It was hard icl`;
        // <-- Edit this line to change the text format

        // ----------------------
        // IMAGE LINK (editable)
        // ----------------------
        const imageLink = 'https://media.discordapp.net/attachments/1480184670606983240/1481755017307357395/fuck10.gif?ex=69b47765&is=69b325e5&hm=a7383b9f7eeeba43c8d74ffa1782a6a3994b6cab34bb584ba62f5851b8ccc7bf&=';
        // <-- Edit this line to change the image URL

        // ----------------------
        // Create the embed
        // ----------------------
        const embed = new EmbedBuilder()
            .setTitle(`${message.author}`)
            .setDescription(displayText)
            .setColor('#3498db')
            .setTimestamp()
            .setImage(imageLink); // Big image at the bottom

        // ----------------------
        // Send the embed
        // ----------------------
        message.channel.send({ embeds: [embed] });
    }
};