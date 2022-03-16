FROM node:17-slim

RUN apt-get update \ 
&& apt-get install -y sox libsox-fmt-mp3

WORKDIR /spotify-radio/

COPY package.json yarn.lock /spotify-radio/

RUN yarn install --frozen-lockfile

COPY . .

USER node

CMD npm run live-reload