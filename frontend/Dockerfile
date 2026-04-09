FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy app files
COPY . .

# Build app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Copy server file and package files
COPY server.js .
COPY package.json package-lock.json ./

# Install production dependencies (express)
RUN npm install --omit=dev

# Expose port
EXPOSE 3000

# Run server
CMD ["node", "server.js"]
