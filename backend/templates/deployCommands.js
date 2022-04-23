// This is used to deploy commands to Discord således at Discord ved hvilke kommandoer der findes
import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

export default function deployCommands(commands, token) {
  const rest = new REST({ version: '9' }).setToken(token);

	return rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
}

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
  new SlashCommandBuilder().setName('hejcarsten').setDescription('Replies with user info!'),
	new SlashCommandBuilder().setName('lort').setDescription('Replies with user info!'),
]
	.map(command => command.toJSON());

/*deployCommands(commands)
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);*/