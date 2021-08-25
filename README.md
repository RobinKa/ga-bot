# Geometric Algebra Bot
Geometric Algebra bot for Discord.

# Commands
- `/mathjs <expression>`: Evaluates the expression with Math.JS
- `/pga3d|pga2d|ga3d <expression>`: Evaluates the expression in the algebra with ganja.js
- `/ga <signature> <expression>`: Evaluates the expression in an algebra with custom signature with ganja.js

# Setup
1. Clone the repository and run `yarn install`
2. Copy `.env.template` to `.env` and fill all the fields.
3. Run `yarn run register-commands` to register the commands on your Discord server.
3. Run `yarn start` to start the bot.