FROM node:14

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install --save-prod

RUN npm prune --production

RUN chown -R 1001:0 /usr/src/app

EXPOSE 3000

USER 1001

CMD ["npm", "start"]