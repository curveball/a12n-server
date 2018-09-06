FROM node:8
EXPOSE 8888

RUN mkdir /opt/app
WORKDIR /opt/app
COPY package.json package.json
COPY node_modules node_modules
COPY assets assets
COPY templates templates
RUN npm rebuild bcrypt --update-binary
COPY dist dist

RUN ls -la


RUN pwd
CMD node dist/app.js 
