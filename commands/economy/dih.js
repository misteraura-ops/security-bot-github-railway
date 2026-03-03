const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dih',
    description: 'Check your size or another user’s size 😈',
    async execute(message, args, client) {

        // Determine target: default = author
        let target = message.mentions.users.first() || message.author;
        const isOwner = target.id === process.env.OWNER_ID;

        // Base dih size
        if (!client.dihSize) client.dihSize = 5;
        let base = client.dihSize;

        // Hidden randomness
        let finalSize;

        // Check if user has a hidden range set
        if (client.userDihRanges && client.userDihRanges.has(target.id)) {
            const [min, max] = client.userDihRanges.get(target.id);
            finalSize = Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
            const random = Math.floor(Math.random() * 7) - 3; // -3 to +3
            finalSize = Math.max(1, base + random);
        }

        // Owner boost if OWNER_ID checks themselves
        if (target.id === process.env.OWNER_ID) {
            finalSize += Math.floor(Math.random() * 4) + 3; // +3 to +6
        }

        // Comment pools
        const tiny = [
            "Travel size edition.",
            "Microscopic but brave.",
            "Compact build.",
            "Under development.",
            "Minimalist lifestyle."
        ];
        const average = [
            "Factory settings.",
            "Balanced build.",
            "Standard edition.",
            "Respectable effort.",
            "Base model unlocked."
        ];
        const above = [
            "Confidence unlocked.",
            "Performance mode enabled.",
            "Borderline dangerous.",
            "Now we’re talking.",
            "Upgraded firmware detected."
        ];
        const insane = [
            "Structural engineers concerned.",
            "Insurance premiums increased.",
            "Certified hazard.",
            "Gravity adjusting.",
            "Authorities mildly nervous."
        ];

        // Combine for easier random selection
        let commentPool = [];
        if (finalSize <= 3) commentPool = tiny;
        else if (finalSize <= 6) commentPool = average;
        else if (finalSize <= 10) commentPool = above;
        else commentPool = insane;

        // Dark humour comments
        const darkHumour = [
            "Your doctor called, he’s worried.",
            "Could be worse. Could be smaller.",
            "Do not operate heavy machinery.",
            "Warning: Liability increases with size.",
            "Your ego is larger than this."
        ];
        commentPool = commentPool.concat(darkHumour);

        // Owner positive comments
        const ownerComments = [
            "Founder genetics. Unreal.",
            "Built different. Literally.",
            "Main character aura detected.",
            "God mode activated."
        ];

        // Pick comment
        let comment;
        if (isOwner) {
            if (Math.random() < 0.5) comment = ownerComments[Math.floor(Math.random() * ownerComments.length)];
            else comment = commentPool[Math.floor(Math.random() * commentPool.length)];
        } else {
            comment = commentPool[Math.floor(Math.random() * commentPool.length)];
        }

        // 1% legendary
        if (Math.random() < 0.01) comment = "⚡ Legendary mutation unlocked.";

        // Embed panel
        const embed = new EmbedBuilder()
            .setColor('#B22222') // Fire red
            .setTitle('📏 Dih Check')
            .setDescription(`${target} your dih size is **${finalSize}**\n\n${comment}`)
            .setFooter({ text: 'All measurements are automatic.' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};