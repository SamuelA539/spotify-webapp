#dev img
FROM node:22-alpine
WORKDIR /app

#look into COPY
COPY package*.json ./ 

RUN npm install
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]



#---prod img---
# #build stage
# FROM node:22-alpine
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY  . .
# RUN npm run build
# #prod stage
# FROM nginx: