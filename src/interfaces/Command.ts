import { ApplicationCommandOptionData, ApplicationCommandType, Interaction } from 'discord.js';

import { client } from '../client/Client';

export interface RunFunction {
	(client: client, interaction: Interaction): Promise<unknown>;
}

export interface Command {
	name: string;
	description: string;
	type?: ApplicationCommandType;
	options?: Array<ApplicationCommandOptionData>;
	defaultPermissions?: boolean;
	run: RunFunction;
}
