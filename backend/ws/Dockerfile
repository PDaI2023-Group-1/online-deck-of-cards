# WebSocket kontti
FROM node:18-alpine

WORKDIR /
COPY ./ ./
RUN npm ci

RUN npx tsc

# Start the application
CMD ["node", "dist/server.js"]

# Expose the port that the application will listen on
EXPOSE 8030