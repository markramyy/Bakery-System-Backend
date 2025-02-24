FROM node:18.19.1-alpine

WORKDIR /usr/src/app

RUN npm install @prisma/client --save-dev

COPY package*.json tsconfig.json swagger.js ./

RUN npm install

COPY prisma/ ./prisma/

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3001

CMD npm run start
