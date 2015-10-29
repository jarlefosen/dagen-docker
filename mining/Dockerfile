FROM node:4

MAINTAINER Jarle Fosen <jarlefosen@gmail.com>

RUN npm install --silent -g nodemon

RUN mkdir /app
WORKDIR /app
COPY package.json ./
RUN npm install

COPY mining* ./

CMD node mining.js
