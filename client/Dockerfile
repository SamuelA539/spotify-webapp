#dev img
FROM node:22-alpine
WORKDIR /app

#look into COPY
COPY package*.json ./ 

RUN npm install
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
