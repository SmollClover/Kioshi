import { ApplicationCommandOptionData, CategoryChannel, CommandInteraction, GuildMember } from 'discord.js';
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

	const channel = interaction.options.get('category')?.channel as CategoryChannel;
	const currentChannel = Settings.Category;

	if (!channel) {
		if (!currentChannel)
			return interaction.editReply({ embeds: [client.errorEmbed({ description: "**There's no Category set**" })] });

		Settings.Category = '';
		await SettingsSchema.update({ Guild: interaction.guildId }, { ...Settings });

		return interaction.editReply({ embeds: [client.embed({ description: '**Category removed**' })] });
	} else {
		Settings.Category = channel.id;
		await SettingsSchema.update({ Guild: interaction.guildId }, { ...Settings });

		return interaction.editReply({ embeds: [client.embed({ description: `**Category set to** \`${channel.name}\`` })] });
	}
};

export const name: string = 'category';
export const description: string = 'Set a Category for the Server Booster Channels';
export const options: Array<ApplicationCommandOptionData> = [
	{
		type: 'CHANNEL',
		name: 'category',
		description: 'Set a Category for the Channels. Leave empty to remove current Category.',
		channelTypes: ['GUILD_CATEGORY'],
	},
];
