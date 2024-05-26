import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType, ActionRowBuilder, ButtonBuilder, ButtonStyle, AutocompleteInteraction } from "discord.js";
import { addCountToDb } from "../lib/sequelize.js";

export const data = new SlashCommandBuilder()
	.setName('search')
	.setNSFW()
	.setDescription('Get a random piece of culture which uses a certain tag.')
	.addNumberOption(option =>
		option.setName('tag')
			.setDescription('What kind of culture do you want?')
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addNumberOption(option =>
		option.setName('tag2')
			.setDescription('What other kind of culture do you want?')
			.setAutocomplete(true)
	)
	.addNumberOption(option =>
		option.setName('tag3')
			.setDescription('What other kind of culture do you want?')
			.setAutocomplete(true)
	)
export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	const rawalldata = await fetch("https://wholesomelist.com/api/list")
	const alldata = await rawalldata.json()
	const list = alldata.table
	const selectedTag = tags[interaction.options.getNumber('tag')!]
	const selectedTag2 = tags[interaction.options.getNumber('tag2')!]
	const selectedTag3 = tags[interaction.options.getNumber('tag3')!]
	const selectedTags = [selectedTag, selectedTag2, selectedTag3].filter(value => value !== undefined)

	const finalList: any[] = []
	list.forEach((element: { tags: string[]; }) => {
		if (selectedTags.every((item) => element.tags.includes(item))) finalList.push(element)
	});

	if (finalList.length === 0) {
		const failembed = new EmbedBuilder()
			.setColor(0xED2553)
			.setTitle("Culture not found ):")
			.setDescription('There is no culture with the following tags: ' + selectedTags.join(', '))
		return interaction.editReply({ embeds: [failembed] })
	}

	addCountToDb(interaction)

	//Select a piece of culture at random
	const selectedItem = finalList[Math.floor(Math.random() * finalList.length)]

	const embed = new EmbedBuilder()
		.setColor(0xED2553)
		.setTitle(selectedItem.title)
		.setURL(selectedItem.link)
		.setDescription(selectedItem.nh === null ? "Not on NHentai." : /\d+/.exec(selectedItem.nh)!.toString())
		.setThumbnail(selectedItem.image)
		.addFields(
			{ name: 'Pages', value: selectedItem.pages.toString() },
			{ name: 'Author', value: selectedItem.author.toString(), inline: true },
		)
	if (selectedItem.tags.length !== 0) embed.addFields({ name: 'Tags', value: selectedItem.tags.join(", ") })
	if (selectedItem.note !== null) embed.addFields({ name: 'Note', value: selectedItem.note, inline: true })
	if (selectedItem.parody !== null) embed.addFields({ name: 'Parodies', value: selectedItem.parody.toString(), inline: true })
	if (selectedItem.siteTags !== null) {
		if (selectedItem.siteTags.characters.length !== 0) {
			embed.addFields({ name: 'Characters', value: selectedItem.siteTags.characters.join(", "), inline: true })
		}
	}

	const openButton = new ButtonBuilder()
		.setLabel('Open')
		.setURL(selectedItem.link)
		.setStyle(ButtonStyle.Link)

	const wholesomeButton = new ButtonBuilder()
		.setLabel('Wholesomelist.com')
		.setURL("https://wholesomelist.com/list/" + selectedItem.uuid)
		.setStyle(ButtonStyle.Link)

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(openButton, wholesomeButton)

	return interaction.editReply({ embeds: [embed], components: [row] });
}

export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused();
	if (focusedValue === '') return
	const filtered = tags.filter(choice => choice.startsWith(focusedValue));
	await interaction.respond(
		filtered.map(choice => ({ name: choice, value: tags.indexOf(choice) })),
	);
}
