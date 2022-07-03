import { ApplicationCommandOptionData, CommandInteraction, GuildMember, TextChannel } from 'discord.js';

import { RunFunction } from '../../interfaces/Command';
import { Settings } from '../../interfaces/DB';

export const run: RunFunction = async (client, interaction: CommandInteraction) => {
	if (!(interaction.member as GuildMember).permissions.has('ADMINISTRATOR'))
		return interaction.reply({
			ephemeral: true,
			embeds: [client.errorEmbed({ description: '**Insufficient Permissions**\nAdministrator Permissions required!' })],
		});

	await interaction.deferReply();

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

	const channel = interaction.options.get('channel')?.channel as TextChannel;
	const currentChannel = Settings.MessageChannelId;

	if (!channel) {
		if (!currentChannel)
			return interaction.editReply({
				embeds: [client.errorEmbed({ description: "**There's no Message Channel set**" })],
			});

		Settings.MessageChannelId = '';
		await SettingsSchema.update({ Guild: interaction.guildId }, { ...Settings });

		return interaction.editReply({ embeds: [client.embed({ description: '**Message Channel removed**' })] });
	} else {
		Settings.MessageChannelId = channel.id;
		await SettingsSchema.update({ Guild: interaction.guildId }, { ...Settings });

		return interaction.editReply({
			embeds: [client.embed({ description: `**Message Channel set to** <#${channel.id}>` })],
		});
	}
};

export const name: string = 'message';
export const description: string = 'Set a Channel for the Boost Messages';
export const options: Array<ApplicationCommandOptionData> = [
	{
		type: 'CHANNEL',
		name: 'channel',
		description: 'Set a Channel as the Log Channel. Leave empty to remove current Log Channel.',
		channelTypes: ['GUILD_TEXT'],
	},
];
