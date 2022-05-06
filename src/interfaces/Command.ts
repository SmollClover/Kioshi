import { client } from '../client/Client';
import { Interaction, ApplicationCommandType, ApplicationCommandOptionData } from 'discord.js';

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
