module.exports = {
  name: 'interactionCreate',
  execute: async (interaction, client) => {
    if (!interaction.isCommand()) return

    const command = client.commands.get(interaction.commandName)

    if (!command) return

    try {
      await (command.execute(interaction))
    } catch (error) {
      console.log(error)
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  }
}
