import { RunFunction } from '../../interfaces/Interval';
import { client } from '../../client/Client';
import { Data, Settings } from '../../interfaces/DB';
import { CategoryChannel, Guild, GuildMember, VoiceChannel } from 'discord.js';
import { Defaults } from '../../common/Defaults';

export const run: RunFunction = async (client) => {
	const SettingsSchema = await client.db.load('settings');
	const Settings = (await SettingsSchema.find({})) as Settings[];
	const DataSchema = await client.db.load('data');

	await Promise.all(
		Settings.map(async (Setting) => {
			const Entries = (await DataSchema.find({ Guild: Setting.Guild })) as Data[];

			await Promise.all(
				Entries.map(async (Data) => {
					if ((await ensureChannel(client, Setting, Data)) === true) return;

					const Guild = await getGuild(client, Data.Guild);
					if (!Guild) return;
					const Channel = await getChannel(client, Data.Guild, Data.Channel);
					if (!Channel) return;
					const Member = await getMember(client, Data.Guild, Data.User);
					if (!Member) return;

					if (Channel.userLimit !== Data.Limit) await Channel.setUserLimit(Data.Limit);
					if (Channel.name !== Data.Name) {
						if (Data.Name) await Channel.setName(Data.Name);
						if (!Data.Name && Channel.name !== Member.user.username) await Channel.setName(Member.user.username);
					}

					Channel.permissionOverwrites.cache.map((perm) => {
						if (perm.id === Guild.roles.everyone.id) {
							if (Channel.permissionsFor(perm.id).has('VIEW_CHANNEL', false) && Data.Private) {
								Channel.permissionOverwrites.edit(perm.id, { VIEW_CHANNEL: false });
							} else if (!Channel.permissionsFor(perm.id).has('VIEW_CHANNEL', false) && !Data.Private) {
								Channel.permissionOverwrites.edit(perm.id, { VIEW_CHANNEL: true });
							}

							return;
						}

						if (Channel.permissionsFor(perm.id).has('MANAGE_MESSAGES', false)) {
							if (!Setting.Moderators.includes(perm.id)) Channel.permissionOverwrites.delete(perm.id);
						}

						if (Setting.Moderators.includes(perm.id)) {
							if (!Channel.permissionsFor(perm.id).has('MANAGE_MESSAGES', false))
								Channel.permissionOverwrites.create(perm.id, {
									VIEW_CHANNEL: true,
									MANAGE_MESSAGES: true,
									MENTION_EVERYONE: true,
									USE_APPLICATION_COMMANDS: true,
									MOVE_MEMBERS: true,
									MUTE_MEMBERS: true,
								});
						}

						if (Channel.permissionsFor(perm.id).has('VIEW_CHANNEL', false)) {
							if (!Setting.Moderators.includes(perm.id) && !Data.AddedUsers.includes(perm.id))
								Channel.permissionOverwrites.delete(perm.id);
						}

						if (Data.AddedUsers.includes(perm.id)) {
							if (!Channel.permissionsFor(perm.id).has('VIEW_CHANNEL', false))
								Channel.permissionOverwrites.create(perm.id, { VIEW_CHANNEL: true });
						}
					});
				})
			);
		})
	);
};

async function getGuild(client: client, guild: string): Promise<Guild | false> {
	let Guild = client.guilds.cache.get(guild);
	try {
		if (!Guild) Guild = await client.guilds.fetch({ force: true, guild });
	} catch {
		return false;
	}
	if (!Guild) return false;
	return Guild;
}

async function getChannel(client: client, guild: string, channel: string): Promise<VoiceChannel | false> {
	const Guild = await getGuild(client, guild);
	if (!Guild) return false;

	let Channel = Guild.channels.cache.get(channel) as VoiceChannel;
	try {
		if (!Channel) Channel = (await Guild.channels.fetch(channel, { force: true })) as VoiceChannel;
	} catch {
		return false;
	}
	if (!Channel) return false;
	return Channel;
}

async function getMember(client: client, guild: string, user: string): Promise<GuildMember | false> {
	const Guild = await getGuild(client, guild);
	if (!Guild) return false;

	let Member = Guild.members.cache.get(user);
	try {
		if (!Member) Member = await Guild.members.fetch({ force: true, user });
	} catch {
		return false;
	}
	if (!Member) return false;
	return Member;
}

async function ensureChannel(client: client, Settings: Settings, Data: Data): Promise<any> {
	const Guild = await getGuild(client, Data.Guild);
	if (!Guild) return;

	const DataSchema = await client.db.load('data');

	let createChannel = false;
	if (!Data.Channel) createChannel = true;
	if (!createChannel) {
		const Channel = await getChannel(client, Guild.id, Data.Channel);
		if (!Channel) createChannel = true;
	}

	if (createChannel) {
		if (Settings.Category) {
			const Category = (await Guild.channels.fetch(Settings.Category, { force: true })) as CategoryChannel;
			if (Category) {
				const permissionOverwrites = [
					Defaults.Permissions.Default(Guild.roles.everyone.id, Data.Private),
					Defaults.Permissions.User(Data.User),
				];
				Settings.Moderators.map((moderator) => permissionOverwrites.push(Defaults.Permissions.Moderators(moderator)));

				const Member = await getMember(client, Guild.id, Data.User);

				const Channel = await Category.createChannel(
					Data.Name ? Data.Name : Member ? Member.user.username : Data.User,
					{
						type: 'GUILD_VOICE',
						reason: 'Server Booster Perks | Created missing Channel',
						permissionOverwrites,
						userLimit: Data.Limit,
					}
				);

				await DataSchema.update({ Guild: Guild.id, User: Data.User }, { Channel: Channel.id });
				return true;
			}
		}
	} else {
		const channel = await Guild.channels.fetch(Data.Channel, { force: true });

		if (channel.parentId !== Settings.Category)
			return channel.setParent(Settings.Category, {
				lockPermissions: false,
				reason: 'Server Booster Perks | Channel in wrong Category',
			});
	}
}

export const name = 'verifyIntegrity';
export const milliseconds = 1000 * 60 * 60;
