const safeReply = require("../utils/safeReply");
const ticketHandler = require("./ticketHandler");

module.exports = async (interaction) => {
  try {

    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "mmpanel") {
        return require("../commands/mmpanel")(interaction);
      }
    }

    if (interaction.isButton()) {
      return ticketHandler.handleButton(interaction);
    }

    if (interaction.isModalSubmit()) {
      return ticketHandler.handleModal(interaction);
    }

    if (interaction.isUserSelectMenu()) {
      return ticketHandler.handleUserSelect(interaction);
    }

  } catch (err) {
    console.error("Router Error:", err);
    await safeReply(interaction, {
      content: "Something went wrong.",
      flags: 64
    });
  }
};