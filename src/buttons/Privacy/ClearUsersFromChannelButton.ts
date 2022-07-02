import { ButtonInteraction, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';
import { RunFunction } from '../../interfaces/Button';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	if (!Data.Private)
		return interaction.editReply({ embeds: [client.errorEmbed({ title: `${Emojis.error} Channel isn't Private` })] });

	if (!Data.AddedUsers.length)
		return interaction.editReply({ embeds: [client.errorEmbed({ title: `${Emojis.error} No Users to remove` })] });

	await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, { AddedUsers: [] });

	return interaction.editReply({
		embeds: [client.embed({ title: 'Removed Everyone from Channel' })],
	});
};

export const customId: string = 'clearUsersFromChannel';
