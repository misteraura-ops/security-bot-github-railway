const tickets = {};

module.exports = {
    addTicket(channelId, data) {
        tickets[channelId] = data;
    },
    getTicket(channelId) {
        return tickets[channelId];
    },
    removeTicket(channelId) {
        delete tickets[channelId];
    },
    getAllTickets() {
        return tickets;
    },
};