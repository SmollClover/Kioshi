import { ModalSubmitInteraction } from 'discord.js';

import { client } from '../client/Client';

export interface RunFunction {
	(client: client, interaction: ModalSubmitInteraction): Promise<unknown>;
}

export interface Modal {
	customId: string;
	run: RunFunction;
}
