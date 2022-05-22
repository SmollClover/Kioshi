import { client } from '../client/Client';

export interface RunFunction {
	(client: client, ...args: any[]): Promise<unknown>;
}

export interface Event {
	name: string;
	run: RunFunction;
}
