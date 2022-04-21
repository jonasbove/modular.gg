import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })
//import deployCommands from './templates/deployCommands'

import { Client, Collection, Intents /* DiscordAPIError */ } from 'discord.js'

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

client.commands = new Collection()

function connectBot(token) {
  client.login(token)
    .then(() => console.log('Client connected'))
}

exports.client = client
