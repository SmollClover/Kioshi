import { OverwriteResolvable, PermissionResolvable } from 'discord.js';

export const Defaults = {
	Settings: {
		Moderators: [],
		LogChannelId: '',
		Category: '',
	},
	Data: {
		Channel: '',
		Private: true,
		AddedUsers: [],
		Name: '',
		Limit: 0,
	},
	Permissions: {
		User: (id: string): OverwriteResolvable => {
			return {
				id,
				allow: ['VIEW_CHANNEL'],
			};
		},
		Default: (id: string, closed: boolean): OverwriteResolvable => {
			const allow: PermissionResolvable[] = [
				'ADD_REACTIONS',
				'STREAM',
				'SEND_MESSAGES',
				'EMBED_LINKS',
				'ATTACH_FILES',
				'READ_MESSAGE_HISTORY',
				'USE_EXTERNAL_EMOJIS',
				'CONNECT',
				'SPEAK',
				'USE_VAD',
				'USE_EXTERNAL_STICKERS',
				'START_EMBEDDED_ACTIVITIES',
			];

			const deny: PermissionResolvable[] = [
				'CREATE_INSTANT_INVITE',
				'MANAGE_CHANNELS',
				'PRIORITY_SPEAKER',
				'SEND_TTS_MESSAGES',
				'MANAGE_MESSAGES',
				'MENTION_EVERYONE',
				'MUTE_MEMBERS',
				'DEAFEN_MEMBERS',
				'MOVE_MEMBERS',
				'MANAGE_ROLES',
				'USE_APPLICATION_COMMANDS',
				'MANAGE_EVENTS',
			];

			closed ? deny.push('VIEW_CHANNEL') : allow.push('VIEW_CHANNEL');

			return {
				id,
				allow,
				deny,
			};
		},
		Moderators: (id: string): OverwriteResolvable => {
			return {
				id,
				allow: [
					'VIEW_CHANNEL',
					'MANAGE_MESSAGES',
					'MENTION_EVERYONE',
					'USE_APPLICATION_COMMANDS',
					'MOVE_MEMBERS',
					'MUTE_MEMBERS',
				],
			};
		},
	},
};
