# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Create optimized production image
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV CI=true

# Copy only required files
COPY package*.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]