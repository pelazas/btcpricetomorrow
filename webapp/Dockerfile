# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build
COPY . .
RUN npm run build

# Stage 2: Create optimized production image
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV production

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]