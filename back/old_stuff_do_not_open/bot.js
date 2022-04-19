require('dotenv').config()
const deployCommands = require('./deploy-commands')

const fs = require('fs')
const { Client, Collection, Intents /* DiscordAPIError */ } = require('discord.js')

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

// Commands handler

client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.data.name, command)
}

// Events handlers

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
  const event = require(`./events/${file}`)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client))
  } else {
    client.on(event.name, (...args) => event.execute(...args, client))
  }
}

function setDiscordBotStatus (status) {
  return new Promise((resolve, reject) => {
    try {
      switch (status) {
        case 'deploycommands':
          console.log('Deploying commands')
          deployCommands()
            .then(() => console.log('Commands deployed'))
          break
        case 'start':
          client.login(process.env.DISCORD_TOKEN)
          break
        case 'stop':
          client.channels.cache.get('938046899745865778').send('The bot is now going offline... it will still be visible as "online" for a few seconds')
            .then(() => client.destroy())
          break
        case 'restart':
          client.channels.cache.get('938046899745865778').send('Restarting the bot... please wait')
            .then(() => client.destroy())
            .then(() => client.login(process.env.DISCORD_TOKEN))
            .then(() => client.channels.cache.get('938046899745865778').send('Restarted success!'))
          break
      }
    } catch {
      reject(new Error('Bot is not online'))
    }

    resolve(status)
  })
}

function sendMessage (message) {
  return new Promise((resolve, reject) => {
    try {
      client.channels.cache.get('938046899745865778').send(message)
        .then(() => resolve())
    } catch (err) {
      reject(new Error('Bot is not online'))
    }
  })
}

/* fs.readFile('templates/commands/testcommand.js', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  let result = replaceFile(data, 'mycommand', 'dugrim')

  fs.writeFile('commands/testcommand.js', result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
}); */

function replaceFile (data, placeholder, replaceWith) {
  const result = data.replace(`\${${placeholder}}`, replaceWith)

  return result
}

function createCommand (commandName) {
  return new Promise((resolve, reject) => {
    fs.readFile('templates/commands/command.js', 'utf8', (err, data) => {
      if (err) reject(err)

      const result = replaceFile(data, 'mycommand', commandName)

      fs.writeFile(`commands/${commandName}.js`, result, 'utf8', err => {
        if (err) reject(err)

        resolve()
      })
    })
  })
}

module.exports = { setDiscordBotStatus, sendMessage, createCommand }
