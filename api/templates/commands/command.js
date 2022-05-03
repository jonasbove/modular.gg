const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`${mycommand}`)
    .setDescription('Man kan kun slette beskeder i #bot-testing chatten.'),
  async execute (interaction) {
    const client = interaction.client

    if (interaction.channel.id !== '938046899745865778') return interaction.reply('Du kan kun slette beskeder i #bot-testing')

    const channel = client.channels.cache.get(interaction.channel.id)

    channel.bulkDelete(100)
      .then(messages => interaction.reply(`Deleted ${messages.size} messages!`))
      .catch(console.error)
  }
}
