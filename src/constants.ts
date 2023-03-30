import type { Buffer } from 'node:buffer';
import type { TextChannel, StringSelectMenuInteraction, Guild } from 'discord.js';

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
	'uwu',
	'owo',
	'Goodbye',
	'Mondstadt',
	'Liyue',
	'Inazuma',
	'Sumeru',
	'DairyQueen',
	'Nobeans',
];

export const serverIcons = [
	'https://i.imgur.com/m6QuWcx.png',
	'https://i.imgur.com/TTJb3JP.png',
	'https://i.imgur.com/xGTlMjj.png',
	'https://i.imgur.com/4dCi1BM.png',
	'https://i.imgur.com/4A1ug6l.png',
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
	'https://i.imgur.com/vtuWrMh.png',
];

export const banWords = ['hello', 'welcome', 'help', 'what', 'starfish', 'are', 'todo', 'manga', 'mha', 'memes'];

export const mustContainWords = ['potato', 'quarantine', 'sano', 'alien', 'kaboom'];

export const randomEmoji = (guild: Guild) => guild.emojis.cache.random()!.toString();

export const memes = [
	'Never going give {{ role }} up, never gonna let you down',
	'My [F25] husband [M26] used all our savings and sold our house for primogems, how do I financially recover from this {{ role }}',
	'Oh my god is that a Genshin Impact reference {{ role }}???',
	'Genshin fact time {{ role }}! Did you know making exactly 33 Sausages will cost exactly 99 raw meat and take exactly 39600 seconds?',
	'Did you see the news about Megamind being added to Genshin {{ role }}?',
	'Hey {{ role }}! In three weeks the next Cars movie is going to debut featuring Paimon racing Lightning McQueen!',
	'{{ role }} Did you know Jyk has spent over $3000 on Genshin Impact?',
	`Me eating lunch: oke
Alarm blaring
Looks out window
Absolutel chaos`,
];

export const timeoutMemberMessages = [
	'{{ user }} has been timed out',
	'{{ user }} has been slain',
	'{{ user }} has been beaned',
	'{{ user }} was shot out of a catapult',
	'{{ user }} has been arrested for distribution of illegal beans',
	'{{ user }} lost in a game of hide & seek',
	'Call an ambulance {{ user }}, but not for me!',
];

export const genshinImpactNames = [
	'Albedo',
	'Alhaitham',
	'Ayato',
	'Ayaka',
	'Amber',
	'Arataki Itto',
	'Beidou',
	'Bennett',
	'Collei',
	'Cyno',
	'Diluc',
	'Diona',
	'Eula',
	'Faruzan',
	'Fischl',
	'Ganyu',
	'Gorou',
	'Hu Tao',
	'Jean',
	'Kazuha',
	'Kaeya',
	'Keqing',
	'Klee',
	'Kujou Sara',
	'Kuki Shinobu',
	'Mona',
	'Nahida',
	'Ningguang',
	'Noelle',
	'Qiqi',
	'Raiden Shogun',
	'Razor',
	'Kokomi',
	'Shenhe',
	'Sucrose',
	'Tartaglia/Childe',
	'Thoma',
	'Tighnari',
	'Lumine',
	'Venti',
	'Wanderer/Scaramouche',
	'Xiao',
	'Yae Miko',
	'Yelan',
	'Yoimiya',
	'Yun Jin',
	'Baizhu',
	'Dainsleif',
	'Kaveh',
	'Heizou',
];

export enum DecreeName {
	AllLowercase = 'ALL_LOWERCASE',
	AllUppercase = 'ALL_UPPERCASE',
	BanRandomLetter = 'BAN_RANDOM_LETTER',
	BanRandomWord = 'BAN_SPECIFIC_WORDS',
	GenshinImpactStansAssemble = 'GENSHIN_IMPACT_STANS_ASSEMBLE',
	MustContainEmoji = 'MUST_CONTAIN_EMOJI',
	MustContainWord = 'MUST_CONTAIN_WORD',
	PingRole = 'PING_ROLE',
	RandomBanner = 'RANDOM_BANNER',
	RandomIcon = 'RANDOM_ICON',
	RenameChannel = 'RENAME_CHANNEL',
	SlowmodeChannel = 'SLOWMODE_CHANNEL',
	TimeoutLastSpeak = 'TIMEOUT_LAST_SPEAK',
	TimeoutRandomUser = 'TIMEOUT_RANDOM_USER',
	ToggleImages = 'TOGGLE_IMAGES',
}

export enum DecreeRarity {
	Common = 'common',
	Epic = 'epic',
	Legendary = 'legendary',
	Rare = 'rare',
}

export type Decree = {
	description: string;
	execute(chatChannel: TextChannel, interaction: StringSelectMenuInteraction): Promise<any>;
	name: DecreeName;
	rarity: DecreeRarity;
};

export enum GameModifiableDataName {
	ChannelName = 'channelName',
	GuildBanner = 'guildBanner',
	GuildIcon = 'guildIcon',
}

export type GameModifiableDataRecord = {
	[GameModifiableDataName.ChannelName]: string;
	[GameModifiableDataName.GuildBanner]: Buffer;
	[GameModifiableDataName.GuildIcon]: Buffer;
};
