const dotenv = require('dotenv')
const fs = require('fs')
dotenv.config({ path: '../.env' })
//import deployCommands from './templates/deployCommands'

const { Client, Collection, Intents /* DiscordAPIError */ } = require('discord.js')

let clients = {}

async function createBot(token) {
  const client = clients[token] ?? new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

  const functions = fs
    .readdirSync(`./clients/${token}`)
    .map(file => require(`./clients/${token}/${file}`))
    .reduce((a,b) => a.concat(b), [])

  functions.forEach(func => func())

  client.commands = new Collection()

  clients[token] = client

  //client.login(token)
  //  .then(() => console.log('Client connected'))
}

createBot('OTM4MDUxMjk5NzA5MTkwMTQ0.YfkqWg.wMoowU9LhN15pC1YAJkJbLiXU-o')