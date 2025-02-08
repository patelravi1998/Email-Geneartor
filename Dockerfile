# Use a Node.js image as the base
FROM node:18-alpine

# Install required dependencies for node-canvas
RUN apk add --no-cache \
    make gcc g++ python3 python3-dev pkgconfig \
    pixman pixman-dev cairo cairo-dev pango pango-dev \
    libjpeg-turbo-dev freetype-dev giflib-dev libpng-dev

WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
