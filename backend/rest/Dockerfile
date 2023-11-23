#Backend_REST

# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the application will listen on
EXPOSE 8000

# täsä on kyllä dev juttuja vaa mutta ei haittaa
# Start the application
CMD ["npm", "run", "dev"]
