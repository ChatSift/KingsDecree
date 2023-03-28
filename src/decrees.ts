/* eslint-disable promise/prefer-await-to-then */
import { Buffer } from 'node:buffer';
import { env } from 'node:process';
import { setTimeout } from 'node:timers';
import { Events, type GuildMember, type Message } from 'discord.js';
import { request } from 'undici';
import { KingsDecree } from './KingsDecree';
import {
	channelNameChoices,
	memes,
	timeoutMemberMessages,
	serverIcons,
	serverBanners,
	banWords,
	mustContainWords,
	DecreeName,
	type Decree,
	DecreeRarity,
	randomEmoji,
	GameModifiableDataName,
} from './constants';
import {
	allLowercaseListener,
	allUppercaseListener,
	bannedLetterListener,
	bannedWordListener,
	mustContainEmojiListener,
	mustContainWordListener,
} from './decree-listeners';
import { randomElement } from './util';
import { logger, client } from '.';

const alphabet = 'abcdefghijklmnopqrstuvwxyz';

export const decrees: Decree[] = [
	{
		name: DecreeName.SlowmodeChannel,
		description: 'Turn on a slowmode of a random amount of seconds on the chat',
		rarity: DecreeRarity.Rare,
		execute: async (chatChannel, interaction) => {
			const newSlowmode = Math.floor(Math.random() * (120 - 10 + 1) + 10);
			try {
				await chatChannel.setRateLimitPerUser(newSlowmode);
			} catch (error) {
				await interaction.reply({
					ephemeral: true,
					content: `There was an error setting the slowmode. Please forward this to staff: ${error}`,
				});
				return logger.error(`There was an issue setting the slowmode to ${newSlowmode} for chat channel! ${error}`);
			}

			logger.info(`Set slowmode to ${newSlowmode}`);
			await KingsDecree.getDecreeChannel().send(
				`The king has decreed, the chat shall now have a slowmode of ${newSlowmode} seconds.`,
			);
			return setTimeout(
				async () => chatChannel.setRateLimitPerUser(0).catch(() => {}),
				KingsDecree.rotationTime as number,
			);
		},
	},
	{
		name: DecreeName.ToggleImages,
		description: 'Restrict images in the chat',
		rarity: DecreeRarity.Common,
		execute: async (chatChannel, interaction) => {
			try {
				await chatChannel.permissionOverwrites.create(env.EVENT_ROLE, {
					AttachFiles: false,
					EmbedLinks: false,
				});
			} catch (error) {
				await interaction.reply({
					ephemeral: true,
					content: `There was an error setting the permissions. Please forward this to staff: ${error}`,
				});
				return logger.error(`Could not set permission overwrite for chat channel. Role ${env.EVENT_ROLE}. ${error}`);
			}

			logger.info('Restricted image send perms in chat channel.');
			await KingsDecree.getDecreeChannel().send(`The king has decreed, the chat shalln't be able to send images.`);
			return setTimeout(
				async () =>
					chatChannel.permissionOverwrites.create(env.EVENT_ROLE, {
						AttachFiles: true,
						EmbedLinks: true,
					}),
				KingsDecree.rotationTime as number,
			);
		},
	},
	{
		name: DecreeName.RenameChannel,
		description: 'Rename the channel from a list of pre-chosen names',
		rarity: DecreeRarity.Epic,
		execute: async (chatChannel, interaction) => {
			if (KingsDecree.originalData[GameModifiableDataName.ChannelName] === '') {
				KingsDecree.originalData[GameModifiableDataName.ChannelName] = chatChannel.name;
			}

			const newChannelName = randomElement(channelNameChoices);
			try {
				await chatChannel.setName(newChannelName);
			} catch (error) {
				await interaction.reply({
					ephemeral: true,
					content: `There was an error setting the channel name. Please forward this to staff: ${error}`,
				});
				return logger.error(`Could not set name to ${newChannelName}. ${error}`);
			}

			await KingsDecree.getDecreeChannel().send(
				`The king has decreed that the channel name shall now be: \`${newChannelName}\``,
			);
			logger.info(`Set the channel name to ${newChannelName}`);
			return setTimeout(
				async () => chatChannel.setName(KingsDecree.originalData[GameModifiableDataName.ChannelName]),
				KingsDecree.rotationTime as number,
			);
		},
	},
	{
		name: DecreeName.RandomBanner,
		description: 'Mess with server banner',
		rarity: DecreeRarity.Legendary,
		execute: async (chatChannel, interaction) => {
			if (KingsDecree.originalData[GameModifiableDataName.GuildBanner].byteLength === 0) {
				const originalBanner = chatChannel.guild.bannerURL({ size: 4_096, extension: 'png' });
				if (originalBanner) {
					const originalBannerBuffer = await request(originalBanner).then(async (res) => res.body.arrayBuffer());
					// eslint-disable-next-line require-atomic-updates
					KingsDecree.originalData[GameModifiableDataName.GuildBanner] = Buffer.from(originalBannerBuffer);
				}
			}

			const newBanner = randomElement(serverBanners);
			try {
				await chatChannel.guild.setBanner(newBanner);
			} catch (error) {
				await interaction.reply({
					ephemeral: true,
					content: `Error setting guild banner to ${newBanner}. Please forward this to staff: \`${error}\``,
				});
				return logger.error(`There was an error setting the guild banner to ${newBanner}. ${error}`);
			}

			logger.info(`Setting guild banner to ${newBanner}`);
			await KingsDecree.getDecreeChannel()
				.send({
					content: `The king has now decreed that the new server banner shall be: ${newBanner}`,
				})
				.catch(() => null);
			return setTimeout(
				async () =>
					chatChannel.guild.setBanner(KingsDecree.originalData[GameModifiableDataName.GuildBanner]).catch(() => null),
				KingsDecree.rotationTime as number,
			);
		},
	},
	{
		name: DecreeName.RandomIcon,
		description: 'Mess with the server icon',
		rarity: DecreeRarity.Legendary,
		execute: async (chatChannel, interaction) => {
			if (KingsDecree.originalData[GameModifiableDataName.GuildIcon].byteLength === 0) {
				const originalIcon = chatChannel.guild.iconURL({ size: 4_096, extension: 'png' });
				if (originalIcon) {
					const originalIconBuffer = await request(originalIcon).then(async (res) => res.body.arrayBuffer());
					// eslint-disable-next-line require-atomic-updates
					KingsDecree.originalData[GameModifiableDataName.GuildIcon] = Buffer.from(originalIconBuffer);
				}
			}

			const newIcon = randomElement(serverIcons);
			try {
				await chatChannel.guild.setIcon(newIcon);
			} catch (error) {
				await interaction.reply({
					ephemeral: true,
					content: `Error setting guild icon to ${newIcon}. Please forward this to staff: \`${error}\``,
				});
				return logger.error(`There was an error setting the guild icon to ${newIcon}. ${error}`);
			}

			logger.info(`Setting guild banner to ${newIcon}`);
			await KingsDecree.getDecreeChannel()
				.send({
					content: `The king has now decreed that the new server icon shall be: ${newIcon}`,
				})
				.catch(() => null);
			return setTimeout(
				async () => chatChannel.guild.setIcon(KingsDecree.originalData[GameModifiableDataName.GuildIcon]),
				KingsDecree.rotationTime as number,
			);
		},
	},
	{
		name: DecreeName.BanRandomLetter,
		description: 'Ban a random letter',
		rarity: DecreeRarity.Legendary,
		execute: async (chatChannel, interaction) => {
			const newBannedLetter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));

			client.on(Events.MessageCreate, (message) => bannedLetterListener(message, newBannedLetter));
			await KingsDecree.getDecreeChannel().send(
				`The king has decreed that the letter \`${newBannedLetter}\` is now banned.`,
			);
			return setTimeout(() => {
				client.removeListener(Events.MessageCreate, bannedLetterListener);
			}, KingsDecree.rotationTime as number);
		},
	},
	{
		name: DecreeName.BanRandomWord,
		description: 'Ban a random word',
		rarity: DecreeRarity.Epic,
		execute: async (chatChannel, interaction) => {
			const newBannedWord = randomElement(banWords);

			client.on(Events.MessageCreate, (message: Message) => bannedWordListener(message, newBannedWord));
			await KingsDecree.getDecreeChannel().send(
				`The king has decreed that the word \`${newBannedWord}\` is now banned.`,
			);
			return setTimeout(() => {
				client.removeListener(Events.MessageCreate, bannedWordListener);
			}, KingsDecree.rotationTime as number);
		},
	},
	{
		name: DecreeName.MustContainWord,
		description: 'All messages must contain a randomly decided word',
		rarity: DecreeRarity.Rare,
		execute: async (chatChannel, interaction) => {
			const newMustContainWord = randomElement(mustContainWords);

			client.on(Events.MessageCreate, (message: Message) => mustContainWordListener(message, newMustContainWord));
			await KingsDecree.getDecreeChannel().send(
				`The king has decreed that the word \`${newMustContainWord}\` is required to be in every message.`,
			);
			return setTimeout(() => {
				client.removeListener(Events.MessageCreate, mustContainWordListener);
			}, KingsDecree.rotationTime as number);
		},
	},
	{
		name: DecreeName.MustContainEmoji,
		description: 'All messages must contain a randomly decided emoji',
		rarity: DecreeRarity.Rare,
		execute: async (chatChannel, interaction) => {
			const newMustContainEmoji = randomEmoji(interaction.guild!);

			client.on(Events.MessageCreate, (message: Message) => mustContainEmojiListener(message, newMustContainEmoji));
			await KingsDecree.getDecreeChannel().send(
				`The king has decreed that the emoji \`${newMustContainEmoji}\` is required to be in every message.`,
			);
			return setTimeout(() => {
				client.removeListener(Events.MessageCreate, mustContainEmojiListener);
			}, KingsDecree.rotationTime as number);
		},
	},
	{
		name: DecreeName.PingRole,
		description: 'Ping the @April Fools role, we do a little trolling',
		rarity: DecreeRarity.Legendary,
		execute: async (chatChannel, interaction) => {
			const randomMeme = randomElement(memes);
			await chatChannel.send({
				content: `<@&${env.EVENT_ROLE}> DING DONG ${randomMeme}`,
			});
			return KingsDecree.getDecreeChannel().send(`The king has decreed that you shall all now be pinged.`);
		},
	},
	{
		name: DecreeName.TimeoutRandomUser,
		description: 'Timeout a random user',
		rarity: DecreeRarity.Epic,
		execute: async (chatChannel, interaction) => {
			const messages = await chatChannel.messages.fetch({ limit: 50 });
			const users = Array.from(new Set(messages.map((x) => x.author.id)));
			let targetMember: GuildMember | null = null;
			while (targetMember === null) {
				targetMember = await chatChannel.guild!.members.fetch(randomElement(users)).catch(() => null);
				if (targetMember) {
					logger.info(`timeout random user target is now ${targetMember.user.tag} (${targetMember.user.id})`);
				} else {
					logger.info(`Timeout random user target could not be fetched, retrying...`);
				}
			}

			try {
				await targetMember.timeout(2 * 60 * 1_000);
			} catch (error) {
				await interaction.reply({
					ephemeral: true,
					content: `There was an error timing out the member. Please forward this to staff ${error}`,
				});
				return logger.error(
					`There was an error timing out ${targetMember.user.id} (${targetMember.user.tag}). ${error}`,
				);
			}

			logger.info(`Timed out member ${targetMember.user.tag} (${targetMember.user.id})`);
			await chatChannel.send(randomElement(timeoutMemberMessages).replace('{{ user }}', targetMember.toString()));
			return KingsDecree.getDecreeChannel().send(`The king has decreed that ${targetMember}.`);
		},
	},
	{
		name: DecreeName.TimeoutLastSpeak,
		description: 'Timeout the last person to speak in the chat',
		rarity: DecreeRarity.Epic,
		execute: async (chatChannel, interaction) => {
			const messages = await chatChannel.messages.fetch({ limit: 50 });
			const targetMember = await chatChannel.guild!.members.fetch(messages.first()!.author.id).catch(() => null);
			if (!targetMember) {
				return KingsDecree.getDecreeChannel().send({
					content: 'Oh no, the person has left the server before I could time them out! So sad...',
				});
			}

			try {
				await targetMember.timeout(2 * 60 * 1_000);
			} catch (error) {
				await interaction.reply({
					ephemeral: true,
					content: `There was an error timing out the last speaking member. Please forward this to staff ${error}`,
				});
				return logger.error(
					`There was an error timing out last speaking member ${targetMember.user.id} (${targetMember.user.tag}). ${error}`,
				);
			}

			logger.info(`Successfully timed out ${targetMember.id}`);
			await chatChannel.send(randomElement(timeoutMemberMessages).replace('{{ user }}', targetMember.toString()));
			return KingsDecree.getDecreeChannel().send(`The king has decreed that ${targetMember} shall be timed out.`);
		},
	},
	{
		name: DecreeName.KickLastSpeak,
		description: 'Kick the last person to speak',
		rarity: DecreeRarity.Epic,
		execute: async (chatChannel, interaction) => {
			const messages = await chatChannel.messages.fetch({ limit: 50 });
			const users = Array.from(new Set(messages.map((x) => x.author.id)));
			const targetMember = await chatChannel.guild!.members.fetch(randomElement(users)).catch(() => null);
			if (!targetMember) {
				return KingsDecree.getDecreeChannel().send(
					'Oh no! The last person to speak has left before I could kick them, so sad!',
				);
			}

			try {
				await targetMember.kick();
			} catch (error) {
				await interaction.reply({
					ephemeral: true,
					content: `Unable to kick last person to speak. Please forward this to staff ${error}`,
				});
				return logger.error(`There was an error kicking ${targetMember.user.id} (${targetMember.user.tag}). ${error}`);
			}

			logger.info(`Successfully kicked ${targetMember.user.id} (${targetMember.user.tag})`);
			return KingsDecree.getDecreeChannel().send(`The king has decreed that ${targetMember} shall be **kicked**.`);
		},
	},
	{
		name: DecreeName.AllLowercase,
		description: 'All messages must be in lowercase',
		rarity: DecreeRarity.Rare,
		execute: async (chatChannel, interaction) => {
			client.on(Events.MessageCreate, allLowercaseListener);
			await KingsDecree.getDecreeChannel().send('The king has decreed that all messages must be in lowercase.');
			return setTimeout(() => {
				client.removeListener(Events.MessageCreate, allLowercaseListener);
			}, KingsDecree.rotationTime as number);
		},
	},
	{
		name: DecreeName.AllUppercase,
		description: 'All messages must be in uppercase',
		rarity: DecreeRarity.Rare,
		execute: async (chatChannel, interaction) => {
			client.on(Events.MessageCreate, allUppercaseListener);
			await KingsDecree.getDecreeChannel().send('The king has decreed that all messages must be in uppercase.');
			return setTimeout(() => {
				client.removeListener(Events.MessageCreate, allUppercaseListener);
			}, KingsDecree.rotationTime as number);
		},
	},
];
