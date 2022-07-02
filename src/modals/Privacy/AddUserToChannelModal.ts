import { ModalSubmitInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';
import { RunFunction } from '../../interfaces/Modal';
import { ensureChannel } from '../../common/Functions';

export const run: RunFunction = async (client, interaction: ModalSubmitInteraction) => {
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

	const input = interaction.components[0].components[0].value;
	const members = (await interaction.guild.members.fetch({ force: true })).filter(
		(member) =>
			(!!member.displayName.toLowerCase().match(input.toLowerCase()) ||
				!!member.user.tag.toLowerCase().match(input.toLowerCase()) ||
				member.id === input) &&
			!Data.AddedUsers.includes(member.id)
	);

	if (members.size > 1) {
		const options = members.map((member) => {
			return { label: member.displayName, value: member.id };
		});

		return interaction.editReply({
			embeds: [client.embed({ title: 'Add User to Channel' })],
			components: [
				new MessageActionRow().addComponents([
					new MessageSelectMenu()
						.setCustomId('addUserToChannel')
						.setPlaceholder('Select which User to add')
						.setMinValues(1)
						.setMaxValues(1)
						.setOptions(options),
				]),
			],
		});
	} else if (members.size === 1) {
		if (Data.AddedUsers.includes(members.first().id))
			return interaction.editReply({
				embeds: [client.errorEmbed({ title: 'User is already added to Channel' })],
			});

		Data.AddedUsers.push(members.first().id);
		await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, { AddedUsers: Data.AddedUsers });

		return interaction.editReply({
			embeds: [client.embed({ title: `Added User ${members.first().displayName}` })],
		});
	} else {
		return interaction.editReply({
			embeds: [client.errorEmbed({ title: 'No User was found' })],
		});
	}
};

export const customId: string = 'addUserToChannel';
