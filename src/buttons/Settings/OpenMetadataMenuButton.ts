import { ButtonInteraction, MessageActionRow, MessageButton, CategoryChannel } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data, Settings } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';
import { RunFunction } from '../../interfaces/Button';
import { ensureChannel } from '../../common/Functions';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	await ensureChannel(client, interaction);

	const components = [
		new MessageActionRow().addComponents([
			new MessageButton()
				.setCustomId('changeChannelName')
				.setLabel('Change Name')
				.setEmoji(Emojis.draw_border)
				.setStyle('SECONDARY'),
			new MessageButton()
				.setCustomId('changeChannelLimit')
				.setLabel('Change User Limit')
				.setEmoji(Emojis.group)
				.setStyle('SECONDARY'),
		]),
	];

	const embeds = [
		client.embed({
			title: 'Metadata',
			fields: [
				{
					name: 'Channel Name',
					value: Data.Name ? Data.Name : interaction.user.username,
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

	return interaction.editReply({ embeds, components });
};

export const customId: string = 'openMetadataMenu';
