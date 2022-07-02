import { CategoryChannel, Interaction } from 'discord.js';
import { DatabaseModule } from 'zapmongo';
import { client } from '../client/Client';

import { Data, Settings } from '../interfaces/DB';
import { Defaults } from './Defaults';

export async function ensureChannel(client: client, interaction: Interaction) {
	const SettingsSchema = await client.db.load('settings');
	const Settings = (await SettingsSchema.findOne({ Guild: interaction.guildId })) as Settings;
	const DataSchema = await client.db.load('data');
	const Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

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
					reason: 'Server Booster Perks | Created missing Channel',
					permissionOverwrites,
				});

				return DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, { Channel: Channel.id });
			}
		}
	} else {
		const channel = await interaction.guild.channels.fetch(Data.Channel, { force: true });

		if (channel.parentId !== Settings.Category)
			return channel.setParent(Settings.Category, {
				lockPermissions: false,
				reason: 'Server Booster Perks | Channel in wrong Category',
			});
	}
}
