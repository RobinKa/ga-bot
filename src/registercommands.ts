import { clientId, guildId, token } from "./config"
import { SlashCommandBuilder } from "@discordjs/builders"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"

function expressionCommand(name: string, description: string) {
    return new SlashCommandBuilder().setName(name).setDescription(description)
        .addStringOption(option => option.setName("expression").setDescription("Enter an expression").setRequired(true))
}

const commands = [
    expressionCommand("pga2d", "Evaluates a PGA2D expression with ganja.js"),
    expressionCommand("pga3d", "Evaluates a PGA3D expression with ganja.js"),
    expressionCommand("ga3d", "Evaluates a PGA3D expression with ganja.js"),
    expressionCommand("sta", "Evaluates an STA expression with ganja.js"),
    new SlashCommandBuilder().setName("ga").setDescription("Evaluates a custom-signature GA expression with ganja.js")
        .addStringOption(option => option.setName("signature").setDescription("Enter an signature (eg. 3, 0, 1)").setRequired(true))
        .addStringOption(option => option.setName("expression").setDescription("Enter an expression").setRequired(true)),
    expressionCommand("mathjs", "Evaluates an expression with math.js"),
].map(command => command.toJSON())

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        )

        console.log("Successfully registered application commands.")
    } catch (error) {
        console.error(error)
    }
})()
