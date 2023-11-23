#frontti stage
FROM node:18-alpine AS build-stage

WORKDIR /
COPY ./ ./
RUN npm ci


#buildataan frontti
RUN npm run build

FROM nginx


#TODO: tarkista GCP portitus
EXPOSE 3000

#docker run -dp 127.0.0.1:3000:3000 <image_id>