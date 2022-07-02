import { ApplicationCommandOptionData, CommandInteraction, GuildMember } from 'discord.js';
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

	const description = Settings.Moderators.map((mod) => {
		const Role = interaction.guild.roles.cache.find((r) => r.id === mod);

		return Role ? `<@&${mod}>` : `<@!${mod}>`;
	}).join(' ');

	return interaction.editReply({
		embeds: [client.embed({ title: `Moderators`, description })],
	});
};

export const name: string = 'mods';
export const description: string = 'Remove a Member or Role from Moderator';
export const options: Array<ApplicationCommandOptionData> = [];
