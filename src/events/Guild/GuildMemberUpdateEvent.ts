import { Guild, GuildMember, VoiceChannel } from 'discord.js';

import { RunFunction } from '../../interfaces/Event';
import { Data, Settings } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';

export const run: RunFunction = async (client, oldMember: GuildMember, newMember: GuildMember) => {
	if (newMember.user.bot) return;

	const SettingsSchema = await client.db.load('data');
	const Settings = (await SettingsSchema.findOne({ Guild: newMember.guild.id })) as Settings;
	const DataSchema = await client.db.load('data');
	const Data = (await DataSchema.findOne({ Guild: newMember.guild.id, User: newMember.id })) as Data;

	if (!Data && !oldMember.premiumSinceTimestamp && newMember.premiumSinceTimestamp) {
		if (!Settings.MessageChannelId) return;

		try {
			const messageChannel = await getChannel(newMember.guild, Settings.MessageChannelId);
			if (!messageChannel) return;

			return messageChannel.send({
				content: `${Emojis.boost} <@!${newMember.id}> **just boosted this Server. Thank you!** ${Emojis.boost}`,
			});
		} catch {}
	} else if (Data && oldMember.premiumSinceTimestamp && !newMember.premiumSinceTimestamp) {
		await DataSchema.delete({ Guild: newMember.guild.id, User: newMember.id });

		const Channel = await getChannel(newMember.guild, Data.Channel);
		if (Channel) return Channel.delete();
	}
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

export const name: string = 'guildMemberUpdate';
