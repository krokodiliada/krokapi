FROM node:13

WORKDIR /usr/src/app
COPY package*.json ./

#RUN npm ci --only=production

COPY . .
EXPOSE 8080
RUN npm install 
CMD [ "npm", "run", "prod" ]
