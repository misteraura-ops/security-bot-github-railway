const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'iq',
    async execute(message) {

        const iq = Math.floor(Math.random()*200);

        let tier;
        if (iq < 80) tier = "NPC Tier";
        else if (iq < 120) tier = "Average Civilian";
        else if (iq < 160) tier = "Elite Mind";
        else tier = "Villain Arc Genius";

        const embed = new EmbedBuilder()
            .setColor('#8B0000')
            .setTitle('🧠 INTELLECT SCAN')
            .setDescription(`
\`\`\`
IQ SCORE :: ${iq}
CLASS    :: ${tier}
\`\`\`
            `)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};