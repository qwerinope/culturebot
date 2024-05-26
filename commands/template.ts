import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType } from "discord.js";

export const data = new SlashCommandBuilder()

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {

    const embed = new EmbedBuilder()
        .setColor(0xED2553)

    return interaction.editReply({ embeds: [embed] })
}
