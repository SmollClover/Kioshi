import { CategoryChannel, Interaction, VoiceChannel } from 'discord.js';
import { client } from '../client/Client';

import { Data, Settings } from '../interfaces/DB';
import { Defaults } from './Defaults';

export async function getChannel(interaction: Interaction, channel: string): Promise<VoiceChannel | false> {
	let Channel = interaction.guild.channels.cache.get(channel) as VoiceChannel;
	try {
		if (!Channel) Channel = (await interaction.guild.channels.fetch(channel, { force: true })) as VoiceChannel;
	} catch {
		return false;
	}
	if (!Channel) return false;
	return Channel;
}

export async function ensureChannel(client: client, interaction: Interaction): Promise<any> {
	const SettingsSchema = await client.db.load('settings');
	const Settings = (await SettingsSchema.findOne({ Guild: interaction.guildId })) as Settings;
	const DataSchema = await client.db.load('data');
	const Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	let createChannel = false;
	if (!Data.Channel) createChannel = true;
	if (!createChannel) {
		const Channel = await getChannel(interaction, Data.Channel);
		if (!Channel) createChannel = true;
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

				const Channel = await Category.createChannel(Data.Name ? Data.Name : interaction.user.username, {
					type: 'GUILD_VOICE',
					reason: 'Server Booster Perks | Created missing Channel',
					permissionOverwrites,
					userLimit: Data.Limit,
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

export async function addUserToChannel(interaction: Interaction, channel: string, user: string): Promise<any> {
	const Channel = await getChannel(interaction, channel);
	if (!Channel) return;

	if (Channel.permissionsFor(user).has('VIEW_CHANNEL', false)) return;
	Channel.permissionOverwrites.create(user, { VIEW_CHANNEL: true });
	return;
}

export async function removeUserFromChannel(interaction: Interaction, channel: string, user: string): Promise<any> {
	const Channel = await getChannel(interaction, channel);
	if (!Channel) return;

	if (!Channel.permissionsFor(user).has('VIEW_CHANNEL', false)) return;
	Channel.permissionOverwrites.delete(user);
	return;
}

export async function addModeratorToChannel(interaction: Interaction, channel: string, user: string): Promise<any> {
	const Channel = await getChannel(interaction, channel);
	if (!Channel) return;

	if (Channel.permissionsFor(user).has('MANAGE_MESSAGES', false)) return;
	Channel.permissionOverwrites.create(user, {
		VIEW_CHANNEL: true,
		MANAGE_MESSAGES: true,
		MENTION_EVERYONE: true,
		USE_APPLICATION_COMMANDS: true,
		MOVE_MEMBERS: true,
		MUTE_MEMBERS: true,
	});
	return;
}

export async function removeModeratorFromChannel(interaction: Interaction, channel: string, user: string): Promise<any> {
	const Channel = await getChannel(interaction, channel);
	if (!Channel) return;

	if (!Channel.permissionsFor(user).has('MANAGE_MESSAGES', false)) return;
	Channel.permissionOverwrites.delete(user);
	return;
}

export async function changeChannelStatus(interaction: Interaction, channel: string, closed: boolean): Promise<any> {
	const Channel = await getChannel(interaction, channel);
	if (!Channel) return;

	Channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { VIEW_CHANNEL: !closed });
	return;
}

export async function changeChannelName(interaction: Interaction, channel: string, name: string): Promise<any> {
	const Channel = await getChannel(interaction, channel);
	if (!Channel) return;

	Channel.setName(name);
	return;
}

export async function changeChannelLimit(interaction: Interaction, channel: string, limit: number): Promise<any> {
	const Channel = await getChannel(interaction, channel);
	if (!Channel) return;

	Channel.setUserLimit(limit);
	return;
}
