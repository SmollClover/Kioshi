import { Guild, GuildMember, VoiceChannel } from 'discord.js';

import { RunFunction } from '../../interfaces/Event';
import { Data } from '../../interfaces/DB';

export const run: RunFunction = async (client, member: GuildMember) => {
	if (member.user.bot) return;

	const DataSchema = await client.db.load('data');
	const Data = (await DataSchema.findOne({ Guild: member.guild.id, User: member.id })) as Data;
	if (!Data) return;

	await DataSchema.delete({ Guild: member.guild.id, User: member.id });

	const Channel = await getChannel(member.guild, Data.Channel);
	if (Channel) return Channel.delete();
};

async function getChannel(guild: Guild, channel: string): Promise<VoiceChannel | false> {
	let Channel = guild.channels.cache.get(channel) as VoiceChannel;
	try {
		if (!Channel) Channel = (await guild.channels.fetch(channel, { force: true })) as VoiceChannel;
	} catch {
		return false;
	}
	if (!Channel) return false;
	return Channel;
}

export const name: string = 'guildMemberRemove';
