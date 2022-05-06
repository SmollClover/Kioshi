import { client } from '../client/Client';
import { ButtonInteraction } from 'discord.js';

export interface RunFunction {
	(client: client, interaction: ButtonInteraction): Promise<unknown>;
}

export interface Button {
	customId: string;
	run: RunFunction;
}
