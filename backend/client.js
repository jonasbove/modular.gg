require('dotenv').config({ path: '../.env' })
const deployCommands = require('./templates/deployCommands')

const { Client, Collection, Intents /* DiscordAPIError */ } = require('discord.js')

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

client.commands = new Collection()

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('Client connected'))

exports.client = client
