FROM node:8
EXPOSE 8531

RUN mkdir /opt/app
WORKDIR /opt/app
COPY package.json package.json
RUN npm i --production

COPY assets assets
COPY templates templates
COPY dist dist

CMD node dist/app.js 
