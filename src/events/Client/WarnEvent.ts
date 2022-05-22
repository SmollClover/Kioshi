import { RunFunction } from '../../interfaces/Event';

export const run: RunFunction = async (client, info) => {
	client.logger.warn(info);
};

export const name: string = 'warn';
