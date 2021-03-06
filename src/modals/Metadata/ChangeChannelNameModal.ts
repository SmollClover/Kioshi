import { ModalSubmitInteraction } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { changeChannelName, ensureChannel } from '../../common/Functions';
import { Data } from '../../interfaces/DB';
import { RunFunction } from '../../interfaces/Modal';

export const run: RunFunction = async (client, interaction: ModalSubmitInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	await ensureChannel(client, interaction);

	Data.Name = interaction.components[0].components[0].value;
	await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, { Name: Data.Name });

	await changeChannelName(interaction, Data.Channel, Data.Name ? Data.Name : interaction.user.username);

	return interaction.editReply({
		embeds: [client.embed({ title: Data.Name ? `Changed Name to ${Data.Name}` : 'Removed Name' })],
	});
};

export const customId: string = 'changeChannelName';
