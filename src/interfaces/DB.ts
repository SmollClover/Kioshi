export interface Settings {
	Guild: string;
	Moderators: Array<string>;
	LogChannelId: string;
	Category: string;
}

export interface Data {
	Guild: string;
	User: string;
	Channel: string;
	Private: boolean;
	AddedUsers: Array<string>;
	Title: string;
	Description: string;
	Limit: number;
}
