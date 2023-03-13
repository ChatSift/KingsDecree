import type { TextChannel, StringSelectMenuInteraction } from "discord.js";

export const channelNameChoices = [
	'Beanroom',
	'Gateway',
	'Battlegrounds',
	'Kaboom',
	'Roleplay',
	'KFC',
	'Magdonal',
	'Testing',
	'GenshinImpact',
	'Minecraft',
	'School',
	'HelpImTrappedInTheChannelEditor',
	'Uwu',
	'Owo',
	'Goodbye',
];

export const serverIcons = [
	'https://i.imgur.com/cnXmGUG.png',
	'https://i.imgur.com/G4m7UcI.png',
	'https://i.imgur.com/j2snXBG.png',
	'https://i.imgur.com/eSnj5kh.png',
	'https://media.discordapp.net/attachments/882892373523324958/959242994815471616/FakePing.png',
];

export const serverBanners = [
	'https://i.imgur.com/S27t2oh.gif',
	'https://i.imgur.com/rbmEoAh.png',
	'https://i.imgur.com/ncBNK0C.png',
	'https://i.imgur.com/BwfYq6p.png',
	'https://i.imgur.com/aMnO8F1.png',
	'https://i.imgur.com/GtnMFr4.jpeg',
	'https://i.imgur.com/dOBCqqI.png',
	'https://i.imgur.com/x8pVO7L.jpeg',
	'https://i.imgur.com/YKc0aGR.png',
	'https://i.imgur.com/e8Qyb4Y.jpeg',
	'https://i.imgur.com/S1w0DUd.png',
	'https://i.imgur.com/zjDpo0K.jpeg',
	'https://i.imgur.com/BYxBci8.png',
];

export const banWords = ['hello', 'welcome', 'help', 'what', 'starfish', 'are', 'todo', 'manga', 'mha', 'memes'];

export const mustContainWords = ['potato', 'quarantine', 'sano', 'alien', 'kaboom'];

export const memes = [''];

export const timeoutMemberMessages = [
	'{{ user }} has been timed out',
	'{{ user }} has been slain',
	'{{ user }} has been beaned',
	'{{ user }} was shot out of a catapult',
	'{{ user }} has been arrested for distribution of illegal beans',
	'{{ user }} lost in a game of hide & seek',
	'Call an ambulance {{ user }}, but not for me!',
];

export enum DecreeName {
	BanRandomLetter = 'BAN_RANDOM_LETTER',
	BanSpecificWords = 'BAN_SPECIFIC_WORDS',
	KickLastSpeak = 'KICK_LAST_SPEAK',
	MustContainWord = 'MUST_CONTAIN_WORD',
	PingRole = 'PING_ROLE',
	RandomBanner = 'RANDOM_BANNER',
	RandomIcon = 'RANDOM_ICON',
	RenameChannel = 'RENAME_CHANNEL',
	SlowmodeChannel = 'SLOWMODE_CHANNEL',
	TimeoutLastSpeak = 'TIMEOUT_LAST_SPEAK',
	TimeoutRandomUser = 'TIMEOUT_RANDOM_USER',
	ToggleImages = 'TOGGLE_IMAGES'
}

export enum DecreeRarity {
	Common = 'common',
	Epic = 'epic',
	Legendary = 'legendary',
	Rare = 'rare'
}

export type Decree = {
	description: string;
	execute(
		chatChannel: TextChannel,
		interaction: StringSelectMenuInteraction): Promise<any>;
	name: DecreeName;
	rarity: DecreeRarity;
};
