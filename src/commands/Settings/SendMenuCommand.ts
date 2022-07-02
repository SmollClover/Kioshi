import { ApplicationCommandOptionData, CommandInteraction, GuildMember, MessageActionRow, MessageButton } from 'discord.js';

import { Emojis } from '../../common/Emojis';
import { Settings } from '../../interfaces/DB';
import { RunFunction } from '../../interfaces/Command';

export const run: RunFunction = async (client, interaction: CommandInteraction) => {
	if (!(interaction.member as GuildMember).permissions.has('ADMINISTRATOR'))
		return interaction.reply({
			ephemeral: true,
			embeds: [client.errorEmbed({ description: '**Insufficient Permissions**\nAdministrator Permissions required!' })],
		});

	const SettingsSchema = await client.db.load('settings');
	const Settings = (await SettingsSchema.findOne({ Guild: interaction.guildId })) as Settings;

	if (!Settings) {
		await interaction.editReply({
			embeds: [
				client.fatalErrorEmbed({
					title: 'Error encountered',
					description:
						'Rolling back Settings to Default and emitting Guild Join Event.\nPlease try again, after the Bot has sent the standard Invitation Message.',
				}),
			],
		});

		return client.emit('guildCreate', interaction.guild);
	}

	await interaction.deferReply({ ephemeral: true });

	await interaction.channel.send({
		embeds: [
			client.embed({
				title: 'Server Booster Channel Menu',
				description: 'Click one of the Options below to change that specific Setting.',
				footer: {
					text: 'Channels will be removed if not used for 48 hours',
				},
			}),
		],
		components: [
			new MessageActionRow().addComponents([
				new MessageButton().setCustomId('showInfo').setLabel('Info').setStyle('PRIMARY').setEmoji(Emojis.question_mark),
				new MessageButton()
					.setCustomId('openMetadataMenu')
					.setLabel('Metadata')
					.setStyle('SECONDARY')
					.setEmoji(Emojis.source),
				new MessageButton()
					.setCustomId('openPrivacyMenu')
					.setLabel('Privacy')
					.setStyle('SECONDARY')
					.setEmoji(Emojis.shield),
			]),
		],
	});

	return interaction.editReply({ content: Emojis.done });
};

export const name: string = 'menu';
export const description: string = 'Send the Menu in the current Channel';
export const options: Array<ApplicationCommandOptionData> = [];
