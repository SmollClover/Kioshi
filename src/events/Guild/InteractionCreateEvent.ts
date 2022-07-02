import { Interaction } from 'discord.js';

import { Button } from '../../interfaces/Button';
import { Command } from '../../interfaces/Command';
import { RunFunction } from '../../interfaces/Event';
import { Menu } from '../../interfaces/Menu';
import { Modal } from '../../interfaces/Modal';

export const run: RunFunction = async (client, interaction: Interaction) => {
	if (interaction.isCommand()) {
		const command: Command | undefined = client.commands.get(interaction.commandName);
		if (!command) return;

		command.run(client, interaction).catch((reason: any) => {
			const embeds = [
				client.fatalErrorEmbed({
					description: `An Error occurred while executing the command:\n\`\`\`typescript\n${reason}\n\`\`\``,
				}),
			];

			if (interaction.deferred) {
				interaction.editReply({ embeds });
			} else {
				interaction.reply({ embeds });
			}

			return client.logger.error(reason);
		});
	} else if (interaction.isButton()) {
		const button: Button | undefined = client.buttons.get(interaction.customId);
		if (!button) return;

		button.run(client, interaction).catch((reason: any) => {
			const embeds = [
				client.fatalErrorEmbed({
					description: `An Error occurred while executing the command:\n\`\`\`typescript\n${reason}\n\`\`\``,
				}),
			];

			if (interaction.deferred) {
				interaction.editReply({ embeds });
			} else {
				interaction.reply({ embeds });
			}

			return client.logger.error(reason);
		});
	} else if (interaction.isSelectMenu()) {
		const menu: Menu | undefined = client.menus.get(interaction.customId);
		if (!menu) return;

		menu.run(client, interaction).catch((reason: any) => {
			const embeds = [
				client.fatalErrorEmbed({
					description: `An Error occurred while executing the command:\n\`\`\`typescript\n${reason}\n\`\`\``,
				}),
			];

			if (interaction.deferred) {
				interaction.editReply({ embeds });
			} else {
				interaction.reply({ embeds });
			}

			return client.logger.error(reason);
		});
	} else if (interaction.isModalSubmit()) {
		const modal: Modal | undefined = client.modals.get(interaction.customId);
		if (!modal) return;

		modal.run(client, interaction).catch((reason: any) => {
			const embeds = [
				client.fatalErrorEmbed({
					description: `An Error occurred while executing the command:\n\`\`\`typescript\n${reason}\n\`\`\``,
				}),
			];

			if (interaction.deferred) {
				interaction.editReply({ embeds });
			} else {
				interaction.reply({ embeds });
			}

			return client.logger.error(reason);
		});
	}
};

export const name: string = 'interactionCreate';
