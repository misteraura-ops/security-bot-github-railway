module.exports = {
    name: 'ping',
    description: 'Shows bot latency',
    async execute(message, args, client) {
        const msg = await message.channel.send('🏓 Pinging...');
        const latency = msg.createdTimestamp - message.createdTimestamp;
        const api = Math.round(client.ws.ping);

        msg.edit(`🏓 Pong! Latency: ${latency}ms | API: ${api}ms`);
    }
};