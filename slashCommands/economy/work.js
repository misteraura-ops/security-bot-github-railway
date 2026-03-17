const { SlashCommandBuilder } = require("discord.js");
const eco = require("../../systems/economySystem");
const ui = require("../../systems/uiBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work to earn money"),

  async execute(interaction) {
    const user = interaction.user;
    const userData = eco.getUser(user.id);

    if (!eco.canWork(user.id)) {
      return interaction.reply({ content: "⏳ You are tired. Try again later.", ephemeral: true });
    }

    eco.addMoney(user.id, Math.floor(Math.random()*400)+100);
    eco.setCooldown(user.id, "lastWork");

    const updated = eco.getUser(user.id);
    const embed = ui.mainPanel(user, updated).setDescription(`💼 You worked and earned money!`);

    return interaction.reply({ embeds: [embed], components: ui.mainButtons() });
  }
};