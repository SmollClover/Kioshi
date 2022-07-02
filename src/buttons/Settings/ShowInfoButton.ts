import { ButtonInteraction, CategoryChannel } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data, Settings } from '../../interfaces/DB';
import { RunFunction } from '../../interfaces/Button';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	let createChannel = false;
	if (!Data.Channel) createChannel = true;
	if (!createChannel) {
		if (!interaction.guild.channels.cache.get(Data.Channel)) {
			try {
				(await interaction.guild.channels.fetch(Data.Channel, { force: true })).id;
			} catch {
				createChannel = true;
			}
		}
	}

	if (createChannel) {
		const SettingsSchema = await client.db.load('settings');
		const Settings = (await SettingsSchema.findOne({ Guild: interaction.guildId })) as Settings;

		if (Settings.Category) {
			const Category = (await interaction.guild.channels.fetch(Settings.Category, { force: true })) as CategoryChannel;
			if (Category) {
				const permissionOverwrites = [
					Defaults.Permissions.Default(interaction.guild.roles.everyone.id, Data.Private),
					Defaults.Permissions.User(Data.User),
				];
				Settings.Moderators.map((moderator) => permissionOverwrites.push(Defaults.Permissions.Moderators(moderator)));

				const Channel = await Category.createChannel(interaction.user.username, {
					type: 'GUILD_VOICE',
					reason: 'Server Booster Perks | Created Missing Channel',
					permissionOverwrites,
				});

				await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, { Channel: Channel.id });
			}
		}
	}

	const embeds = [
		client.embed({
			title: 'Info',
			fields: [
				{
					name: 'Channel Name',
					value: Data.Name ? Data.Name : interaction.user.username,
					inline: true,
				},
				{
					name: 'Channel Status',
					value: Data.Private ? 'Private' : 'Public',
					inline: true,
				},
				{
					name: 'User Limit',
					value: Data.Limit === 0 ? 'No Limit' : `${Data.Limit.toString()} User${Data.Limit > 1 ? 's' : ''}`,
					inline: true,
				},
			],
		}),
	];

	if (Data.Private)
		embeds[0].addField(
			`Added Users [${Data.AddedUsers.length}]`,
			Data.AddedUsers.length > 0
				? Data.AddedUsers.map((user) => {
						return `<@!${user}>`;
				  }).join(' ')
				: 'None'
		);

	return interaction.editReply({ embeds });
};

export const customId: string = 'showInfo';
