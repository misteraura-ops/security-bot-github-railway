const secrets = [
    "Still says 'doggo' unironically.",
    "Types 'hehe' after every sentence.",
    "Still watches cringe TikToks at 3AM.",
    "Says 'trust me bro' in arguments."
];

module.exports = {
    name: 'expose',
    async execute(message) {
        const secret = secrets[Math.floor(Math.random() * secrets.length)];
        message.reply(`🩸 EXPOSED: ${message.author} — ${secret}`);
    }
};