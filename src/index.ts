import "dotenv/config";
["DISCORD_TOKEN", "PREFIX", "CHAT_CHANNEL", "DECREE_CHANNEL", "GUILD_ID", "STAFF_ROLE"].forEach((env) => {
    if (!process.env[env]) throw new Error(`Missing var ${env}`);
});

import { Client, GuildMember, Message, MessageActionRow, MessageSelectMenu, MessageSelectMenuOptions, TextChannel } from "discord.js";
import { epicDecrees, rareDecrees, commonDecrees, legendaryDecrees, Decree, decrees } from "./decrees";
import { randomElement } from "./util";
import { inspect } from "util";
import { stripIndents } from "common-tags";
import winston from "winston";
const client = new Client({
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_EMOJIS_AND_STICKERS", "GUILD_INTEGRATIONS", "GUILD_MESSAGE_REACTIONS"],
});
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});
let currentKing: GuildMember | null = null;
let currentDecrees: Array<Decree> | null = null;
let currentInterval: NodeJS.Timeout | null = null;
let currentRotationTime: number | null = null;

client.on("ready", () => {
    if (!client.guilds.cache.get(process.env.GUILD_ID)) throw new Error("Not in the target guild.");
    if (!client.channels.cache.get(process.env.CHAT_CHANNEL)) throw new Error("Chat channel does not exist");
    if (!client.channels.cache.get(process.env.DECREE_CHANNEL)) throw new Error("Decree channel does not exist");
    logger.info(`Logged in as ${client.user!.tag}`);
});

client.on("interactionCreate", async (interaction) => {
    logger.info(`Received interaction from ${interaction.user.id}`);
    if (!interaction.isSelectMenu()) return;
    if (!currentKing || !currentInterval || !currentDecrees || !currentRotationTime) {
        logger.warn(`One of the big 4 are missing, ${currentKing?.id}, ${typeof currentInterval}, ${currentDecrees}, ${currentRotationTime}`);
        return interaction.reply({ content: "Weird error. This shouldn't happen.", ephemeral: true });
    }
    if (interaction.user.id !== currentKing.id) {
        logger.warn(`User ${interaction.user.id} tried to run a king command but isn't the king (${currentKing?.id}). Shame them.`);
        return interaction.reply({ content: "You are not the current king!", ephemeral: true });
    }

    const [_, interactionName] = interaction.values[0].split("decree-select:");
    const decree = decrees.find((x) => x.name === interactionName);

    if (!decree) {
        logger.warn(`Decree is not found, current decrees: ${currentDecrees}, interaction value: ${interactionName}, ${interaction.values}`);
        return interaction.reply({ content: "Decree not found. Contact an admin", ephemeral: true });
    }
    if (!currentDecrees?.some((x) => x.name === decree.name)) {
        logger.warn(`User tried to user decree that isn't part of their selection. ${currentDecrees} vs. ${decree}`);
        return interaction.reply({ content: "That is not part of your current decrees.", ephemeral: true });
    }
    try {
        logger.info(`Running decree ${decree.name} by user ${interaction.user.tag} (${interaction.user.id})`);
        await decree.execute(client.channels.cache.get(process.env.CHAT_CHANNEL) as TextChannel, interaction, {
            currentDecrees,
            currentInterval,
            currentKing,
            currentRotationTime,
            client,
            logger,
        });

        const message = await (client.channels.cache.get(process.env.DECREE_CHANNEL)! as TextChannel).messages.fetch(interaction.message.id);
        const oldSelectMenu = Object.assign({}, interaction.message.components![0].components[0]);
        oldSelectMenu.disabled = true;
        await message
            .edit({
                components: [
                    new MessageActionRow().addComponents(
                        new MessageSelectMenu()
                            .setCustomId(`decree-selector`)
                            .setPlaceholder("Select Your Decree (only 1)")
                            .addOptions([{ label: decree.description, value: `NONE` }])
                            .setDisabled(true)
                    ),
                ],
            })
            .catch(() => {});
        return interaction.reply({ content: "It is done.", ephemeral: true });
    } catch (e) {
        logger.error(`Error running interaction from user ${interaction.user.id} ${e}`);
        return interaction.reply({
            content: `There was an error running your decree. Please forward this error to the staff: \`${
                (e as Error).message
            }\`. In the meantime, choose another one.`,
            ephemeral: true,
        });
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild || !message.member || !message.content.startsWith(process.env.PREFIX)) return;
    if (!message.member.roles.cache.has(process.env.STAFF_ROLE)) return;
    const [command, ...args] = message.content.slice(process.env.PREFIX!.length).split(" ");

    const chatChannel = client.channels.cache.get(process.env.CHAT_CHANNEL) as TextChannel;
    const decreeChannel = client.channels.cache.get(process.env.DECREE_CHANNEL) as TextChannel;
    switch (command) {
        case "start_rotation": {
            if (!args[0]) {
                message.channel.send("You must provide a rotation period in the form of minutes");
                return void 0;
            }
            const time = parseInt(args[0]);
            await message.channel.send(`Alright boss. Will crown the next king now. Will rotate every ${time} minutes (${time * 1000 * 60} ms)`);
            await runDecreer(message, chatChannel, decreeChannel);
            currentInterval = setInterval(() => runDecreer(message, chatChannel, decreeChannel), time * 1000 * 60);
            currentRotationTime = time * 1000 * 60;
            break;
        }
        case "set_king": {
            if (!args[0]) {
                message.channel.send("You must specify the new person you want to be king.");
                return void 0;
            }
            const newKing = message.mentions.members?.first() ?? (await message.guild!.members.fetch(args[0]).catch(() => null));
            if (!newKing) {
                message.channel.send("Could not find this new person you want to crown king.");
                return void 0;
            }
            await runDecreer(message, chatChannel, decreeChannel);
            if (currentInterval) clearInterval(currentInterval);
            currentRotationTime ??= 5 * 1000 * 60;
            currentInterval = setInterval(() => runDecreer(message, chatChannel, decreeChannel), currentRotationTime);
            break;
        }
        case "change_time": {
            if (!args[0]) {
                message.channel.send("You must provide a rotation period in the form of minutes");
                return void 0;
            }
            const time = parseInt(args[0]);
            await message.channel.send(`Alright boss. Will choose next king in ${time} minutes (${time * 1000 * 60} ms) and rotate on that interval`);
            if (currentInterval) clearInterval(currentInterval);
            currentInterval = setInterval(() => runDecreer(message, chatChannel, decreeChannel), time * 1000 * 60);
            currentRotationTime = time * 1000 * 60;
            break;
        }
    }
});

