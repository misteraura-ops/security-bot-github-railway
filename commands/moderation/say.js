const { PermissionsBitField, AttachmentBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    name: 'say',
    description: 'Bot says text + displays images inline (attachments or direct URLs)',
    async execute(message, args) {
        // Permission check
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ You do not have permission to make me speak.');
        }

        let text = args.join(' ');
        text = text.replace(/@everyone/g, '[everyone]').replace(/@here/g, '[here]');

        if (!text && message.attachments.size === 0) {
            return message.reply('❌ Provide text or attach an image/link.');
        }

        // Delete original message
        try { await message.delete(); } catch {}

        const files = [];

        // 1️⃣ Discord attachments
        for (const [, att] of message.attachments) {
            try {
                const res = await fetch(att.url);
                const buffer = await res.buffer();
                // Clean filename
                let cleanName = att.name.split('?')[0];
                files.push(new AttachmentBuilder(buffer, { name: cleanName }));
            } catch (err) {
                console.error('Attachment fetch failed:', err);
            }
        }

        // 2️⃣ Direct image URLs (png/jpg/jpeg/gif/webp)
        const urlRegex = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp))/gi;
        const urls = text.match(urlRegex);
        if (urls) {
            for (const url of urls) {
                try {
                    const res = await fetch(url);
                    const buffer = await res.buffer();
                    const fileName = url.split('/').pop().split('?')[0]; // clean filename
                    files.push(new AttachmentBuilder(buffer, { name: fileName }));
                } catch (err) {
                    console.error('URL fetch failed:', err);
                }
            }
            text = text.replace(urlRegex, '').trim();
        }

        // 3️⃣ Send final message
        try {
            await message.channel.send({
                content: text || undefined,
                files: files.length ? files : undefined
            });
        } catch (err) {
            console.error('Send failed:', err);
            await message.channel.send('❌ Something went wrong while trying to say your message.');
        }
    },
};