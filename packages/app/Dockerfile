FROM node:18.17.1-alpine AS base-stage
ENV NODE_ENV=production

WORKDIR /usr/src/app
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

COPY --chown=node:node lerna.json ./
COPY --chown=node:node package*.json ./
COPY --chown=node:node ./packages/app/package*.json ./packages/app/
RUN npm ci --ignore-scripts && npm cache clean --force
COPY --chown=node:node ./packages/app/. ./packages/app

FROM base-stage AS development-stage
ENV NODE_ENV=development
RUN npm ci

FROM development-stage AS build-stage
RUN npm run build

FROM base-stage AS production-stage
COPY --chown=node:node --from=build-stage /usr/src/app/packages/app/build ./packages/app/build
RUN npm i -g http-server

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ARG PORT=3000
ENV PORT $PORT

USER node
WORKDIR /usr/src/app/packages/app/build

CMD http-server -p $PORT