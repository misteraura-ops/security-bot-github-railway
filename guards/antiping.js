const spamMap = new Map();

module.exports = (client) => {
  client.on("messageCreate", async (message) => {

    if (!message.guild) return;

    if (!message.author.bot && !message.webhookId) return;

    if (!message.content.includes("@everyone") && !message.content.includes("@here")) return;

    const key = message.author?.id || message.webhookId;
    const now = Date.now();

    if (!spamMap.has(key)) spamMap.set(key, []);

    const timestamps = spamMap.get(key);
    timestamps.push(now);

    const filtered = timestamps.filter(t => now - t < 5000);
    spamMap.set(key, filtered);

    if (filtered.length >= 4) {

      if (message.webhookId) {
        try {
          const webhook = await message.fetchWebhook();
          await webhook.delete("Webhook spam protection");
        } catch {}
      }

      if (message.author?.bot) {
        const member = message.guild.members.cache.get(message.author.id);
        if (member) {
          member.ban({ reason: "Ping spam protection" }).catch(() => {});
        }
      }

    }

  });
};