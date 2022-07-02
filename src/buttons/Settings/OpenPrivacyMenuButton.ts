import { ButtonInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js';

import { Emojis } from '../../common/Emojis';
import { RunFunction } from '../../interfaces/Button';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	return interaction.editReply({
		embeds: [client.embed({ title: 'Channel Privacy Setting' })],
		components: [
			new MessageActionRow().addComponents([
				new MessageSelectMenu()
					.setCustomId('channelPrivacy')
					.setMinValues(1)
					.setMaxValues(1)
					.setOptions([
						{
							label: 'Public',
							value: 'public',
							description: 'Make Channel open to anyone',
							emoji: Emojis.key_off,
						},
						{
							label: 'Private',
							value: 'private',
							description: 'Close Channel for others',
							emoji: Emojis.key,
						},
					]),
			]),
		],
	});
};

export const customId: string = 'openPrivacyMenu';
