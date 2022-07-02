import { ButtonInteraction } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';
import { RunFunction } from '../../interfaces/Button';
import { changeChannelStatus, ensureChannel } from '../../common/Functions';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	await ensureChannel(client, interaction);

	if (!Data.Private)
		return interaction.editReply({ embeds: [client.errorEmbed({ title: `${Emojis.error} Channel is already Public` })] });

	await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, { Private: false, AddedUsers: [] });

	await changeChannelStatus(interaction, Data.Channel, false);

	return interaction.editReply({ embeds: [client.embed({ title: `${Emojis.done} Channel set to Public` })] });
};

export const customId: string = 'makeChannelPublic';
