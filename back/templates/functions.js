// const deployCommands = require('./deploy-commands')
const { Client, Collection, Intents /* DiscordAPIError */ } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { client } = require('../client')

function node_OnSlashCommand (obj) {
  const data = new SlashCommandBuilder()
    .setName(obj.trigger)
    .setDescription(`${obj.trigger}`)

  client.commands.set(data.name, obj.trigger)

  client.on('interactionCreate', (interaction) => {
    if (!interaction.isCommand()) return

    const command = client.commands.get(interaction.commandName)

    if (!command) return

    const discord_data = { client: client, interaction: interaction }

    obj.next(discord_data)
  })
}

function node_IfElse (obj) {
  if (obj.expression === true) obj.if()
  else obj.else()
}

function node_Number (obj) {
  return { outputNumber: obj.inputNumber }
}

function node_GreaterThan (obj) {
  return { result: (obj.a > obj.b) }
}

function node_SendMessage (obj) {
  obj.discord_data.interaction.reply(`${obj.message} - Lortet virker kraftedme`)
}

module.exports = {
  node_OnSlashCommand,
  node_IfElse,
  node_Number,
  node_GreaterThan,
  node_SendMessage
}
