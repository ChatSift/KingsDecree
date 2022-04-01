import { Client, GuildMember, Message, MessageAttachment, SelectMenuInteraction, TextChannel } from "discord.js";
import { randomElement } from "./util";
import { channelNameChoices, memes, timeoutMemberMessages, serverIcons, serverBanners, banWords, mustContainWords } from "./config.json";
import winston, { loggers } from "winston";
const alphabet = "abcdefghijklmnopqrstuvwxyz";

export const decrees: {
    name: string;
    description: string;
    type: "common" | "rare" | "epic" | "legendary";
    execute: (
        chatChannel: TextChannel,
        interaction: SelectMenuInteraction,
        ctx: {
            client: Client;
            currentKing: GuildMember;
            currentDecrees: Decree[];
            currentInterval: NodeJS.Timeout;
            currentRotationTime: number;
            logger: winston.Logger;
        }
    ) => Promise<any>;
}[] = [
    {
        name: "SLOWMODE_CHANNEL",
        description: "Turn on a slowmode of a random amount of seconds on the chat",
        type: "rare",
        execute: async (chatChannel, interaction, ctx) => {
            const newSlowmode = Math.floor(Math.random() * (120 - 10 + 1) + 10);
            try {
                await chatChannel.setRateLimitPerUser(newSlowmode);
            } catch (e) {
                interaction.reply({ ephemeral: true, content: `There was an error setting the slowmode. Please forward this to staff: ${e}` });
                return ctx.logger.error(`There was an issue setting the slowmode to ${newSlowmode} for chat channel! ${e}`);
            }
            ctx.logger.info(`Set slowmode to ${newSlowmode}`);
            await interaction.channel?.send(`The king has decreed, the chat shall now have a slowmode of ${newSlowmode} seconds.`);
            return setTimeout(() => chatChannel.setRateLimitPerUser(0).catch(() => {}), ctx.currentRotationTime);
        },
    },
    {
        name: "TOGGLE_IMAGES",
        description: "Restrict images in the chat",
        type: "common",
        execute: async (chatChannel, interaction, ctx) => {
            try {
                await chatChannel.permissionOverwrites.create(process.env.EVENT_ROLE, {
                    ATTACH_FILES: false,
                    EMBED_LINKS: false,
                });
            } catch (e) {
                interaction.reply({ ephemeral: true, content: `There was an error setting the permissions. Please forward this to staff: ${e}` });
                return ctx.logger.error(`Could not set permission overwrite for chat channel. Role ${process.env.EVENT_ROLE}. ${e}`);
            }
            ctx.logger.info("Restricted image send perms in chat channel.");
            await interaction.channel?.send(`The king has decreed, the chat shalln't be able to send images.`);
            return setTimeout(
                () =>
                    chatChannel.permissionOverwrites.create(process.env.EVENT_ROLE, {
                        ATTACH_FILES: true,
                        EMBED_LINKS: true,
                    }),
                ctx.currentRotationTime
            );
        },
    },
    {
        name: "RENAME_CHANNEL",
        description: "Rename the channel from a list of pre-chosen names",
        type: "epic",
        execute: async (chatChannel, interaction, ctx) => {
            const newChannelName = randomElement(channelNameChoices);
            try {
                await chatChannel.setName(newChannelName);
            } catch (e) {
                interaction.reply({ ephemeral: true, content: `There was an error setting the channel name. Please forward this to staff: ${e}` });
                return ctx.logger.error(`Could not set name to ${newChannelName}. ${e}`);
            }
            await interaction.channel?.send(`The king has decreed that the channel name shall now be: \`${newChannelName}\``);
            ctx.logger.info(`Set the channel name to ${newChannelName}`);
            return setTimeout(() => chatChannel.setName("town-square"), ctx.currentRotationTime);
        },
    },
    {
        name: "RANDOM_BANNER",
        description: "Mess with server banner",
        type: "legendary",
        execute: async (chatChannel, interaction, ctx) => {
            const newBanner = randomElement(serverBanners);
            try {
                await chatChannel.guild.setBanner(newBanner);
            } catch (e) {
                interaction.reply({ ephemeral: true, content: `Error setting guild banner to ${newBanner}. Please forward this to staff: \`${e}\`` });
                return ctx.logger.error(`There was an error setting the guild banner to ${newBanner}. ${e}`);
            }
            ctx.logger.info(`Setting guild banner to ${newBanner}`);
            await interaction.channel
                ?.send({
                    content: `The king has now decreed that the new server banner shall be: ${newBanner}`,
                })
                .catch(() => null);
            return setTimeout(
                () =>
                    chatChannel.guild
                        .setBanner("https://cdn.discordapp.com/banners/414234792121597953/a_a326cc40a40903be15d1b3f08d8e4c5c.webp?size=300")
                        .catch(() => null),
                ctx.currentRotationTime
            );
        },
    },
    {
        name: "RANDOM_ICON",
        description: "Mess with the server icon",
        type: "legendary",
        execute: async (chatChannel, interaction, ctx) => {
            const newIcon = randomElement(serverIcons);
            try {
                await chatChannel.guild.setIcon(newIcon);
            } catch (e) {
                interaction.reply({ ephemeral: true, content: `Error setting guild icon to ${newIcon}. Please forward this to staff: \`${e}\`` });
                return ctx.logger.error(`There was an error setting the guild icon to ${newIcon}. ${e}`);
            }
            ctx.logger.info(`Setting guild banner to ${newIcon}`);
            await interaction.channel
                ?.send({
                    content: `The king has now decreed that the new server icon shall be: ${newIcon}`,
                })
                .catch(() => null);
            return setTimeout(
                () =>
                    chatChannel.guild.setIcon("https://cdn.discordapp.com/icons/414234792121597953/a_2a3520d5af0df04d7b3b766fa6f2f570.webp?size=128"),
                ctx.currentRotationTime
            );
        },
    },
    {
        name: "BAN_RANDOM_LETTER",
        description: "Ban a random letter",
        type: "legendary",
        execute: async (chatChannel, interaction, ctx) => {
            const newBannedLetter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            const bannedLetterMessageListener = (message: Message) => {
                if (message.author.bot || message.channel.id !== process.env.CHAT_CHANNEL) return;
                if (message.content.toLowerCase().includes(newBannedLetter)) {
                    message.delete().catch(() => {});
                    return void 0;
                }
            };

            ctx.client.on("messageCreate", bannedLetterMessageListener);
            await interaction.channel?.send(`The king has decreed that the letter \`${newBannedLetter}\` is now banned.`);
            return setTimeout(() => {
                ctx.client.removeListener("messageCreate", bannedLetterMessageListener);
            }, ctx.currentRotationTime);
        },
    },
    {
        name: "BAN_SPECIFIC_WORDS",
        description: "Ban a random word",
        type: "epic",
        execute: async (chatChannel, interaction, ctx) => {
            const newBannedWord = randomElement(banWords);
            const bannedWordMessageListener = (message: Message) => {
                if (message.author.bot || message.channel.id !== process.env.CHAT_CHANNEL) return;
                if (message.content.toLowerCase().includes(newBannedWord)) {
                    message.delete().catch(() => {});
                    return void 0;
                }
            };

            ctx.client.on("messageCreate", bannedWordMessageListener);
            await interaction.channel?.send(`The king has decreed that the word \`${newBannedWord}\` is now banned.`);
            return setTimeout(() => {
                ctx.client.removeListener("messageCreate", bannedWordMessageListener);
            }, ctx.currentRotationTime);
        },
    },
    {
        name: "MUST_CONTAIN_WORD",
        description: "All messages must contain a randomly decided word",
        type: "rare",
        execute: async (chatChannel, interaction, ctx) => {
            const newMustContainWord = randomElement(mustContainWords);
            const mustContainWordListener = (message: Message) => {
                if (message.author.bot || message.channel.id !== process.env.CHAT_CHANNEL) return;
                if (!message.content.toLowerCase().includes(newMustContainWord)) {
                    message.delete().catch(() => {});
                    return void 0;
                }
            };

            ctx.client.on("messageCreate", mustContainWordListener);
            await interaction.channel?.send(`The king has decreed that the word \`${newMustContainWord}\` is required to be in every message.`);
            return setTimeout(() => {
                ctx.client.removeListener("messageCreate", mustContainWordListener);
            }, ctx.currentRotationTime);
        },
    },
    {
        name: "PING_ROLE",
        description: "Ping the @April Fools role, we do a little trolling",
        type: "legendary",
        execute: async (chatChannel, interaction, ctx) => {
            const randomMeme = randomElement(memes);
            await chatChannel.send({
                content: `<@&${process.env.EVENT_ROLE}> DING DONG ${randomMeme}`
            });
            return interaction.channel?.send(`The king has decreed that you shall all now be pinged.`);
        },
    },
    {
        name: "TIMEOUT_RANDOM_USER",
        description: "Timeout a random user",
        type: "epic",
        execute: async (chatChannel, interaction, ctx) => {
            const messages = await chatChannel.messages.fetch({ limit: 50 });
            const users = Array.from(new Set(messages.map((x) => x.author.id)));
            let targetMember: GuildMember | null = null;
            while (targetMember === null) {
                targetMember = await chatChannel.guild!.members.fetch(randomElement(users)).catch(() => null);
                if (!targetMember) ctx.logger.info(`Timeout random user target could not be fetched, retrying...`);
                else ctx.logger.info(`timeout random user target is now ${targetMember.user.tag} (${targetMember.user.id})`);
            }

            try {
                await targetMember.timeout(2 * 60 * 1000);
            } catch (e) {
                interaction.reply({ ephemeral: true, content: `There was an error timing out the member. Please forward this to staff ${e}` });
                return ctx.logger.error(`There was an error timing out ${targetMember.user.id} (${targetMember.user.tag}). ${e}`);
            }
            ctx.logger.info(`Timed out member ${targetMember.user.tag} (${targetMember.user.id})`);
            await chatChannel.send(randomElement(timeoutMemberMessages).replace("{{ user }}", targetMember.toString()));
            return interaction.channel?.send(`The king has decreed that ${targetMember}.`);
        },
    },
    {
        name: "TIMEOUT_LAST_SPEAK",
        description: "Timeout the last person to speak in the chat",
        type: "epic",
        execute: async (chatChannel, interaction, ctx) => {
            const messages = await chatChannel.messages.fetch({ limit: 50 });
            const targetMember = await chatChannel.guild!.members.fetch(messages.first()!.author.id).catch(() => null);
            if (!targetMember)
                return interaction.channel?.send({ content: "Oh no, the person has left the server before I could time them out! So sad..." });

            try {
                await targetMember.timeout(2 * 60 * 1000);
            } catch (e) {
                interaction.reply({
                    ephemeral: true,
                    content: `There was an error timing out the last speaking member. Please forward this to staff ${e}`,
                });
                return ctx.logger.error(
                    `There was an error timing out last speaking member ${targetMember.user.id} (${targetMember.user.tag}). ${e}`
                );
            }
            ctx.logger.info(`Successfully timed out ${targetMember.id}`);
            await chatChannel.send(randomElement(timeoutMemberMessages).replace("{{ user }}", targetMember.toString()));
            return interaction.channel?.send(`The king has decreed that ${targetMember} shall be timed out.`);
        },
    },
    {
        name: "KICK_LAST_SPEAK",
        description: "Kick the last person to speak",
        type: "epic",
        execute: async (chatChannel, interaction, ctx) => {
            const messages = await chatChannel.messages.fetch({ limit: 50 });
            const users = Array.from(new Set(messages.map((x) => x.author.id)));
            const targetMember = await chatChannel.guild!.members.fetch(randomElement(users)).catch(() => null);
            if (!targetMember) return interaction.channel?.send("Oh no! The last person to speak has left before I could kick them, so sad!");

            try {
                await targetMember.kick();
            } catch (e) {
                interaction.reply({
                    ephemeral: true,
                    content: `Unable to kick last person to speak. Please forward this to staff ${e}`,
                });
                return ctx.logger.error(`There was an error kicking ${targetMember.user.id} (${targetMember.user.tag}). ${e}`);
            }
            ctx.logger.info(`Successfully kicked ${targetMember.user.id} (${targetMember.user.tag})`);
            return interaction.channel?.send(`The king has decreed that ${targetMember} shall be **kicked**.`);
        },
    },
];

export const commonDecrees = decrees.filter((x) => x.type === "common");
export const rareDecrees = decrees.filter((x) => x.type === "rare");
export const epicDecrees = decrees.filter((x) => x.type === "epic");
export const legendaryDecrees = decrees.filter((x) => x.type === "legendary");
export type Decree = typeof decrees[number];
