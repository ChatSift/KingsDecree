import 'dotenv/config';

import { env } from 'node:process';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import winston from 'winston';
import { interactionCreate } from './handlers/interactionCreate';
import { messageCreate } from './handlers/messageCreate';

for (const key of [
	'DISCORD_TOKEN',
	'PREFIX',
	'CHAT_CHANNEL',
	'DECREE_CHANNEL',
	'GUILD_ID',
	'STAFF_ROLE',
] as (keyof typeof env)[]) {
	if (!env[key]) {
		throw new Error(`Missing var ${key}`);
	}
}

export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
	],
});

export const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
	),
	transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'combined.log' })],
});

client.on('ready', () => {
	if (!client.guilds.cache.get(env.GUILD_ID)) {
		throw new Error('Not in the target guild.');
	}

	if (!client.channels.cache.get(env.CHAT_CHANNEL)) {
		throw new Error('Chat channel does not exist');
	}

	if (!client.channels.cache.get(env.DECREE_CHANNEL)) {
		throw new Error('Decree channel does not exist');
	}

	logger.info(`Logged in as ${client.user!.tag}`);
});

client.on(Events.InteractionCreate, interactionCreate);

client.on(Events.MessageCreate, messageCreate);

await client.login(env.DISCORD_TOKEN);
