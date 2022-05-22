import { ButtonInteraction } from 'discord.js';

import { client } from '../client/Client';

export interface RunFunction {
	(client: client, interaction: ButtonInteraction): Promise<unknown>;
}

export interface Button {
	customId: string;
	run: RunFunction;
}
