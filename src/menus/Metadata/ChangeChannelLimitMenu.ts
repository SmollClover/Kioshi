import { SelectMenuInteraction } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';
import { RunFunction } from '../../interfaces/Menu';
import { changeChannelLimit, ensureChannel } from '../../common/Functions';

export const run: RunFunction = async (client, interaction: SelectMenuInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	await ensureChannel(client, interaction);

	Data.Limit = parseInt(interaction.values[0]);
	await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, { Limit: Data.Limit });

	await changeChannelLimit(interaction, Data.Channel, Data.Limit);

	return interaction.editReply({ embeds: [client.embed({ title: `Changed Limit to ${Data.Limit}` })] });
};

export const customId: string = 'changeChannelLimit';
