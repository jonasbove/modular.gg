const { MessageEmbed } = require('discord.js')
const prefix = '!'

module.exports = {
  name: 'messageCreate',
  execute (message) {
    // Taget fra en eller anden på nettet herfra
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    // hertil

    if (command === 'nuke') {
      if (message.channel.id !== '938046899745865778') return message.channel.send('Du kan kun slette beskeder i #bot-testing')

      const channel = message.channel
      const MessageWithGif = new MessageEmbed()
        .setImage('https://c.tenor.com/giN2CZ60D70AAAAC/explosion-mushroom-cloud.gif')

      channel.bulkDelete(100)
        .then(message.channel.send({ embeds: [MessageWithGif] }).then(msg => setTimeout(() => msg.delete(), 3000)))
        .catch(console.error)
    }
  }
}
