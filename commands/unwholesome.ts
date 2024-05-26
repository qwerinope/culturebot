import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType } from "discord.js";
import { API, Book, Tag } from "nhentai-api";
import { addCountToDb } from "../lib/sequelize.js";

const api = new API();

const formatTags = (tags: Tag[]) => {
    return tags.map(tag => tag.name).join(', ')
}

const buildDefaultEmbed = (embed: EmbedBuilder, culture: Book) => {
    embed.setTitle(culture.title.pretty.toString())
    embed.setDescription(culture.id.toString())
        .setThumbnail(api.getImageURL(culture.cover))
        .addFields(
            {
                name: 'Pages',
                value: culture.pages.length.toString()
            },
            {
                name: 'Language',
                value: formatTags(culture.languages),
                inline: false
            }
        )
    if (culture.artists.length !== 0) embed.addFields(
        {
            name: 'Authors',
            value: formatTags(culture.artists),
            inline: true
        }
    )
    embed.addFields(
        {
            name: 'Tags',
            value: culture.pureTags.join(", "),
            inline: false
        },
        {
            name: 'Catagories',
            value: formatTags(culture.categories),
            inline: true
        }
    )
    if (culture.parodies.length !== 0) embed.addFields(
        {
            name: 'Parodies',
            value:
                formatTags(culture.parodies),
            inline: false
        }
    )
    if (culture.characters.length !== 0) embed.addFields(
        {
            name: 'Characters',
            value:
                formatTags(culture.characters),
            inline: true
        }
    )

}

export const data = new SlashCommandBuilder()
    .setName('unwholesome')
    .setDescription('Unwholesome culture commands.')
    .addSubcommand(subcommand =>
        subcommand.setName('random')
            .setDescription('Random unwholesome culture.')
    )
    .addSubcommand(subcommand =>
        subcommand.setName('lookup')
            .setDescription('Get information on your possibly unwholesome culture.')
            .addNumberOption(option =>
                option.setName('code')
                    .setDescription('6-digit code that links to unwholesome culture.')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('search')
            .setDescription('Search for unwholesome culture.')
            .addStringOption(option =>
                option.setName('query')
                    .setDescription('What do you want to search for?')
                    .setRequired(true)
            )
        // .addNumberOption(option =>
        //     option.setName('page')
        //         .setDescription('What page of search results do you wish to see?')
        //         .setRequired(false)
        // )
    )

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {

    const embed = new EmbedBuilder()
        .setColor(0xED2553)
    switch (interaction.options.getSubcommand()) {
        case 'random':
            const randomCulture = await api.getRandomBook()
            buildDefaultEmbed(embed, randomCulture)
            addCountToDb(interaction)
            break;
        case 'lookup':
            const selectedid = interaction.options.getNumber('code')!
            try {
                const selectedCulture = await api.getBook(selectedid)
                buildDefaultEmbed(embed, selectedCulture)
                addCountToDb(interaction)
            } catch {
                embed.setTitle(`'${selectedid.toString()}' doesn't exist ):`)
            }
            break;
        case 'search':
            const searchquery = interaction.options.getString('query')!
            const prettyquery = searchquery.replaceAll(' ', "%20")
            // const searchpage = interaction.options.getNumber('page')!
            // const page = searchpage ? searchpage : 1
            const searchresult = await api.search(prettyquery)
            if (searchresult.books.length === 0) {
                embed.setTitle("No culture found ):")
                break;
            }
            const selectedbook = searchresult.books[Math.floor(Math.random() * searchresult.books.length)]
            buildDefaultEmbed(embed, selectedbook)
            addCountToDb(interaction)
            break;
        default:
            embed.setTitle("nah")
            break;
    }
    return interaction.editReply({ embeds: [embed] })
}
