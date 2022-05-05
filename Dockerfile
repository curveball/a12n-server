# Stage 1: build
FROM node:16-alpine as build-stage
WORKDIR /opt/app

# Needed for building @vscode/sqlite3 package
RUN apk add python3 make gcc musl-dev g++

COPY package.json package.json Makefile tsconfig.json ./
COPY assets assets
COPY templates templates
COPY schemas schemas
COPY src src

# --legacy-peer-deps should be removed when all dependencies are marked as stable
RUN npm i --legacy-peer-deps --environment=dev && npx tsc && npm prune --production && rm -r src/

# Stage 2: run!
FROM node:16-alpine
LABEL org.opencontainers.image.source https://github.com/curveball/a12n-server


EXPOSE 8531
WORKDIR /opt/app
RUN apk --no-cache add curl

COPY --from=build-stage /opt/app .
CMD node dist/app.js
