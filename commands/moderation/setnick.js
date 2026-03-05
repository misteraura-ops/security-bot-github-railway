module.exports = {
  name: 'setnick',
  description: 'Change the bot nickname',

  async execute(message, args, client) {

    const OWNER_ID = '1112091588462649364';

    // Only allowed user
    if (message.author.id !== OWNER_ID) return;

    const newNick = args.join(' ');
    if (!newNick) return message.reply('Provide a nickname.');

    try {
      await message.guild.members.me.setNickname(newNick);

      message.channel.send(`✅ Bot nickname changed to: **${newNick}**`);
    } catch (err) {
      message.reply('❌ Failed to change nickname. Make sure the bot has permission.');
    }

  }
};