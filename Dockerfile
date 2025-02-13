# Stage 1: build
FROM node:20-alpine AS build-stage
WORKDIR /opt/app

COPY package.json package.json Makefile tsconfig.json ./
COPY assets assets
COPY templates templates
COPY schemas schemas
COPY src src

RUN npm i --environment=dev && npx tsc && npm prune --production && rm -r src/

# Remove large files that are not needed in the final image
# geoip databases we're not using are worth > 100MB
RUN rm -r node_modules/geoip-lite/data/*city*

# Stage 2: run!
FROM node:20-alpine
LABEL org.opencontainers.image.source https://github.com/curveball/a12n-server


EXPOSE 8531
WORKDIR /opt/app
RUN apk --no-cache add curl

COPY --from=build-stage /opt/app .
CMD node dist/app.js
