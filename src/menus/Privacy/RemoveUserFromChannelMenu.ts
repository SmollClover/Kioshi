import { SelectMenuInteraction } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';
import { RunFunction } from '../../interfaces/Menu';
import { ensureChannel, removeUserFromChannel } from '../../common/Functions';

export const run: RunFunction = async (client, interaction: SelectMenuInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	await ensureChannel(client, interaction);

	if (!Data.Private)
		return interaction.reply({
			ephemeral: true,
			embeds: [client.errorEmbed({ title: `${Emojis.error} Channel isn't Private` })],
		});

	const input = interaction.values[0];

	if (!Data.AddedUsers.includes(input))
		return interaction.editReply({
			embeds: [client.errorEmbed({ title: "User hasn't been added to Channel" })],
		});

	Data.AddedUsers = Data.AddedUsers.filter((user) => user !== input);
	await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, { AddedUsers: Data.AddedUsers });

	removeUserFromChannel(interaction, Data.Channel, input);

	let User = interaction.guild.members.cache.get(input);
	if (!User) User = await interaction.guild.members.fetch({ force: true, user: input });

	return interaction.editReply({
		embeds: [client.embed({ title: `Removed User ${User ? User.displayName : input}` })],
	});
};

export const customId: string = 'removeUserFromChannel';
