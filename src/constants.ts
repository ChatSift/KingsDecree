import type { Buffer } from 'node:buffer';
import type { TextChannel, StringSelectMenuInteraction, Guild } from 'discord.js';

export const channelNameChoices = [
	'Office',
	'Gateway',
	'Groundzero',
	'Kenough',
	'Barbiegirl',
	'Sublime',
	'LiveAction',
	'Testing',
	'Work',
	'School',
	'HelpImTrappedInTheChannelEditor',
	'HelpHelpHelpHelp',
	'TextToSpeech',
	'Unamed',
	'Goodbye',
];

export const serverIcons = [
	'https://i.ibb.co/LphHF15/person-jill-krajewski-kenough.png',
	'https://i.ibb.co/jvP52dp/test-5.png',
	'https://i.ibb.co/0Fs7JKv/AFObarbie-1.png',
	'https://i.ibb.co/0nHQjd5/KEn.png',
	'https://i.ibb.co/ncSztCV/moria.png',
	'https://i.ibb.co/xX289QN/9de345aef89c6da6d7e08c020982c505.jpg',
	'https://i.ibb.co/bJ341sf/toy-story-3-ken.png',
];

export const serverBanners = [
	'https://i.ibb.co/sthpRNH/16-1024x615.png',
	'https://i.ibb.co/kQXTzYn/barbiemovie4-e1686625112654.jpg',
	'https://i.ibb.co/GVhqS9Y/Barbie-Movie-Set-Rollerblading.png',
	'https://i.ibb.co/k25Bf4L/ca-times-brightspotcdn.jpg',
	'https://i.ibb.co/CK6P339/ezgif-1-152d0811f9.png',
	'https://i.ibb.co/qdr6zwP/ezgif-1-a26d15840d.png',
	'https://i.ibb.co/yP18DZN/Ken.gif',
];

export const banWords = ['hello', 'welcome', 'help', 'what', 'live', 'are', 'pink', 'manga', 'mha', 'memes'];

export const mustContainWords = ['potato', 'helping', 'sano', 'fiend', 'pop', 'bang', 'fish', 'deku', 'barbie', 'kenough', 'sublime'];

export const randomEmoji = (guild: Guild) => guild.emojis.cache.filter(em => !em.animated).random()!.toString();

export const memes = [
	'Never going give {{ role }} up, never gonna let you down',
	'My [M27] wife [F36] used all our savings and sold our house for the new Barbie figures, how do I financially recover from this {{ role }}',
	'Oh my god is that a Barbie reference {{ role }}???',
	'Mattel fact time {{ role }}! Did you know Mattel has 16 CEOs?',
	'Did you see the news about Ken being added to Fortnite {{ role }}? Sublime!',
	'Hey {{ role }}! In three weeks the next Cars movie is going to debut featuring Ken racing Lightning McQueen!',
	'{{ role }} Did you know Jyk has spent over $3000 on Barbie figures?',
	'{{ role }} Every night is girls' night.'
];

export const timeoutMemberMessages = [
	'{{ user }} has been timed out',
	'{{ user }} has been slain',
	'{{ user }} has been beaned',
	'{{ user }} was shot out of a catapult',
	'{{ user }} has been arrested for distribution of illegal beans',
	'{{ user }} lost in a game of uno',
	'Call an ambulance {{ user }}, but not for me!',
];

export const genshinImpactNames = [
	'Ken',
	'Weird Barbie',
	'Allan',
	'Proust Barbie',
	'Barbie',
	'President Barbie',
	'Sasha',
	'Physicist Barbie',
	'Writer Barbie',
	'Dan at the FBI',
	'Guy at the Beach #1',
	'Young Mattel Executive',
	'Mattel CEO',
	'Dr. Barbie',
	'Anxiety Mom',
	'Narrator',
	'Midge',
	'Mattel Executive #1',
	'Ruth Handler',
	'Skipper',
	'Mattel Executive #2',
	'Popular Girl #2',
	'Kenmaid',
	'Ken #3',
	'Ken #1',
	'Ken #4',
	'Ken #2',
	'Stereotypical Ken',
	'Ryan Gosling',
	'Margot Robbie',
];

export enum DecreeName {
	AllLowercase = 'ALL_LOWERCASE',
	AllUppercase = 'ALL_UPPERCASE',
	BanRandomLetter = 'BAN_RANDOM_LETTER',
	BanRandomWord = 'BAN_SPECIFIC_WORDS',
	GenshinImpactStansAssemble = 'GENSHIN_IMPACT_STANS_ASSEMBLE',
	MustContainEmoji = 'MUST_CONTAIN_EMOJI',
	MustContainWord = 'MUST_CONTAIN_WORD',
	MustPingUser = 'MUST_PING_USER',
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
