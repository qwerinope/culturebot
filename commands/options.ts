import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType, PermissionFlagsBits } from "discord.js";
import { changeBasedNess } from "../lib/sequelize.js";
import { deleteGuildCommands, registerGuildCommands } from "../register.js";
import { client_id, token } from "../index.js";

export const data = new SlashCommandBuilder()
    .setName("options")
    .setDescription("Change settings for the culturebot.")
    .addSubcommand(cmd =>
        cmd.setName("unwholesome")
            .setDescription("(Dis)allow use of the unwholesome command.")
            .addBooleanOption(opt =>
                opt.setName("allowed")
                    .setDescription("True or False")
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
    const isBased = interaction.options.getBoolean("allowed")!
    const guildId = interaction.guildId!

    const embed = new EmbedBuilder()
        .setColor(0xED2553)
        .setTitle(isBased ? "Unwholesome content now allowed" : "Unwholesome content now disallowed")
        .setDescription("The /unwholesome command is now " + isBased ? "available" : "unavailable" + ".")

    await changeBasedNess(guildId, isBased)

    await deleteGuildCommands(guildId, token!, client_id!)
    await registerGuildCommands(guildId, token!, client_id!)

    return interaction.editReply({ embeds: [embed] })
}
