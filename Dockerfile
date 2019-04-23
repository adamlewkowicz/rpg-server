FROM node:10.15.1
ARG NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 5000
CMD ["npm", "start"]