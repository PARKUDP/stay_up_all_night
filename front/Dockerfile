FROM node:22.23.4

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# RUN npm run build 

CMD ["npm", "start"]
EXPOSE 3000
