# Praxio Website - Nuxt 3 on Cloud Run
# Build context must be the parent directory (C:\praxio)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy packages directory (for @praxio/i18n)
COPY packages ./packages

# Copy website files
COPY praxio-website/package*.json ./praxio-website/
WORKDIR /app/praxio-website

# Install dependencies
RUN npm ci

# Copy website source code
COPY praxio-website .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built output and dependencies
COPY --from=builder /app/praxio-website/.output ./.output
COPY --from=builder /app/praxio-website/package*.json ./
COPY --from=builder /app/packages ./packages

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", ".output/server/index.mjs"]
