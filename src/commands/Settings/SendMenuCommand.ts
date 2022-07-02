import { ApplicationCommandOptionData, CommandInteraction, GuildMember, MessageActionRow, MessageButton } from 'discord.js';
import { RunFunction } from '../../interfaces/Command';

export const run: RunFunction = async (client, interaction: CommandInteraction) => {
	if (!(interaction.member as GuildMember).permissions.has('ADMINISTRATOR'))
		return interaction.reply({
			ephemeral: true,
			embeds: [client.errorEmbed({ description: '**Insufficient Permissions**\nAdministrator Permissions required!' })],
		});

	await interaction.deferReply({ ephemeral: true });

	await interaction.channel.send({
		embeds: [
			client.embed({
				title: 'Server Booster Channel Menu',
				description: 'Click one of the Options below to change that specific Setting.',
			}),
		],
		components: [
			new MessageActionRow().addComponents([
				new MessageButton()
					.setCustomId('showCurrentSettings')
					.setLabel('Info')
					.setStyle('PRIMARY')
					.setEmoji('<:question_mark:992767461843812423>'),
				new MessageButton()
					.setCustomId('openPrivacyMenu')
					.setLabel('Privacy')
					.setStyle('SECONDARY')
					.setEmoji('<:shield:992768390106189864>'),
			]),
		],
	});

	return interaction.editReply({ content: '<:done:827250778447937566>' });
};

export const name: string = 'menu';
export const description: string = 'Send the Menu in the current Channel';
export const options: Array<ApplicationCommandOptionData> = [];
