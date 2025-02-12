# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port 8000
EXPOSE 8000

# Set environment variable for port
ENV PORT=8000

# Start the application
CMD ["node", "index.js"]