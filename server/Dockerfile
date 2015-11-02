FROM node:4

MAINTAINER Jarle Fosen <jarlefosen@gmail.com>

RUN npm install --silent -g nodemon

RUN mkdir /app
WORKDIR /app
COPY package.json ./
RUN npm install
COPY server.js ./

ENV REDIS_DB_HOST localhost
ENV REDIS_DB_PORT 6379

ENV APP_PORT 80
EXPOSE 80

CMD node server.js
