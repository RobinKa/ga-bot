import dotenv from "dotenv"
dotenv.config()

if (!process.env.clientId) {
    throw Error("clientId not set in .env")
}
if (!process.env.guildId) {
    throw Error("guildId not set in .env")
}
if (!process.env.token) {
    throw Error("token not set in .env")
}

export const { clientId, guildId, token } = process.env