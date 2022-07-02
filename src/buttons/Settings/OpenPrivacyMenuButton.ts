import { ButtonInteraction, CategoryChannel, MessageActionRow, MessageButton } from 'discord.js';

import { Defaults } from '../../common/Defaults';
import { Data, Settings } from '../../interfaces/DB';
import { Emojis } from '../../common/Emojis';
import { RunFunction } from '../../interfaces/Button';

export const run: RunFunction = async (client, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	const DataSchema = await client.db.load('data');
	let Data = (await DataSchema.findOne({ Guild: interaction.guildId, User: interaction.user.id })) as Data;

	if (!Data) Data = await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, Defaults.Data);

	let createChannel = false;
	if (!Data.Channel) createChannel = true;
	if (!createChannel) {
		if (!interaction.guild.channels.cache.get(Data.Channel)) {
			try {
				(await interaction.guild.channels.fetch(Data.Channel, { force: true })).id;
			} catch {
				createChannel = true;
			}
		}
	}

	if (createChannel) {
		const SettingsSchema = await client.db.load('settings');
		const Settings = (await SettingsSchema.findOne({ Guild: interaction.guildId })) as Settings;

		if (Settings.Category) {
			const Category = (await interaction.guild.channels.fetch(Settings.Category, { force: true })) as CategoryChannel;
			if (Category) {
				const permissionOverwrites = [
					Defaults.Permissions.Default(interaction.guild.roles.everyone.id, Data.Private),
					Defaults.Permissions.User(Data.User),
				];
				Settings.Moderators.map((moderator) => permissionOverwrites.push(Defaults.Permissions.Moderators(moderator)));

				const Channel = await Category.createChannel(interaction.user.username, {
					type: 'GUILD_VOICE',
					reason: 'Server Booster Perks | Created Missing Channel',
					permissionOverwrites,
				});

				await DataSchema.update({ Guild: interaction.guildId, User: interaction.user.id }, { Channel: Channel.id });
			}
		}
	}

	const components = [
		new MessageActionRow().addComponents([
			new MessageButton()
				.setCustomId('makeChannelPublic')
				.setLabel('Make Public')
				.setEmoji(Emojis.key_off)
				.setStyle('SUCCESS')
				.setDisabled(!Data.Private),
			new MessageButton()
				.setCustomId('makeChannelPrivate')
				.setLabel('Make Private')
				.setEmoji(Emojis.key)
				.setStyle('DANGER')
				.setDisabled(Data.Private),
		]),
		new MessageActionRow().addComponents([
			new MessageButton()
				.setCustomId('addUserToChannel')
				.setLabel('Add User to Channel')
				.setEmoji(Emojis.user)
				.setStyle('SECONDARY')
				.setDisabled(!Data.Private),
			new MessageButton()
				.setCustomId('removeUserFromChannel')
				.setLabel('Remove User from Channel')
				.setEmoji(Emojis.user_off)
				.setStyle('SECONDARY')
				.setDisabled(!Data.Private),
			new MessageButton()
				.setCustomId('clearUsersFromChannel')
				.setLabel('Remove Everyone from Channel')
				.setEmoji(Emojis.group_remove)
				.setStyle('SECONDARY')
				.setDisabled(!Data.Private),
		]),
	];

	const embeds = [client.embed({ title: `Status: ${Data.Private ? 'Private' : 'Public'}` })];

	if (Data.Private)
		embeds[0].addField(
			`Added Users [${Data.AddedUsers.length}]`,
			Data.AddedUsers.length > 0
				? Data.AddedUsers.map((user) => {
						return `<@!${user}>`;
				  }).join(' ')
				: 'None'
		);

	return interaction.editReply({ embeds, components });
};

export const customId: string = 'openPrivacyMenu';
