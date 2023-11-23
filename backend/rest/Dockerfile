#Backend_REST
FROM node:18-alpine

WORKDIR /
COPY ./ ./
RUN npm ci

# Start the application
CMD ["npm", "run", "dev"]

# Expose the port that the application will listen on
EXPOSE 8080