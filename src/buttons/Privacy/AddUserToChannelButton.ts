import { ButtonInteraction, MessageActionRow, Modal, ModalActionRowComponent, TextInputComponent } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';
import { RunFunction } from '../../interfaces/Button';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	if (!Data.Private)
		return interaction.reply({
			ephemeral: true,
			embeds: [client.errorEmbed({ title: `${Emojis.error} Channel isn't Private` })],
		});

	return interaction.showModal(
		new Modal()
			.setTitle('Add User to Channel')
			.setCustomId('addUserToChannel')
			.addComponents(
				new MessageActionRow<ModalActionRowComponent>().addComponents([
					new TextInputComponent()
						.setCustomId('user')
						.setLabel('Username or User ID')
						.setRequired(true)
						.setStyle('SHORT'),
				])
			)
	);
};

export const customId: string = 'addUserToChannel';
