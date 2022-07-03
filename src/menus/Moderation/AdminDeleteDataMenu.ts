import { SelectMenuInteraction } from 'discord.js';

import { Data } from '../../interfaces/DB';
import { RunFunction } from '../../interfaces/Menu';

export const run: RunFunction = async (client, interaction: SelectMenuInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const input = interaction.values[0];

	const DataSchema = await client.db.load('data');
	const Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: input })) as Data;
	await DataSchema.delete({ Guild: interaction.guildId, User: input });

	try {
		await (await interaction.guild.channels.fetch(Data.Channel, { force: true })).delete();
	} catch {}

	return interaction.editReply({
		embeds: [client.embed({ title: `Deleted ${Data.Guild}-${Data.User}` })],
	});
};

export const customId: string = 'adminDeleteData';
