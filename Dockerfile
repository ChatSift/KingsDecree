FROM node:16-alpine
LABEL name "kingsdecree"

WORKDIR /usr/kingsdecree

RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps curl git python3 alpine-sdk

COPY package.json tsconfig.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn --immutable

COPY src ./src

RUN yarn build

COPY .env ./

CMD ["yarn", "start"]
