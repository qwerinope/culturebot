import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('contribute')
    .setNSFW()
    .setDescription('How do I contribute to the culturebot?')

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {

    const embed = new EmbedBuilder()
        .setTitle('Contributing')
        .setColor(0xED2553)
        .setFields(
            { name: 'How to contribute?', value: 'Source code is hosted on [GitHub](https://github.com/qweri0p/culturebot). Feel free to open issues and PRs.' },
            { name: 'What\'s the tech stack?', value: 'Discord.js built with typescript running on a nodejs docker container.' }
        )
    return interaction.editReply({ embeds: [embed] })
}
