# Dockerfile for Node.js app
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Use environment variable for PORT
CMD ["node", "node.js"]
