# Use official Node image
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (non-dev)
COPY package*.json ./
RUN npm ci --production

# Copy app source
COPY . .

ENV NODE_ENV=production
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
