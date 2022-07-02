import { ButtonInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data } from '../../interfaces/DB';
import { RunFunction } from '../../interfaces/Button';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	return interaction.editReply({
		embeds: [client.embed({ title: 'Choose new User Limit' })],
		components: [
			new MessageActionRow().addComponents([
				new MessageSelectMenu()
					.setCustomId('changeChannelLimit')
					.setMinValues(1)
					.setMaxValues(1)
					.setPlaceholder(Data.Limit === 0 ? 'Currently no Limit' : `Current limit is ${Data.Limit}`)
					.setOptions([
						{
							label: 'No Limit',
							value: '0',
						},
						{
							label: '1 User',
							value: '1',
						},
						{
							label: '5 Users',
							value: '5',
						},
						{
							label: '10 Users',
							value: '10',
						},
						{
							label: '25 Users',
							value: '25',
						},
						{
							label: '50 Users',
							value: '50',
						},
						{
							label: '75 Users',
							value: '75',
						},
						{
							label: '99 Users',
							value: '99',
						},
					]),
			]),
		],
	});
};

export const customId: string = 'changeChannelLimit';
