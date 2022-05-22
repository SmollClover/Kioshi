import { Guild } from 'discord.js';

import { RunFunction } from '../../interfaces/Event';

export const run: RunFunction = async (client, guild: Guild) => {
	const guildId = guild.id;

	const SettingsSchema = await client.db.load('settings');

	await SettingsSchema.delete({ Guild: guildId });
};

export const name: string = 'guildDelete';
