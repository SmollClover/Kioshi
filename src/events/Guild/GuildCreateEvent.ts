import { Guild } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { RunFunction } from '../../interfaces/Event';

export const run: RunFunction = async (client, guild: Guild) => {
	const SettingsSchema = await client.db.load('settings');

	await SettingsSchema.update({ Guild: guild.id }, Defaults.Settings);

	try {
		await guild.systemChannel.send({
			embeds: [
				client.embed({
					title: 'Kioshi | The Simple Server Booster Perks Managing Bot',
					description:
						'You need to configure this Bot first, to make it work.\nPlease use `/` to execute the configuration Commands.',
					footer: {
						text: 'Administrative Privileges are required!',
					},
					timestamp: new Date(),
				}),
			],
		});
	} catch {}
};

export const name: string = 'guildCreate';
