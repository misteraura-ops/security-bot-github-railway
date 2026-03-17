const eco = require("../../systems/economySystem");
const ui = require("../../systems/uiBuilder");

module.exports = {
  name: "work",
  async execute(message, args) {
    const userData = eco.getUser(message.author.id);
    if (!eco.canWork(message.author.id)) {
      return message.reply("⏳ You are tired. Try again later.");
    }

    eco.addMoney(message.author.id, Math.floor(Math.random()*400)+100);
    eco.setCooldown(message.author.id, "lastWork");

    const updated = eco.getUser(message.author.id);
    const embed = ui.mainPanel(message.author, updated)
      .setDescription(`💼 You worked and earned money!`);

    message.reply({ embeds: [embed] });
  }
};