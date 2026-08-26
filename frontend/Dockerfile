# Use an official Node runtime as a parent image
FROM node:20-alpine

WORKDIR /app

# We will copy package.json and install dependencies later when we build the Next.js app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

