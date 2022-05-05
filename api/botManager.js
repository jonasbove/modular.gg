import dotenv from 'dotenv'
import fs from 'fs'
import { Client, Collection, Intents /* DiscordAPIError */ } from 'discord.js'
dotenv.config({ path: '../.env' })
import deployCommands from './templates/deployCommands.js'

class Bot {
  constructor(token) {
    console.log('making new bot')
    this.token = token
    this.running = false
    this.client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],})

    this.client.commands = new Collection()
    this.client.commandsToDeploy = []

    this.areCommandsLoaded = false
    this.loadCommands().then(() => {
      console.log('commands are')
      console.log(this.commands)
    })
  }

  async loadCommands() {
    this.commands = await Promise.all(
      fs
        .readdirSync(`./clients/${this.token}`)
        .map((file) => import(`./clients/${this.token}/${file}`))
    )
    this.areCommandsLoaded = true
    //let exCmd = { name: "Command to do stuff", func: () => {/*do stuf */ } }
  }

  runCommands() {
    this.commands.forEach((command) => {
      console.log('Running a command')
      command.func(this.client)
    })
  }

  async addCommand(name) {}

  async deployCommands() {
    await deployCommands(this.client.commandsToDeploy.map(command => command.toJSON()), this.token)

    return true
  }

  async start() {
    return this.client
      .login(this.token)
      .then(() => console.log(`Bot started: ${this.token}`))
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
    this.bots[token].runCommands()
    return this.bots[token]
  }

  removeBot(token) {
    delete this.bots[token]
  }

  async startBot(token) {
    this.bots[token].deployCommands()
    
    return this.bots[token]?.start()
  }
  async stopBot(token) {
    return this.bots[token]?.stop()
  }
  async restartBot(token) {
    return this.bots[token]?.restart()
  }
}
