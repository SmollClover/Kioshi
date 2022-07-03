import { VoiceState } from 'discord.js';

import { RunFunction } from '../../interfaces/Event';
import { Data } from '../../interfaces/DB';

export const run: RunFunction = async (client, oldState: VoiceState, newState: VoiceState) => {
	if (newState.member.user.bot) return;

	const DataSchema = await client.db.load('data');
	const Data = (await DataSchema.findOne({ Guild: newState.guild.id, User: newState.member.id })) as Data;
	if (!Data) return;

	if (newState.channelId === Data.Channel)
		return DataSchema.update({ Guild: newState.guild.id, User: newState.member.id }, { Used: Date.now() });

	if (oldState.channelId === Data.Channel && newState.channelId !== Data.Channel)
		return DataSchema.update({ Guild: newState.guild.id, User: newState.member.id }, { Used: Date.now() });
};

export const name: string = 'voiceStateUpdate';
