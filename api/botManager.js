import dotenv from 'dotenv'
import fs from 'fs'
import { Client, Collection, Intents /* DiscordAPIError */ } from 'discord.js'
dotenv.config({ path: '../.env' })
import deployCommands from './templates/deployCommands.js'
import { SlashCommandBuilder } from '@discordjs/builders'

const eventMap = {
  "OnSlashCommand": "interactionCreate",
}

class Bot {
  constructor(token) {
    console.log('making new bot')
    this.token = token
    this.running = false
    this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], })

    this.areCommandsLoaded = false
    this.loadCommands().then(() => {
      console.log('commands are: ')
      console.log(this.commands)
    })
  }

  async loadCommands() {
    this.loadCommands.num = this.loadCommands.num ?? 0
    this.commands = await Promise.all(
      fs
        .readdirSync(`./clients/${this.token}`)
        .map(async (file) => {
          let num = ++this.loadCommands.num

          //console.log(`Starting import of: ./clients/${this.token}/${file}`)

          const imported = await import(`./clients/${this.token}/${file}?foo=${num}`)
          //console.log('imported:')
          //console.log(imported)

          let generatedCommandData = imported.funcGenerator(this.client)

          let result = {
            name: imported.name,
            event: imported.event,
            isActive: true,
            hasChanged: true,
            func: generatedCommandData.func,
            data: generatedCommandData.data
          }

          return result
        })
    )
    this.areCommandsLoaded = true

    /*this.commands = await Promise.all(
      fs
        .readdirSync(`./clients/${this.token}`)
        .map((file) => import(`./clients/${this.token}/${file}`))
    )
    this.areCommandsLoaded = true*/
    //let exCmd = { name: "Command to do stuff", func: () => {/*do stuf */ } }
  }

  runCommands() {
    this.commands.forEach((command) => {

      if (command.hasChanged && command.isActive) {
        console.log(`Registering command: ${command.name}, to: ${command.event}`)
        console.log(command)
        //command.hasChanged = false //only include this line when we accurately update elsewhere
        this.client.on(eventMap[command.event], command.func)
      }
    })

  }

  async addCommand(name) { }

  async deployCommands() {
    console.log("Deploying commands:")
    await deployCommands( //! May be bad :)
      this.commands.map((command) => {
        if (command.event === "OnSlashCommand" && command.isActive)
          return command = new SlashCommandBuilder().setName(command.data.trigger).setDescription(`${command.data.trigger}`)
      }), this.token)

    return true
  }

  async start() {
    let res = await this.client
      .login(this.token)
      .then(() => console.log(`Bot started: ${this.token}`))

    this.commands.forEach(command => {
      if (command.hasChanged || !command.isActive) {
        console.log(`Un-registering command: ${command.name}, to: ${command.event}`)
        this.client.removeListener(eventMap[command.event], command.func)
      }

    });

    await this.loadCommands()
    this.runCommands()
    //console.log('after:')
    //console.log(this.bots[token].commands)

    await this.deployCommands()

    return res
  }

  stop() {
    this.client.destroy()
    console.log(`Bot stopped: ${this.token}`)
  }

  async restart() {
    this.stop()
    return await this.start()
  }
}

export class botManager {
  constructor() {
    this.bots = []
  }

  async addBot(token) {
    if (this.bots[token]) return this.bots[token]



    this.bots[token] = new Bot(token)
    await this.bots[token].loadCommands()
    //this.bots[token].runCommands()
    return this.bots[token]
  }

  removeBot(token) {
    delete this.bots[token]
  }

  async startBot(token) {
    //console.log('before:')
    //console.log(this.bots[token].commands)





    return this.bots[token]?.start()
  }

  async stopBot(token) {
    return this.bots[token]?.stop()
  }

  async restartBot(token) {
    return this.bots[token]?.restart()
  }
}
