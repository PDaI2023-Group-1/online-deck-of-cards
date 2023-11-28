#Backend_REST
FROM node:18-alpine

WORKDIR /
COPY ./ ./
RUN npm ci

CMD ["npx", "tsc"]

# Start the application
CMD ["node", "dist/src/server.js"]

# Expose the port that the application will listen on
EXPOSE 8080