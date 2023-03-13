/* eslint-disable promise/prefer-await-to-then */
import { env } from 'node:process';
import { setTimeout } from 'node:timers';
import { Events, type GuildMember, type Message, type StringSelectMenuInteraction, type TextChannel } from 'discord.js';
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
} from './constants';
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
			return setTimeout(async () => chatChannel.setRateLimitPerUser(0).catch(() => {}), KingsDecree.rotationTime as number);
		},
	},
	{
		name: DecreeName.ToggleImages,
		description: 'Restrict images in the chat',
		rarity: DecreeRarity.Common,
		execute: async (chatChannel, interaction) => {
			try {
				await chatChannel.permissionOverwrites.create(env.EVENT_ROLE, {
					"AttachFiles": false,
					"EmbedLinks": false,
				});
			} catch (error) {
				await interaction.reply({
					ephemeral: true,
					content: `There was an error setting the permissions. Please forward this to staff: ${error}`,
				});
				return logger.error(
					`Could not set permission overwrite for chat channel. Role ${env.EVENT_ROLE}. ${error}`,
				);
			}

			logger.info('Restricted image send perms in chat channel.');
			await KingsDecree.getDecreeChannel().send(`The king has decreed, the chat shalln't be able to send images.`);
			return setTimeout(
				async () =>
					chatChannel.permissionOverwrites.create(env.EVENT_ROLE, {
						"AttachFiles": true,
						"EmbedLinks": true,
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

			await KingsDecree.getDecreeChannel().send(`The king has decreed that the channel name shall now be: \`${newChannelName}\``);
			logger.info(`Set the channel name to ${newChannelName}`);
			return setTimeout(async () => chatChannel.setName('town-square'), KingsDecree.rotationTime as number);
		},
	},
	{
		name: DecreeName.RandomBanner,
		description: 'Mess with server banner',
		rarity: DecreeRarity.Legendary,
		execute: async (chatChannel, interaction) => {
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
			await KingsDecree.getDecreeChannel().send({
					content: `The king has now decreed that the new server banner shall be: ${newBanner}`,
				})
				.catch(() => null);
			return setTimeout(
				async () =>
					chatChannel.guild
						.setBanner(
							'https://cdn.discordapp.com/banners/414234792121597953/a_a326cc40a40903be15d1b3f08d8e4c5c.webp?size=300',
						)
						.catch(() => null),
				KingsDecree.rotationTime as number,
			);
		},
	},
	{
		name: DecreeName.RandomIcon,
		description: 'Mess with the server icon',
		rarity: DecreeRarity.Legendary,
		execute: async (chatChannel, interaction) => {
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
			await KingsDecree.getDecreeChannel().send({
					content: `The king has now decreed that the new server icon shall be: ${newIcon}`,
				})
				.catch(() => null);
			return setTimeout(
				async () =>
					chatChannel.guild.setIcon(
						'https://cdn.discordapp.com/icons/414234792121597953/a_2a3520d5af0df04d7b3b766fa6f2f570.webp?size=128',
					),
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
			const bannedLetterMessageListener = (message: Message) => {
				if (message.author.bot || message.channel.id !== env.CHAT_CHANNEL) {
					return;
				}

				if (message.content.toLowerCase().includes(newBannedLetter)) {
					message.delete().catch(() => {});
					
				}
			};

			client.on(Events.MessageCreate, bannedLetterMessageListener);
			await KingsDecree.getDecreeChannel().send(`The king has decreed that the letter \`${newBannedLetter}\` is now banned.`);
			return setTimeout(() => {
				client.removeListener(Events.MessageCreate, bannedLetterMessageListener);
			}, KingsDecree.rotationTime as number);
		},
	},
	{
		name: DecreeName.BanSpecificWords,
		description: 'Ban a random word',
		rarity: DecreeRarity.Epic,
		execute: async (chatChannel, interaction) => {
			const newBannedWord = randomElement(banWords);
			const bannedWordMessageListener = (message: Message) => {
				if (message.author.bot || message.channel.id !== env.CHAT_CHANNEL) {
					return;
				}

				if (message.content.toLowerCase().includes(newBannedWord)) {
					message.delete().catch(() => {});
					
				}
			};

			client.on(Events.MessageCreate, bannedWordMessageListener);
			await KingsDecree.getDecreeChannel().send(`The king has decreed that the word \`${newBannedWord}\` is now banned.`);
			return setTimeout(() => {
				client.removeListener(Events.MessageCreate, bannedWordMessageListener);
			}, KingsDecree.rotationTime as number);
		},
	},
	{
		name: DecreeName.MustContainWord,
		description: 'All messages must contain a randomly decided word',
		rarity: DecreeRarity.Rare,
		execute: async (chatChannel, interaction) => {
			const newMustContainWord = randomElement(mustContainWords);
			const mustContainWordListener = (message: Message) => {
				if (message.author.bot || message.channel.id !== env.CHAT_CHANNEL) {
					return;
				}

				if (!message.content.toLowerCase().includes(newMustContainWord)) {
					message.delete().catch(() => {});
				}
			};

			client.on(Events.MessageCreate, mustContainWordListener);
			await KingsDecree.getDecreeChannel().send(
				`The king has decreed that the word \`${newMustContainWord}\` is required to be in every message.`,
			);
			return setTimeout(() => {
				client.removeListener(Events.MessageCreate, mustContainWordListener);
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
				return KingsDecree.getDecreeChannel().send('Oh no! The last person to speak has left before I could kick them, so sad!');
			}

			try {
				await targetMember.kick();
			} catch (error) {
				await interaction.reply({
					ephemeral: true,
					content: `Unable to kick last person to speak. Please forward this to staff ${error}`,
				});
				return logger.error(
					`There was an error kicking ${targetMember.user.id} (${targetMember.user.tag}). ${error}`,
				);
			}

			logger.info(`Successfully kicked ${targetMember.user.id} (${targetMember.user.tag})`);
			return KingsDecree.getDecreeChannel().send(`The king has decreed that ${targetMember} shall be **kicked**.`);
		},
	},
];
