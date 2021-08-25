FROM node:16-alpine as stage

WORKDIR /opt/ga-bot
COPY src src
COPY grammars grammars
COPY tsconfig.json package.json yarn.lock .mocharc.yml ./

RUN yarn install
RUN yarn run test

FROM node:16-alpine

WORKDIR /opt/ga-bot/dist
COPY --from=stage /opt/ga-bot/dist .
COPY tsconfig.json package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile
CMD ["node", "index.js"]