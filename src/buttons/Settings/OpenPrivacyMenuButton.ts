import { ButtonInteraction, MessageActionRow, MessageButton } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';
import { RunFunction } from '../../interfaces/Button';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	return interaction.editReply({
		embeds: [client.embed({ title: `Currently ${Data.Private ? 'Private' : 'Public'}` })],
		components: [
			new MessageActionRow().addComponents([
				new MessageButton()
					.setCustomId('makeChannelPublic')
					.setLabel('Make Public')
					.setEmoji(Emojis.key_off)
					.setStyle('SUCCESS')
					.setDisabled(!Data.Private),
				new MessageButton()
					.setCustomId('makeChannelPrivate')
					.setLabel('Make Private')
					.setEmoji(Emojis.key)
					.setStyle('DANGER')
					.setDisabled(Data.Private),
			]),
		],
	});
};

export const customId: string = 'openPrivacyMenu';
