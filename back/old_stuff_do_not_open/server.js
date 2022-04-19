const DiscordBot = require('./bot')
const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors(), express.json())

app.post('/setBotStatus', (req, res) => {
  DiscordBot.setDiscordBotStatus(req.body.status)
    .then(() => res.json(({ status: req.body.status })))
    .catch(() => console.log('Bot is not online'))
})

app.post('/sendMessage', (req, res) => {
  DiscordBot.sendMessage(req.body.message)
    .then(() => {
      res.json(({ status: 'Message sent' }))
    })
    .catch(() => {
      res.json(({ status: 'Bot is not online' }))
    })
})

app.post('/addCommand', (req, res) => {
  DiscordBot.createCommand(req.body.command)
    .then(() => {
      res.json(({ status: 'Command added' }))
    })
    .catch((err) => {
      console.log(err)
      res.json(({ status: 'nej' }))
    })
})

try {
  app.listen(3000)
  console.log('Server started')
  // DiscordBot.setDiscordBotStatus('start')
} catch (err) {
  console.log(err)
}
