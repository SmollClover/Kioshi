import { ApplicationCommandDataResolvable } from 'discord.js';

import { Command } from '../../interfaces/Command';
import { RunFunction } from '../../interfaces/Event';

export const run: RunFunction = async (client) => {
	client.logger.success(`Client successfully started`);

	const devGuildId = '833444087255662623';
	const devGuild = client.guilds.cache.get(devGuildId);

	const commands = process.env.DEV ? devGuild.commands : client.application.commands;

	client.commands.map(async (command: Command) => {
		await commands.create({ ...(command as ApplicationCommandDataResolvable) });
	});
};

export const name: string = 'ready';
