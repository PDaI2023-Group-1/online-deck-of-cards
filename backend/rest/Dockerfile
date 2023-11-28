#Backend_REST
FROM node:18-alpine

WORKDIR /
COPY ./ ./
RUN npm ci

# Start the application
CMD ["tsc"]

# Expose the port that the application will listen on
EXPOSE 8080