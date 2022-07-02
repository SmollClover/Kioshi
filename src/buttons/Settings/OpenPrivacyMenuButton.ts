import { ButtonInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js';

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
							emoji: '<:key_off:992767463156629534>',
						},
						{
							label: 'Private',
							value: 'private',
							description: 'Close Channel for others',
							emoji: '<:key:992767464150679583>',
						},
					]),
			]),
		],
	});
};

export const customId: string = 'openPrivacyMenu';
