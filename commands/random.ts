import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CacheType, ActionRowBuilder } from "discord.js";
import { addCountToDb } from "../lib/sequelize.js";

export const data = new SlashCommandBuilder()
	.setName('random')
	.setNSFW()
	.setDescription('Give me random wholesome culture.')

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	const request = await fetch('https://wholesomelist.com/api/random')
	const culture = await request.json()
	const item: entry = culture.entry
	addCountToDb(interaction)

	const embed = new EmbedBuilder()
		.setColor(0xED2553)
		.setTitle(item.title)
		.setURL(item.link)
		.setDescription(item.nh === null ? "Not on NHentai." : /\d+/.exec(item.nh)!.toString())
		.setThumbnail(item.image)
		.addFields(
			{ name: 'Pages', value: culture.entry.pages.toString() },
			{ name: 'Author', value: culture.entry.author.toString(), inline: true },
		)
	if (culture.entry.tags.length !== 0) embed.addFields({ name: 'Tags', value: culture.entry.tags.join(", ") })
	if (culture.entry.note !== null) embed.addFields({ name: 'Note', value: culture.entry.note, inline: true })
	if (culture.entry.parody !== null) embed.addFields({ name: 'Parodies', value: culture.entry.parody.toString(), inline: true })
	if (culture.entry.siteTags !== null) {
		if (culture.entry.siteTags.characters.length !== 0) {
			embed.addFields({ name: 'Characters', value: culture.entry.siteTags.characters.join(", "), inline: true })
		}
	}
	const openButton = new ButtonBuilder()
		.setLabel('Open')
		.setURL(culture.entry.link)
		.setStyle(ButtonStyle.Link)

	const wholesomeButton = new ButtonBuilder()
		.setLabel('Wholesomelist.com')
		.setURL("https://wholesomelist.com/list/" + culture.entry.uuid)
		.setStyle(ButtonStyle.Link)

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(openButton, wholesomeButton)

	return interaction.editReply({ embeds: [embed], components: [row] });
}
