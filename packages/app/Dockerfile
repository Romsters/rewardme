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
COPY --chown=node:node ./packages/app/.env.production ./packages/app/
RUN npm run build

FROM nginx as production-stage
COPY --from=build-stage /usr/src/app/packages/app/nginx.config /etc/nginx/conf.d/default.conf
COPY --from=build-stage /usr/src/app/packages/app/build /usr/share/nginx/html

EXPOSE 80

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]