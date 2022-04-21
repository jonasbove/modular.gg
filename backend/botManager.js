import dotenv from "dotenv"
import fs from 'fs'
import { Client, Collection, Intents /* DiscordAPIError */ } from 'discord.js'
import { Console } from "console"
dotenv.config({ path: '../.env' })
//import deployCommands from './templates/deployCommands'


class Bot {
  constructor(token) {
    console.log('making new bot')
    this.token = token
    this.running = false
    this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

    this.client.login(token)
      .then(() => console.log('Client connected'))

    this.areCommandsLoaded = false
    this.loadCommands().then(() => {
      console.log('commands are')
      console.log(this.commands)
    })
  }

  async loadCommands() {
    this.commands = (await Promise.all(fs.readdirSync(`./clients/${this.token}`).map(file => import(`./clients/${this.token}/${file}`))))
    this.areCommandsLoaded = true
    //let exCmd = { name: "Command to do stuff", func: () => {/*do stuf */ } }
  }

  async addCommand(name) {

  }

  start() {
    Console.log("i do nothing")
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
    return this.bots[token]
  }

  removeBot(token) {
    delete this.bots[token]
  }

  startBot(token) {

  }
}