async function runDecreer(message: Message, chatChannel: TextChannel, decreeChannel: TextChannel) {
    logger.info("Grabbing last 50 messages in chat channel");
    const messages = await chatChannel.messages.fetch({ limit: 50 });
    if (!messages.size) {
        return logger.info("No messages in the channel, nani??");
    }
    const users = Array.from(new Set(messages.filter((x) => !x.author.bot).map((x) => x.author.id)));

    let newKing: GuildMember | null = null;
    while (newKing === null) {
        newKing = await message.guild!.members.fetch(randomElement(users)).catch(() => null);
        if (!newKing) logger.info(`King could not be fetched, retrying...`);
        else logger.info(`New king is now ${newKing.user.tag} (${newKing.user.id})`);
    }

    currentKing = newKing;
    const newDecrees: Set<Decree> = new Set();
    for (let i = 0; newDecrees.size < 3; i++) {
        const randomNum = Math.ceil(Math.random() * 100);
        if (randomNum >= 1 && randomNum <= 69) newDecrees.add(randomElement(commonDecrees));
        else if (randomNum >= 70 && randomNum <= 84) newDecrees.add(randomElement(rareDecrees));
        else if (randomNum >= 85 && randomNum <= 94) newDecrees.add(randomElement(epicDecrees));
        else if (randomNum >= 95 && randomNum <= 100) newDecrees.add(randomElement(legendaryDecrees));
    }
    if (!Array.from(newDecrees).some((x) => x.type === "common")) {
        newDecrees.delete(Array.from(newDecrees)[2]);
        newDecrees.add(randomElement(commonDecrees));
    }
    currentDecrees = Array.from(newDecrees);

    const msg = await decreeChannel.send({
        content: `${newKing.toString()}, pick your decrees before time runs out!`,
        components: [
            new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId(`decree-selector`)
                    .setPlaceholder("Select Your Decree (only 1)")
                    .addOptions(currentDecrees.map((decree) => ({ label: decree.description, value: `decree-select:${decree.name}` })))
            ),
        ],
        embeds: [
            {
                title: "A new king has been crowned!",
                description: stripIndents`
                ${newKing} is now the new king.
                Here are your decree choices:

                ${currentDecrees.map((x) => `**[${x.type}]** \`${x.description}\``).join("\n")}
                `,
                color: "GOLD",
            },
        ],
    });

    return setTimeout(
        () =>
            msg
                .edit({
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageSelectMenu()
                                .setCustomId(`decree-selector`)
                                .setPlaceholder("Select Your Decree (only 1)")
                                .addOptions([{ label: "Ran out of time!", value: `NONE` }])
                                .setDisabled(true)
                        ),
                    ],
                })
                .catch(() => {}),
        currentRotationTime ?? 5 * 60 * 1000
    );
}

client.login(process.env.DISCORD_TOKEN);
