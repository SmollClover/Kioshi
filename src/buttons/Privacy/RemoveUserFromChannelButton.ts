import { ButtonInteraction, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';
import { RunFunction } from '../../interfaces/Button';
import { ensureChannel } from '../../common/Functions';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	await ensureChannel(client, interaction);

	if (!Data.Private)
		return interaction.editReply({ embeds: [client.errorEmbed({ title: `${Emojis.error} Channel isn't Private` })] });

	if (!Data.AddedUsers.length)
		return interaction.editReply({ embeds: [client.errorEmbed({ title: `${Emojis.error} No Users to remove` })] });

	const options = await Promise.all(
		Data.AddedUsers.map(async (user) => {
			let User = interaction.guild.members.cache.get(user);
			if (!User) User = await interaction.guild.members.fetch({ force: true, user });

			return {
				label: User ? User.displayName : user,
				value: user,
			};
		})
	);

	return interaction.editReply({
		embeds: [client.embed({ title: 'Remove User from Channel' })],
		components: [
			new MessageActionRow().addComponents([
				new MessageSelectMenu()
					.setCustomId('removeUserFromChannel')
					.setPlaceholder('Select which User to remove')
					.setMinValues(1)
					.setMaxValues(1)
					.setOptions(options),
			]),
		],
	});
};

export const customId: string = 'removeUserFromChannel';
