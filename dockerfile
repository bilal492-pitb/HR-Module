# Use Node.js 16 as the base image
FROM node:22.14.0-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend source code
COPY backend/ .

# Expose the port your app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]