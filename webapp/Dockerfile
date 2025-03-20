# Stage 1: Build the application
FROM node:18-alpine AS builder

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
FROM node:18-alpine

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

EXPOSE 3000
CMD ["npm", "start"]