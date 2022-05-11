import dotenv from 'dotenv'
import fs from 'fs'
import Discord, { Client, Collection, Intents /* DiscordAPIError */ } from 'discord.js'
dotenv.config({ path: '../.env' })
import deployCommands from './templates/deployCommands.js'
import { SlashCommandBuilder } from '@discordjs/builders'

const eventMap = {
  "OnSlashCommand": "interactionCreate",
}

class Bot {
  constructor(token) {
    console.log('\x1b[43mmaking new bot\x1b[0m')
    this.token = token
    this.running = false
    this.destroyed = false

    this.client = new Discord.Client({
      intents: new Discord.Intents(32767)
    })
    //this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], })
    
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

          const imported = await import(`./clients/${this.token}/${file}?foo=${num}`)

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
  }
  
  runCommands() {
    this.commands.forEach((command) => {
      console.log(`Registering command: ${command.name}, to: ${command.event}`)
      console.log(command)
        
      this.client.on(eventMap[command.event], command.func)
    })
  }

  async addCommand(name) { }

  async deployCommands(secrets) {
    console.log("Deploying commands:")
    await deployCommands( //! May be bad :) returns nothing if it's not a "OnSlashCommand"
      this.commands.map((command) => {
        if (command.event === "OnSlashCommand" && command.isActive)
          return command = new SlashCommandBuilder().setName(command.data.trigger).setDescription(`${command.data.description}`)
      }), secrets)

    return true
  }

  async start(secrets) {
    this.client = new Discord.Client({
      intents: new Discord.Intents(32767)
    })
    
    let res = await this.client
      .login(this.token)
      .then(() => console.log(`Bot started: ${this.token}`))

    await this.loadCommands()
    this.runCommands()

    await this.deployCommands(secrets)

    this.running = true

    return res
  }

  stop() {
    this.client.destroy()
    this.running = false
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

  async isStatusOnline(secrets) {
    if (this.bots[secrets.token]?.running) return 'online'
    else return 'offline'
  }

  async startBot(secrets) {

    return this.bots[secrets.token]?.start(secrets)
  }

  async stopBot(token) {
    return this.bots[token]?.stop()
  }

  async restartBot(token) {
    return this.bots[token]?.restart()
  }
}
