import { SelectMenuInteraction } from 'discord.js';

import { client } from '../client/Client';

export interface RunFunction {
	(client: client, interaction: SelectMenuInteraction): Promise<unknown>;
}

export interface Menu {
	customId: string;
	run: RunFunction;
}
