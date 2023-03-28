/* eslint-disable promise/prefer-await-to-then */
import { env } from 'node:process';
import type { Message } from 'discord.js';

export const bannedLetterListener = (message: Message, newBannedLetter: string) => {
	if (message.author.bot || message.channel.id !== env.CHAT_CHANNEL) {
		return;
	}

	if (message.content.toLowerCase().includes(newBannedLetter)) {
		message.delete().catch(() => {});
	}
};

export const bannedWordListener = (message: Message, newBannedWord: string) => {
	if (message.author.bot || message.channel.id !== env.CHAT_CHANNEL) {
		return;
	}

	if (message.content.toLowerCase().includes(newBannedWord)) {
		message.delete().catch(() => {});
	}
};

export const mustContainWordListener = (message: Message, newMustContainWord: string) => {
	if (message.author.bot || message.channel.id !== env.CHAT_CHANNEL) {
		return;
	}

	if (!message.content.toLowerCase().includes(newMustContainWord)) {
		message.delete().catch(() => {});
	}
};

export const allLowercaseListener = (message: Message) => {
	if (message.author.bot) {
		return;
	}

	if (message.content.toLowerCase() !== message.content) {
		message.delete().catch(() => {});
	}
};

export const allUppercaseListener = (message: Message) => {
	if (message.author.bot) {
		return;
	}

	if (message.content.toUpperCase() !== message.content) {
		message.delete().catch(() => {});
	}
};

export const mustContainEmojiListener = (message: Message, newMustContainEmoji: string) => {
	if (message.author.bot || message.channel.id !== env.CHAT_CHANNEL) {
		return;
	}

	if (!message.content.includes(newMustContainEmoji)) {
		message.delete().catch(() => {});
	}
};
