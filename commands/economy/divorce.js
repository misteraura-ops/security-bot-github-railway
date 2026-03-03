const { getUser, updateUser } = require('../../utils/economy');

module.exports = {
    name: 'divorce',
    async execute(message) {
        const data = getUser(message.author.id);
        if (!data.marriedTo) return message.reply('You’re single.');

        const partnerId = data.marriedTo;
        const partnerData = getUser(partnerId);

        data.marriedTo = null;
        partnerData.marriedTo = null;

        updateUser(message.author.id, data);
        updateUser(partnerId, partnerData);

        message.reply('💔 Divorce successful.');
    }
};