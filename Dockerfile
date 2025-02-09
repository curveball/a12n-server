# Stage 1: build
FROM node:20-alpine as build-stage
WORKDIR /opt/app

# Needed for building binary Node.js addons
RUN apk add python3 make gcc musl-dev g++ py3-pip py3-setuptools lz4-dev

COPY package.json package.json Makefile tsconfig.json ./
COPY assets assets
COPY templates templates
COPY schemas schemas
COPY src src

RUN npm i --environment=dev && npx tsc && npm prune --production && rm -r src/

# Stage 2: run!
FROM node:20-alpine
LABEL org.opencontainers.image.source https://github.com/curveball/a12n-server


EXPOSE 8531
WORKDIR /opt/app
RUN apk --no-cache add curl

COPY --from=build-stage /opt/app .
CMD node dist/app.js
