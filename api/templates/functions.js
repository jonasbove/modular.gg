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

        if (obj.trigger != command) return

        const discord_data = { client: client, channel: interaction.channelId, interaction: interaction }

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

    node_SendMessage: async (obj) => {
      const message = await client.channels.cache.get(obj.channel).send(obj.text)
      return { messageid: 'testid' }
    },

    node_ReplyToCommand: async (obj) => {
      // todo
      await obj.interaction.reply(obj.text)
    },

    node_Sequence: async (obj) => {
      await obj.first()
      await obj.second()
    },

    node_RandomNumber: (obj) => {
      return { num: Math.floor(Math.random() * obj.max) + obj.min }
    },

    node_ReplyToMessage: (obj) => {
      console.log(obj)
      // TODO
    },

    node_ConvertNumToText: (obj) => {
      return { text: `${obj.num}` }
    },
    
    node_Loop: (obj) => {
      for (let index = 0; index < obj.x; index++) {
        obj.action()
      }
    }
  }
}

export default getFunctions