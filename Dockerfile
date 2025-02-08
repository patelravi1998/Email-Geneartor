# Stage 1: Build stage
FROM node:18-alpine AS builder

# Install required dependencies for node-canvas
RUN apk add --no-cache \
    make gcc g++ python3 python3-dev pkgconfig \
    pixman pixman-dev cairo cairo-dev pango pango-dev \
    libjpeg-turbo-dev freetype-dev giflib-dev libpng-dev

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime stage
FROM node:18-alpine

# Install only the runtime dependencies for node-canvas
RUN apk add --no-cache \
    pixman cairo pango libjpeg-turbo freetype giflib libpng

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
