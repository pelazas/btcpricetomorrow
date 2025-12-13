# Stage 1: Build the application
FROM node:22-alpine AS builder

ARG NEXT_PUBLIC_API_URL
ARG NODE_ENV

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app
COPY package*.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV CI=true

# Copy package.json and lockfile from builder stage 👇
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/package-lock.json ./

# Copy built assets and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set the host environment variable for Next.js to bind to all interfaces
ENV HOST=0.0.0.0

EXPOSE 3000
# Run the Next.js server directly
CMD ["node_modules/.bin/next", "start"]