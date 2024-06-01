import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('unwholesome')
    .setNSFW()
    .setDescription('Why unwholesome isn\'t here')

export async function execute(interaction:ChatInputCommandInteraction<CacheType>) {

    const embed = new EmbedBuilder()
        .setColor(0xED2553)
        .setTitle('Unwholesome culture currently unimplemented.')
        .addFields(
            {name: 'Why?', value: 'nhentai\'s API doesn\'t allow non-humans.'},
            {name: 'Huh?', value: 'My reaction exactly. An API should be accessible to bots. Protecting it with cloudflare makes the API useless.'},
            {name: '):', value: 'If you have a solution or just want to complain do it [here](https://github.com/qweri0p/culturebot/issues/2) thanks.'},
            {name: 'Then how does it work now?', value: 'It uses [wholesomelist](https://wholesomelist.com/)\'s API, which is documented [here](https://wholesomelist.com/api).'}
        )
    
    return interaction.editReply({embeds: [embed]})
}