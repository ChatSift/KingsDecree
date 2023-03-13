import { env } from "node:process";
import { setInterval, clearInterval } from "node:timers";
import type { Message } from "discord.js";
import { KingsDecree } from "../KingsDecree";

export const messageCreate = async (message: Message) => {
	if (message.author.bot || !message.guild || !message.member || !message.content.startsWith(env.PREFIX)) {
		return;
	}

	if (!message.member.roles.cache.has(env.STAFF_ROLE)) {
		return;
	}

	const [command, arg] = message.content.slice(env.PREFIX!.length).split(' ');
	switch (command) {
		case 'start_rotation': {
			if (!arg) {
				await message.reply('You must provide a rotation period in the form of minutes');
				return;
			}

			const time = Number.parseInt(arg, 10);
			await message.reply(
				`Alright boss. Will crown the next king now. Will rotate every ${time} minutes (${time * 1_000 * 60} ms)`,
			);
			await KingsDecree.runDecreer();
			// eslint-disable-next-line require-atomic-updates
			KingsDecree.interval = setInterval(async () => KingsDecree.runDecreer(), time * 1_000 * 60);
			// eslint-disable-next-line require-atomic-updates
			KingsDecree.rotationTime = time * 1_000 * 60;
			break;
		}

		case 'set_king': {
			if (!arg) {
				await message.reply('You must specify the new person you want to be king.');
				return;
			}

			const newKing =
				message.mentions.members?.first() ?? (await message.guild!.members.fetch(arg).catch(() => null));
			if (!newKing) {
				await message.reply('Could not find this new person you want to crown king.');
				return;
			}

      if (KingsDecree.interval) {
				clearInterval(KingsDecree.interval);
			}

			await KingsDecree.runDecreer(newKing);

			KingsDecree.rotationTime ??= 5 * 1_000 * 60;
			KingsDecree.interval = setInterval(async () => KingsDecree.runDecreer(), KingsDecree.rotationTime);
			break;
		}

		case 'change_time': {
			if (!arg) {
				await message.reply('You must provide a rotation period in the form of minutes');
				return;
			}

			const time = Number.parseInt(arg, 10);
			await message.reply(
				`Alright boss. Will choose next king in ${time} minutes (${time * 1_000 * 60} ms) and rotate on that interval`,
			);
			if (KingsDecree.interval) {
				clearInterval(KingsDecree.interval);
			}

			KingsDecree.interval = setInterval(async () => KingsDecree.runDecreer(), time * 1_000 * 60);
			KingsDecree.rotationTime = time * 1_000 * 60;
			break;
		}

		default:
			break;
	}
};
