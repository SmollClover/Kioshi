import { RunFunction } from '../../interfaces/Interval';
import { client } from '../../client/Client';
import { Data, Settings } from '../../interfaces/DB';
import { Guild, GuildMember, VoiceChannel } from 'discord.js';

export const run: RunFunction = async (client) => {
	const SettingsSchema = await client.db.load('settings');
	const Settings = (await SettingsSchema.find({})) as Settings[];
	const DataSchema = await client.db.load('data');

	await Promise.all(
		Settings.map(async (Setting) => {
			const Entries = (await DataSchema.find({ Guild: Setting.Guild })) as Data[];

			await Promise.all(
				Entries.map(async (Data) => {
					const Guild = await getGuild(client, Data.Guild);
					if (!Guild) {
						await SettingsSchema.delete({ Guild: Data.Guild });
						while (await DataSchema.delete({ Guild: Data.Guild })) {}
						return;
					}

					const Member = await getMember(client, Data.Guild, Data.User);
					if (!Member) return DataSchema.delete({ Guild: Data.Guild, User: Data.User });

					const Channel = await getChannel(client, Data.Guild, Data.Channel);
					if (!Channel) return;

					if (Data.Used < Date.now() - 1000 * 60 * 60 * 24 * 2) {
						await DataSchema.delete({ Guild: Data.Guild, User: Data.User });
						try {
							return Channel.delete();
						} catch {}
					}
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

export const name = 'deleteOldChannel';
export const milliseconds = 1000 * 60 * 15;
