import consola, { Consola } from 'consola';
import { Client, Collection, Intents, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import glob from 'glob';
import { promisify } from 'util';
import { Database } from 'zapmongo';

import { Button } from '../interfaces/Button';
import { Command } from '../interfaces/Command';
import { Event } from '../interfaces/Event';
import { Menu } from '../interfaces/Menu';
import { Modal } from '../interfaces/Modal';

const globPromise = promisify(glob);

class client extends Client {
	public db: Database;

	public logger: Consola = consola;
	public commands: Collection<string, Command> = new Collection();
	public buttons: Collection<string, Button> = new Collection();
	public menus: Collection<string, Menu> = new Collection();
	public modals: Collection<string, Modal> = new Collection();
	public aliases: Collection<string, string> = new Collection();
	public events: Collection<string, Event> = new Collection();

	public constructor() {
		super({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_INTEGRATIONS,
			],
		});
	}

	public async start(TOKEN: string): Promise<void> {
		if (process.env.DEV) this.logger.info('Development Env Variable set');

		this.login(TOKEN);

		const commandFiles: string[] = await globPromise(`${__dirname}/../commands/**/*{.ts,.js}`);
		commandFiles.map(async (value: string) => {
			const file: Command = await import(value);
			this.commands.set(file.name, {
				...file,
			});
		});

		const buttonFiles: string[] = await globPromise(`${__dirname}/../buttons/**/*{.ts,.js}`);
		buttonFiles.map(async (value: string) => {
			const file: Button = await import(value);
			this.buttons.set(file.customId, {
				...file,
			});
		});

		const menuFiles: string[] = await globPromise(`${__dirname}/../menus/**/*{.ts,.js}`);
		menuFiles.map(async (value: string) => {
			const file: Menu = await import(value);
			this.menus.set(file.customId, { ...file });
		});

		const modalFiles: string[] = await globPromise(`${__dirname}/../modals/**/*{.ts,.js}`);
		modalFiles.map(async (value: string) => {
			const file: Modal = await import(value);
			this.modals.set(file.customId, { ...file });
		});

		const eventFiles: string[] = await globPromise(`${__dirname}/../events/**/*{.ts,.js}`);
		eventFiles.map(async (value: string) => {
			const file: Event = await import(value);
			this.events.set(file.name, file);

			this.on(file.name, file.run.bind(undefined, this));
		});

		this.db = new Database({
			mongoURI: process.env.MONGO_URI,
			schemas: [
				{
					name: 'settings',
					data: {
						Guild: String,
						Moderators: Array,
						LogChannelId: String,
						Category: String,
					},
				},
				{
					name: 'data',
					data: {
						Guild: String,
						User: String,
						Channel: String,
						Private: Boolean,
						AddedUsers: Array<string>,
						Name: String,
						Limit: Number,
					},
				},
			],
		});
	}

	public embed(options: MessageEmbedOptions): MessageEmbed {
		return new MessageEmbed({ ...options }).setColor('#2f3136');
	}

	public cleanEmbed(options: MessageEmbedOptions): MessageEmbed {
		return new MessageEmbed({ ...options });
	}

	public errorEmbed(options: MessageEmbedOptions): MessageEmbed {
		return new MessageEmbed({ ...options }).setColor('#F15353');
	}

	public fatalErrorEmbed(options: MessageEmbedOptions): MessageEmbed {
		return new MessageEmbed({ ...options }).setColor('#FF0000').setTimestamp();
	}
}

export { client };
