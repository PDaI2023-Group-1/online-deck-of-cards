#frontti stage
FROM node:18

WORKDIR /
COPY ./package.json ./
RUN npm install
COPY ./ ./

#buildataan frontti
RUN npm run build

CMD ["npm", "start"]

#TODO: tarkista GCP portitus
EXPOSE 3000

#docker run -dp 127.0.0.1:3000:3000 <image_id>