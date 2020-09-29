FROM node:12
EXPOSE 8531

RUN mkdir /opt/app
WORKDIR /opt/app
COPY package.json package.json
COPY node_modules node_modules
RUN npm rebuild bcrypt --update-binary

COPY assets assets
COPY templates templates
COPY dist dist

CMD node dist/app.js 
