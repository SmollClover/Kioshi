import { RunFunction } from '../../interfaces/Event';

export const run: RunFunction = async (client, error) => {
	client.logger.error(error);
};

export const name: string = 'error';
