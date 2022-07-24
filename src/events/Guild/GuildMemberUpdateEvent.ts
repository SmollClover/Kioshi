import { Guild, GuildMember, VoiceChannel } from 'discord.js';

import { RunFunction } from '../../interfaces/Event';
import { Settings } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';

export const run: RunFunction = async (client, oldMember: GuildMember, newMember: GuildMember) => {
	if (newMember.user.bot) return;

	const SettingsSchema = await client.db.load('settings');
	const Settings = (await SettingsSchema.findOne({ Guild: newMember.guild.id })) as Settings;

	if (newMember.premiumSinceTimestamp && oldMember.premiumSinceTimestamp !== newMember.premiumSinceTimestamp) {
		if (!Settings.MessageChannelId) return;

		try {
			const messageChannel = await getChannel(newMember.guild, Settings.MessageChannelId);
			if (!messageChannel) return;

			return messageChannel.send({
				content: `${Emojis.boost} <@!${newMember.id}> **just boosted this Server. Thank you!** ${Emojis.boost}`,
			});
		} catch {}
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
