module.exports = {
    name: 'aura',
    async execute(message) {
        const aura = Math.floor(Math.random() * 100);
        message.reply(`🔥 Your aura level is ${aura}/100`);
    }
};