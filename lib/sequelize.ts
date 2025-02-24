import { Sequelize, DataTypes } from "sequelize";
import { Client, Guild, Interaction } from "discord.js";

const sequelize = new Sequelize('main', 'root', process.env.MYSQL_PW?.toString(), {
    host: 'db',
    dialect: "mysql"
})

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('what connect to the database:', error);
}

const GuildModel = sequelize.define('guild', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    guildId: {
        type: DataTypes.BIGINT,
        unique: true,
        allowNull: false
    },
    requestCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isBased: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
})

const UserModel = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.BIGINT,
        unique: true,
        allowNull: false
    },
    requestCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
})

//Create database tables
export async function setupDB(client: Client) {
    GuildModel.sync()
    UserModel.sync()
    const guilds = client.guilds.cache.map((guild) => guild.id)
    const existingGuildsData = guilds.map((guild) => ({ guildId: guild }))

    await GuildModel.bulkCreate(existingGuildsData, { ignoreDuplicates: true })
    console.log('Succesfully put all data about guilds in database.')
}

// Run this when the bot is added to a guild
// Create a new entry into the database with the guild's ID as guildId
export async function addGuildToDb(guild: Guild) {
    const guildData = ({ guildId: guild.id })
    await GuildModel.create(guildData, { ignoreDuplicates: true })
}

// Run this when the bot is removed from a guild
// Delete all data associated with the guild
export async function removeGuildFromDb(guild: Guild) {
    const tobedeleted = await GuildModel.findOne({
        where: {
            guildId: guild.id
        }
    })
    if (tobedeleted !== null) await tobedeleted.destroy()
    else {
        console.error("Cannot find item in database to be deleted", guild.id)
    }
}

// Add 1 to both the guild and the user's 'requestCount''
export async function addCountToDb(interaction: Interaction) {
    const [user] = await UserModel.findOrCreate({
        where: { userId: interaction.user.id },
        defaults: { userId: interaction.user.id }
    });

    await user.update({ requestCount: await user.get('requestCount') as number + 1 })
    const guildEntry = await GuildModel.findOne({ where: { guildId: interaction.guildId } })
    await guildEntry?.update({ requestCount: await guildEntry.get('requestCount') as number + 1 })
}

// Get an array of guild Objects with the ID and the basedness
export async function getGuildsFromDatabase() {
    const listOfGuilds = await GuildModel.findAll()
    const filteredGuilds = listOfGuilds.map(instance => {
        return {
            guildId: instance.get('guildId'),
            isBased: instance.get('isBased')
        }
    })
    return filteredGuilds
}

// Boolean: Is this guild with guildId x based
export async function isGuildBased(guildId: string): Promise<any> {
    const basedness = await GuildModel.findOne({
        where: {
            guildId: guildId
        }
    })
    return basedness?.get('isBased')
}

// Number: How much culture has been searched for by the members of the guild
export async function getGuildUsageCount(guildId: any): Promise<any> {
    const cultureCount = await GuildModel.findOne({
        where: {
            guildId: guildId
        }
    })
    return cultureCount?.get('requestCount')
}

// Number: How much culture has been searched for by the user with userId x
export async function getUserUsageCount(userId: string): Promise<any> {
    const cultureCount = await UserModel.findOne({
        where: {
            userId: userId
        }
    })
    return cultureCount?.get('requestCount')
}

export async function changeBasedNess(guildId: string, newBasedNess: boolean): Promise<any> {
    const current = await isGuildBased(guildId)
    if (current === newBasedNess) return

    const guild = await GuildModel.findOne({
        where: {
            guildId: guildId
        }
    })
    await guild?.update({ isBased: newBasedNess })
}
