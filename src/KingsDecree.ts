import { Buffer } from 'node:buffer';
import { env } from 'node:process';
import { setTimeout } from 'node:timers';
import { stripIndents } from 'common-tags';
import {
	ActionRowBuilder,
	Colors,
	StringSelectMenuBuilder,
	type GuildMember,
	type TextChannel,
	type Guild,
} from 'discord.js';
import type { GameModifiableDataRecord } from './constants';
import { DecreeRarity, type Decree } from './constants';
import { commonDecrees, epicDecrees, legendaryDecrees, randomElement, rareDecrees } from './util';
import { client, logger } from '.';

export class KingsDecree {
	public static king: GuildMember | null = null;

	public static decrees: Decree[] | null = null;

	public static interval: NodeJS.Timeout | null = null;

	public static rotationTime: number | null = null;

	public static originalData: GameModifiableDataRecord = {
		channelName: '',
		guildBanner: Buffer.alloc(0),
		guildIcon: Buffer.alloc(0),
	};

	public static async runDecreer(newKing: GuildMember | null = null) {
		if (newKing === null) {
			logger.info('Grabbing last 50 messages in chat channel');
			const messages = await KingsDecree.getChatChannel().messages.fetch({ limit: 50 });
			if (!messages.size) {
				return logger.info('No messages in the channel, nani??');
			}

			const users = Array.from(new Set(messages.filter((x) => !x.author.bot).map((x) => x.author.id)));

			while (newKing === null || newKing?.id === KingsDecree.king?.id) {
				// eslint-disable-next-line no-param-reassign
				newKing = await KingsDecree.getGuild()
					.members.fetch(randomElement(users))
					.catch(() => null);
				if (newKing) {
					logger.info(`New king is now ${newKing.user.tag} (${newKing.user.id})`);
				} else {
					logger.info(`King could not be fetched, retrying...`);
				}
			}
		}

		// eslint-disable-next-line require-atomic-updates
		KingsDecree.king = newKing;
		const newDecrees: Set<Decree> = new Set();
		for (let decree = 0; newDecrees.size < 3; decree++) {
			const randomNum = Math.ceil(Math.random() * 100);
			if (randomNum >= 1 && randomNum <= 69) {
				newDecrees.add(randomElement(commonDecrees));
			} else if (randomNum >= 70 && randomNum <= 84) {
				newDecrees.add(randomElement(rareDecrees));
			} else if (randomNum >= 85 && randomNum <= 94) {
				newDecrees.add(randomElement(epicDecrees));
			} else if (randomNum >= 95 && randomNum <= 100) {
				newDecrees.add(randomElement(legendaryDecrees));
			}
		}

		if (!Array.from(newDecrees).some((x) => x.rarity === DecreeRarity.Common)) {
			newDecrees.delete(Array.from(newDecrees)[2] as Decree);
			newDecrees.add(randomElement(commonDecrees));
		}

		// eslint-disable-next-line require-atomic-updates
		KingsDecree.decrees = Array.from(newDecrees);

		const msg = await KingsDecree.getDecreeChannel().send({
			content: `${newKing.toString()}, pick your decrees before time runs out!`,
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId(`decree-selector`)
						.setPlaceholder('Select Your Decree (only 1)')
						.addOptions(
							KingsDecree.decrees.map((decree) => ({
								label: decree.description,
								value: `decree-select:${decree.name}`,
							})),
						),
				),
			],
			embeds: [
				{
					title: 'A new king has been crowned!',
					description: stripIndents`
                  ${newKing} is now the new king.
                  Here are your decree choices:
  
                  ${KingsDecree.decrees.map((x) => `**[${x.rarity}]** \`${x.description}\``).join('\n')}
                  `,
					color: Colors.Gold,
				},
			],
		});

		return setTimeout(async () => {
			try {
				await msg.edit({
					components: [
						new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
							new StringSelectMenuBuilder()
								.setCustomId(`decree-selector`)
								.setPlaceholder('Select Your Decree (only 1)')
								.addOptions([{ label: 'Ran out of time!', value: `NONE` }])
								.setDisabled(true),
						),
					],
				});
			} catch (error) {
				logger.error("couldn't edit message for ran out timer", error);
			}
		}, KingsDecree.rotationTime!);
	}

	public static getGuild() {
		return client.guilds.cache.get(env.GUILD_ID) as Guild;
	}

	public static getChatChannel() {
		return client.channels.cache.get(env.CHAT_CHANNEL) as TextChannel;
	}

	public static getDecreeChannel() {
		return client.channels.cache.get(env.DECREE_CHANNEL) as TextChannel;
	}
}
