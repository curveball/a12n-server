FROM node:14
LABEL org.opencontainers.image.source https://github.com/curveball/a12n-server

EXPOSE 8531

RUN mkdir /opt/app
WORKDIR /opt/app

COPY package.json package.json Makefile tsconfig.json ./
COPY assets assets
COPY templates templates
COPY src src
COPY mysql-schema mysql-schema

RUN npm i --environment=dev && make build && npm prune --production

CMD node dist/app.js
