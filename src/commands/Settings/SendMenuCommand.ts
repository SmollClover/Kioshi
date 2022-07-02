import { ApplicationCommandOptionData, CommandInteraction, GuildMember, MessageActionRow, MessageButton } from 'discord.js';
import { Emojis } from '../../common/Emojis';
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
					.setEmoji(Emojis.question_mark),
				new MessageButton()
					.setCustomId('openPrivacyMenu')
					.setLabel('Privacy')
					.setStyle('SECONDARY')
					.setEmoji(Emojis.shield),
			]),
		],
	});

	return interaction.editReply({ content: Emojis.done });
};

export const name: string = 'menu';
export const description: string = 'Send the Menu in the current Channel';
export const options: Array<ApplicationCommandOptionData> = [];
