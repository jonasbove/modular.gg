// const deployCommands = require('./deploy-commands')
import { SlashCommandBuilder } from '@discordjs/builders'

function node_OnSlashCommand(obj) {
  const data = new SlashCommandBuilder()
    .setName(obj.trigger)
    .setDescription(`${obj.trigger}`)

  client.commands.set(data.name, obj.trigger)

  client.on('interactionCreate', (interaction) => {
    if (!interaction.isCommand()) return

    const command = client.commands.get(interaction.commandName)

    if (!command) return

    const discord_data = { client: client, channel: interaction.channelId }

    obj.next(discord_data)
  })
}

function node_IfElse(obj) {
  if (obj.expression === true) obj.if()
  else obj.else()
}

function node_Number(obj) {
  return { outputNumber: obj.inputNumber }
}

function node_GreaterThan(obj) {
  return { result: (obj.a > obj.b) }
}

function node_SendMessage(obj) {
  client.channels.cache.get(obj.channel).send(obj.text);
}

export default {
  node_OnSlashCommand,
  node_IfElse,
  node_Number,
  node_GreaterThan,
  node_SendMessage
}
