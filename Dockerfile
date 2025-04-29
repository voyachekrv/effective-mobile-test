FROM node:23.11.0-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run prisma:generate

RUN npm run build

CMD ["npm", "run", "start:prod"]

EXPOSE 8000
