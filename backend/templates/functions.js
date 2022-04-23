// const deployCommands = require('./deploy-commands')
import { SlashCommandBuilder } from '@discordjs/builders'

function getFunctions(client) {
  return {
    node_OnSlashCommand: (obj) => {
      const data = new SlashCommandBuilder()
        .setName(obj.trigger)
        .setDescription(`${obj.trigger}`)
    
      client.commands.set(data.name, obj.trigger)
      client.commandsToDeploy.push(data)
    
      client.on('interactionCreate', (interaction) => {
        if (!interaction.isCommand()) return
    
        const command = client.commands.get(interaction.commandName)
    
        if (!command) return
    
        const discord_data = { client: client, channel: interaction.channelId }
    
        obj.next(discord_data)
      })
    },
    
    node_IfElse: (obj) => {
      if (obj.expression === true) obj.if()
      else obj.else()
    },
    
    node_Number: (obj) => {
      return { outputNumber: obj.inputNumber }
    },
    
    node_GreaterThan: (obj) => {
      return { result: (obj.a > obj.b) }
    },
    
    node_SendMessage: (obj) => {
      client.channels.cache.get(obj.channel).send(obj.text);
    }
  }
}

export default getFunctions