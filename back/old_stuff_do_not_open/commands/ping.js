const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageActionRow, MessageButton } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pondg!')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('The gif category')
        .setRequired(true)
        .addChoice('Funny', 'gif_funny')
        .addChoice('Meme', 'gif_meme')
        .addChoice('Movie', 'gif_movie')),
  async execute (interaction) {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('primary')
          .setLabel('Primary')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('secondary')
          .setLabel('Secondary')
          .setStyle('SECONDARY')
      )

    const string = interaction.options.getString('input')
    console.log(string)

    await interaction.reply({ content: 'Pong!', components: [row] })
    // return interaction.reply('Pong!')
  }
}
