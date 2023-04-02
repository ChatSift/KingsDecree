import { env } from "node:process";
import type { TextChannel} from "discord.js";
import { ActionRowBuilder, StringSelectMenuBuilder, type Interaction } from "discord.js";
import { client, logger } from "..";
import { KingsDecree } from "../KingsDecree";
import { decrees } from "../decrees";

export const interactionCreate = async (interaction: Interaction) => {
	logger.info(`Received interaction from ${interaction.user.id}`);
	if (!interaction.isStringSelectMenu()) {
		return;
	}

	if (!KingsDecree.king || !KingsDecree.interval || !KingsDecree.decrees || !KingsDecree.rotationTime) {
		logger.warn(
			`One of the big 4 are missing, ${
				KingsDecree.king?.id
			}, ${typeof KingsDecree.interval}, ${KingsDecree.decrees}, ${KingsDecree.rotationTime}`,
		);
		await interaction.reply({ content: "Weird error. This shouldn't happen.", ephemeral: true });
		return;
	}

	if (interaction.user.id !== KingsDecree.king.id) {
		logger.warn(
			`User ${interaction.user.id} tried to run a king command but isn't the king (${KingsDecree.king.id}). Shame them.`,
		);
		await interaction.reply({ content: 'You are not the current king!', ephemeral: true });
		return;
	}

	const [_, decreeName] = (interaction.values[0] as string).split('decree-select:');
	const decree = decrees.find((x) => x.name === decreeName);

	if (!decree) {
		logger.warn(
			`Decree is not found, current decrees: ${KingsDecree.decrees}, interaction value: ${decreeName}, ${interaction.values}`,
		);
		await interaction.reply({ content: 'Decree not found. Contact an admin', ephemeral: true });
		return;
	}

	if (!KingsDecree.decrees?.some((x) => x.name === decree.name)) {
		logger.warn(`User tried to user decree that isn't part of their selection. ${JSON.stringify(KingsDecree.decrees, null, '\t')} vs. ${JSON.stringify(decree, null, '\t')}`);
		await interaction.reply({ content: 'That is not part of your current decrees.', ephemeral: true });
		return;
	}

	try {
		logger.info(`Running decree ${decree.name} by user ${interaction.user.tag} (${interaction.user.id})`);
		await decree.execute(client.channels.cache.get(env.CHAT_CHANNEL) as TextChannel, interaction);

		const message = await (client.channels.cache.get(env.DECREE_CHANNEL)! as TextChannel).messages.fetch(
			interaction.message.id,
		);

		await message
			.edit({
				components: [
					new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
						new StringSelectMenuBuilder()
							.setCustomId(`decree-selector`)
							.setPlaceholder('Select Your Decree (only 1)')
							.addOptions([{ label: decree.description, value: `NONE` }])
							.setDisabled(true),
					),
				],
			})
			.catch(() => {});
		await interaction.reply({ content: 'It is done.', ephemeral: true });
	} catch (error) {
		logger.error(`Error running interaction from user ${interaction.user.id} ${error}`);
		await interaction.reply({
			content: `There was an error running your decree. Please forward this error to the staff: \`${
				(error as Error).message
			}\`. In the meantime, choose another one.`,
			ephemeral: true,
		}).catch(async () => interaction.channel?.send(`There was an error running your decree. Please forward this error to the staff: \`${(error as Error).message}\`. In the meantime, choose another one.`));
	}
};
