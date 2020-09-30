FROM node:12
EXPOSE 8531

RUN mkdir /opt/app
WORKDIR /opt/app

COPY package.json package.json Makefile tsconfig.json ./
COPY assets assets
COPY templates templates
COPY src src

RUN npm i --environment=dev && make build && npm prune --production

CMD node dist/app.js
