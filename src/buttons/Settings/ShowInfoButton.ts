import { ButtonInteraction, CategoryChannel } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data, Settings } from '../../interfaces/DB';
import { RunFunction } from '../../interfaces/Button';
import { ensureChannel } from '../../common/Functions';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	ensureChannel(client, interaction);

	const embeds = [
		client.embed({
			title: 'Info',
			fields: [
				{
					name: 'Channel Name',
					value: Data.Name ? Data.Name : interaction.user.username,
					inline: true,
				},
				{
					name: 'Channel Status',
					value: Data.Private ? 'Private' : 'Public',
					inline: true,
				},
				{
					name: 'User Limit',
					value: Data.Limit === 0 ? 'No Limit' : `${Data.Limit.toString()} User${Data.Limit > 1 ? 's' : ''}`,
					inline: true,
				},
			],
		}),
	];

	if (Data.Private)
		embeds[0].addField(
			`Added Users [${Data.AddedUsers.length}]`,
			Data.AddedUsers.length > 0
				? Data.AddedUsers.map((user) => {
						return `<@!${user}>`;
				  }).join(' ')
				: 'None'
		);

	return interaction.editReply({ embeds });
};

export const customId: string = 'showInfo';
