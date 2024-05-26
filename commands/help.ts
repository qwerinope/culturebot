import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('help')
    .setNSFW()
    .setDescription('How to use the culturebot.')
    .addSubcommand(subcommand =>
        subcommand.setName('search')
            .setDescription('How the "search" command works.')
    )
    .addSubcommand(subcommand =>
        subcommand.setName('lookup')
            .setDescription('How the "lookup" command works.')
    )
    .addSubcommand(subcommand =>
        subcommand.setName('random')
            .setDescription('How the "random" command works.')
    )

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
    const embed = new EmbedBuilder()
        .setColor(0xED2553)

    switch (interaction.options.getSubcommand()) {
        case 'search':
            embed.setTitle('How the "search" command works.')
                .addFields(
                    { name: 'What it does', value: 'Returns a piece of culture that features the tag(s) given by the user.' },
                    { name: 'Possible Tags', value: tags.join(", ") }
                )
            break;

        case 'lookup':
            embed.setTitle('How the "lookup" command works.')
                .addFields(
                    { name: 'What it does', value: 'Returns data about the piece of culture requested.' },
                    { name: 'What does it accept', value: 'It accepts NHentai codes, e-hentai codes and wholesomelist.com IDs.' },
                    { name: 'Not found ):', value: 'That piece of culture could not be found on wholesomelist.com.' }
                )
            break;

        case 'random':
            embed.setTitle('How the "random" command works.')
                .addFields(
                    { name: 'What it does', value: 'Returns a piece of culture from wholesomelist.com. Which means: no NTR, no underage, no rape, etc.' }
                )
            break;

        default:
            embed.setTitle('How to use the culturebot.')
                .addFields(
                    { name: 'Commands', value: '/random, /lookup and /search.' },
                    { name: 'How each command works.', value: 'Use /help {command} for help with that command.' }
                )
            break;
    }

    return interaction.editReply({ embeds: [embed] })
}
