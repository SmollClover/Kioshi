import { ButtonInteraction, MessageActionRow, Modal, ModalActionRowComponent, TextInputComponent } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data } from '../../interfaces/DB';
import { RunFunction } from '../../interfaces/Button';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	return interaction.showModal(
		new Modal()
			.setTitle('Change Channel Name')
			.setCustomId('changeChannelName')
			.addComponents(
				new MessageActionRow<ModalActionRowComponent>().addComponents([
					new TextInputComponent().setCustomId('name').setLabel('Channel Name').setStyle('SHORT'),
				])
			)
	);
};

export const customId: string = 'changeChannelName';
