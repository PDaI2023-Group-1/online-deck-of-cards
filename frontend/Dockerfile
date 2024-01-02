#frontti stage
FROM node:18-alpine AS build-stage

WORKDIR /
COPY ./ ./
RUN npm ci

#buildataan frontti
RUN npm run build

FROM nginx
WORKDIR /
COPY --from=build-stage ./dist /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx

CMD ["nginx", "-g", "daemon off;"]

#TODO: tarkista GCP portitus
EXPOSE 80

#docker run -dp 127.0.0.1:80:80 <image_id>