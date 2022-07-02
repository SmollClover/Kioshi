import { client } from '../client/Client';

export interface RunFunction {
	(client: client): Promise<unknown>;
}

export interface Interval {
	name: string;
	milliseconds: number;
	run: RunFunction;
}
