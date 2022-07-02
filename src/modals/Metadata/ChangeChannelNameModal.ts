import { ModalSubmitInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data } from '../../interfaces/DB';
import { RunFunction } from '../../interfaces/Modal';

export const run: RunFunction = async (client, interaction: ModalSubmitInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	Data.Name = interaction.components[0].components[0].value;
	await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, { Name: Data.Name });

	return interaction.editReply({ embeds: [client.embed({ title: `Changed Name to ${Data.Name}` })] });
};

export const customId: string = 'changeChannelName';
