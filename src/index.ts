import { token } from "./config"
import Discord, { Intents } from "discord.js"
import * as mathjs from "mathjs"
import { makeEvaluator } from "./evaluator"
const Algebra = require("ganja.js")

const commands: Record<string, (interaction: Discord.CommandInteraction) => Promise<void>> = {
    "pga2d": makeGanjaHandler(Algebra(2, 0, 1)),
    "pga3d": makeGanjaHandler(Algebra(3, 0, 1)),
    "ga3d": makeGanjaHandler(Algebra(3, 0, 0)),
    "sta": makeGanjaHandler(Algebra(3, 1, 0)),
    "ga": handleGanjaCustomSignature,
    "mathjs": handleMathJS,
}

function codeBlock(text: string) {
    return `\`\`\`js\n${text}\`\`\``
}

function ganjaToString(ganjaObject: any): string {
    // Converts eg. 123 to ₁₂₃
    function numberStringToSubscript(numberString: string): string {
        return numberString
            .split("")
            .map(c => String.fromCharCode(0x2080 + parseInt(c)))
            .join("")
    }

    return ganjaObject
        .toString()
        .replace(/e_(\d+)/g, (basisBlade: string) => `𝐞${numberStringToSubscript(basisBlade.slice(2))}`)
}

function makeGanjaHandler(algebra: any, signatureString?: string) {
    const evaluateGanja = makeEvaluator(algebra)

    return async function handleGanja(interaction: Discord.CommandInteraction) {
        await interaction.deferReply()

        const expression = interaction.options.getString("expression", true)

        // Evaluate the expression
        let result
        try {
            result = evaluateGanja(expression)
        } catch (error) {
            await interaction.editReply(codeBlock(`${signatureString ? `Signature: ${signatureString}\n` : ""}Expression: ${expression}\nError evaluating: ${error.toString()}`))
            return
        }

        await interaction.editReply(codeBlock(`${signatureString ? `Signature: ${signatureString}\n` : ""}Expression: ${expression}\nResult: ${ganjaToString(result)}`))
    }
}

async function handleGanjaCustomSignature(interaction: Discord.CommandInteraction) {
    const signature = interaction.options.getString("signature", true)
    const expression = interaction.options.getString("expression", true)

    // Parse the signature and create algebra
    let algebra
    try {
        const signatureArray: number[] = signature.split(",").map(s => parseInt(s.trim()))
        algebra = Algebra(...signatureArray)
    } catch (error) {
        await interaction.editReply(codeBlock(`Signature: ${signature}\nExpression: ${expression}\nError parsing signature: ${error.toString()}`))
        return
    }

    const handler = makeGanjaHandler(algebra, signature)
    await handler(interaction)
}

async function handleMathJS(interaction: Discord.CommandInteraction) {
    await interaction.deferReply()

    const expression = interaction.options.getString("expression", true)

    // Evaluate the expression
    let result
    try {
        result = mathjs.evaluate(expression)
    } catch (error) {
        await interaction.editReply(error.toString())
        return
    }

    await interaction.editReply(codeBlock(`Expression: ${expression}\nResult: ${mathjs.format(result, 5)}`))
}

const client = new Discord.Client({
    intents: [Intents.FLAGS.GUILD_MESSAGES]
})

client.on("ready", () => {
    console.log("Ready")
})

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) {
        return
    }

    if (interaction.commandName in commands) {
        await commands[interaction.commandName](interaction)
    }
})

process.on("unhandledRejection", error => {
    console.error("Unhandled promise rejection:", error)
})

client.on("shardError", error => {
    console.error("A websocket connection encountered an error:", error)
})

client.login(token)