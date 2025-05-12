# Use Node.js 22.14.0 Alpine as the base image
FROM node:22.14.0-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Copy package files
COPY --chown=appuser:appgroup backend/package*.json ./

# Install dependencies
RUN npm install --production --frozen-lockfile

# Copy backend source code
COPY --chown=appuser:appgroup backend/ .

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Command to run the application
CMD ["node", "server.js"]   