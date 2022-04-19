const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearchat')
    .setDescription('Man kan kun slette beskeder i #bot-testing chatten.'),
  async execute (interaction) {
    const client = interaction.client

    const guild = client.guilds.cache.get(process.env.GUILD_ID)
    const member = guild.members.cache.get(interaction.user.id)

    if (interaction.channel.id !== '938046899745865778') return interaction.reply('Du kan kun slette beskeder i #bot-testing')

    const channel = client.channels.cache.get(interaction.channel.id)

    channel.bulkDelete(100)
      .then(messages => interaction.reply(`Deleted ${messages.size} messages! You were a member since ${member.joinedAt}`))
      .catch(console.error)
  }
}
