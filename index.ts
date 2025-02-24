import { ActivityType, Client, Events, GatewayIntentBits } from 'discord.js';
import { initialRegister, registerGuildCommands } from './register.js';
import path from "node:path";
import fs from 'node:fs';
import url from 'node:url'
import { addGuildToDb, removeGuildFromDb, setupDB } from './lib/sequelize.js';

//Load the login details
export const token = process.env.TOKEN
export const client_id = process.env.CLIENT_ID

//Check if the details are there. If not, close.
if (!token) { console.error('Please provide a discord bot token in the environment variable "TOKEN".'); process.exit() }
if (!client_id) { console.error('Please provide the discord client_id from the same application as the bot in the environment variable "CLIENT_ID".'); process.exit() }

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const filesPath = path.join(url.fileURLToPath(new URL('.', import.meta.url)), 'commands');
const commandFiles = fs.readdirSync(filesPath);

const commands = new Map()

for (const file of commandFiles) {
	const filePath = path.join(filesPath, file);
	const command = await import(filePath)
	if ('data' in command && 'execute' in command) {
		commands.set(command.data.name, command);
	} else {
		console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, async c => {
	await setupDB(c)
	await initialRegister(token, client_id) //actually register the commands
	console.log(`Ready! Logged in as ${c.user.tag}`);

	setInterval(async () => {
		let dothething = true
		while (dothething) {
			const request = await fetch('https://wholesomelist.com/api/random')
			const culture = await request.json()
			const item: any = culture.entry
			if (item.nh !== null) {
				c.user.setActivity(/\d+/.exec(item.nh)!.toString(), { type: ActivityType.Watching })
				dothething = false
			}
		}
	}, 60E3)

});

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		await interaction.deferReply()

		const command = commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: 'There was an error while executing this command!' });
		}
	}

	else if (interaction.isAutocomplete()) {
		const command = commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
		}
	}
});

client.on(Events.GuildCreate, async guild => {
	await addGuildToDb(guild)
	await registerGuildCommands(guild.id, token, client_id)
});

client.on(Events.GuildDelete, async guild => {
	await removeGuildFromDb(guild)
});

client.login(token);
