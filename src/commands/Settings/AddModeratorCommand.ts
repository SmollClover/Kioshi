import { ApplicationCommandOptionData, CommandInteraction, GuildMember } from 'discord.js';
import { addModeratorToChannel } from '../../common/Functions';
import { RunFunction } from '../../interfaces/Command';
import { Settings, Data } from '../../interfaces/DB';

export const run: RunFunction = async (client, interaction: CommandInteraction) => {
	if (!(interaction.member as GuildMember).permissions.has('ADMINISTRATOR'))
		return interaction.reply({
			ephemeral: true,
			embeds: [client.errorEmbed({ description: '**Insufficient Permissions**\nAdministrator Permissions required!' })],
		});

	await interaction.deferReply();

	const SettingsSchema = await client.db.load('settings');
	const Settings = (await SettingsSchema.findOne({ Guild: interaction.guildId })) as Settings;
	const DataSchema = await client.db.load('data');
	const Data = (await DataSchema.find({ Guild: interaction.guildId })) as Data[];

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

	const user = interaction.options.getUser('user');
	const role = interaction.options.getRole('role');

	if (user && role)
		return interaction.editReply({ embeds: [client.errorEmbed({ title: 'Cannot add User and Role at the same time' })] });
	if (!user && !role)
		return interaction.editReply({ embeds: [client.errorEmbed({ title: 'You have to specify a user or a role' })] });

	if (user) {
		if (Settings.Moderators.includes(user.id))
			return interaction.editReply({ embeds: [client.errorEmbed({ title: 'User is already a Moderator' })] });

		Settings.Moderators.push(user.id);
	} else {
		if (Settings.Moderators.includes(role.id))
			return interaction.editReply({ embeds: [client.errorEmbed({ title: 'Role is already a Moderator' })] });

		Settings.Moderators.push(role.id);
	}

	await SettingsSchema.update({ Guild: interaction.guildId }, { Moderators: Settings.Moderators });

	Data.map((Entry) => addModeratorToChannel(interaction, Entry.Channel, role ? role.id : user.id));

	return interaction.editReply({ embeds: [client.embed({ title: `Added ${role ? role.name : user.tag} as Moderator` })] });
};

export const name: string = 'mod';
export const description: string = 'Make a Member or Role Moderator';
export const options: Array<ApplicationCommandOptionData> = [
	{
		type: 'USER',
		name: 'user',
		description: 'The User to Add (cannot add Role at same time)',
	},
	{
		type: 'ROLE',
		name: 'role',
		description: 'The Role to Add (cannot add User at same time)',
	},
];
