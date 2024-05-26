import { REST, Routes } from 'discord.js';
import { getGuildsFromDatabase, isGuildBased } from './lib/sequelize.js';
import path from "node:path";
import fs from 'node:fs';
import url from 'node:url';

const basedCommands = ['unwholesome']

interface crapobject extends JSON {
    name: string
}

function filterCommands(commands: crapobject[], basedCommands: string[], isBased: Boolean) {
    if (isBased) return commands
    return commands.filter(obj => !basedCommands.includes(obj.name)) //doesn't work but this isn't the issue here somehow
}

const commands: any[] = [];

const filesPath = path.join(url.fileURLToPath(new URL('.', import.meta.url)), 'commands');
const actualCommandFiles = fs.readdirSync(filesPath);

const commandFiles = actualCommandFiles.filter(item => item !== 'template.js')

for (const file of commandFiles) {
    const filePath = path.join(filesPath, file);
    const command = await import(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module

// and deploy your commands!
export async function initialRegister(token: string, client_id: string) {
    const guildData = await getGuildsFromDatabase() as any

    for (let i = 0; i < guildData.length; i++) {
        try {
            const commandData = filterCommands(commands, basedCommands, guildData[i].isBased)
            console.log(`Started refreshing ${commandData.length} application (/) guildcommands in ` + guildData[i].guildId);
            // The put method is used to fully refresh all commands in the guild with the current set
            const rest = new REST().setToken(token)
            await rest.put(
                Routes.applicationGuildCommands(client_id, guildData[i].guildId),
                { body: commandData }
            ).then(() => console.log(`Successfully created ${commandData.length} application (/) guildcommands in ` + guildData[i].guildId))
                .catch(console.error);
        } catch (error) {
            console.error(error);
        }
    }
    console.log('Done with registering commands.')
};

export async function deleteGuildCommands(guildId: string, token: string, client_id: string) {
    const rest = new REST().setToken(token)
    try {
        console.log(`Started refreshing ${commands.length} application (/) guildcommands in ` + guildId);
        rest.put(Routes.applicationGuildCommands(client_id, guildId), { body: [] })
            .then(() => console.log('Successfully deleted guildcommands in guild ' + guildId))
            .catch(console.error);
    } catch (error) {
        console.error(error);
    }
}

export async function registerGuildCommands(guildId: string, token: string, client_id: string) {
    const rest = new REST().setToken(token)
    const basedness = await isGuildBased(guildId)
    try {
        const commandData = filterCommands(commands, basedCommands, basedness)
        const data = await rest.put(
            Routes.applicationGuildCommands(client_id, guildId),
            { body: commandData }
        ) as string[];
        console.log(`Successfully created ${data.length} application (/) guildcommands in ` + guildId);
    } catch (error) {
        console.error(error)
    }
}
