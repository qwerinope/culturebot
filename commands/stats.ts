import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType } from "discord.js";
import { getGuildUsageCount, getUserUsageCount } from "../lib/sequelize.js";

export const data = new SlashCommandBuilder()
    .setName('stats')
    .setDescription('How much has this bot been used?')
    .setNSFW(true)

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
    const userRequestCount = await getUserUsageCount(interaction.user.id)
    const guildRequestCount = await getGuildUsageCount(interaction.guild?.id)

    const embed = new EmbedBuilder()
        .setTitle('Stats')
        .setColor(0xED2553)
        .setFields(
            { name: 'User count:', value: interaction.user.displayName + ' has used the bot ' + userRequestCount + ' times.' },
            { name: 'Server count:', value: interaction.guild?.name + ' has used the bot ' + guildRequestCount + ' times.' }
        )

    return interaction.editReply({ embeds: [embed] })
}
