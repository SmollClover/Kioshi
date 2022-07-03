import {
	ApplicationCommandOptionData,
	CommandInteraction,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
	MessageSelectOptionData,
} from 'discord.js';

import { Emojis } from '../../common/Emojis';
import { Data, Settings } from '../../interfaces/DB';
import { RunFunction } from '../../interfaces/Command';

export const run: RunFunction = async (client, interaction: CommandInteraction) => {
	const SettingsSchema = await client.db.load('settings');
	const Settings = (await SettingsSchema.findOne({ Guild: interaction.guildId })) as Settings;

	if (!Settings) {
		await interaction.editReply({
			embeds: [
				client.fatalErrorEmbed({
					title: 'Error encountered',
					description:
						'Rolling back Settings to Default and emitting Guild Join Event.\nPlease try again, after the Bot has sent the standard Invitation Message.',
				}),
			],
		});

		return client.emit('guildCreate', interaction.guild);
	}

	if (!Settings.Moderators.includes(interaction.user.id)) return;

	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	const Data = (await DataSchema.find({ Guild: interaction.guildId })) as Data[];

	const members = await interaction.guild.members.fetch({ force: true });

	const options: MessageSelectOptionData[] = members
		.filter((member) => !!Data.find((d) => d.User === member.id))
		.map((member) => {
			return { label: member.displayName, value: member.id };
		});

	return interaction.editReply({
		embeds: [
			client.embed({
				title: 'Admin | Delete Data Entry',
				description: 'Choose which Data entry you want to Delete',
			}),
		],
		components: [
			new MessageActionRow().addComponents([
				new MessageSelectMenu().setCustomId('adminDeleteData').setMinValues(1).setMaxValues(1).setOptions(options),
			]),
		],
	});
};

export const name: string = 'delete';
export const description: string = 'Delete a Data Entry';
export const options: Array<ApplicationCommandOptionData> = [];
