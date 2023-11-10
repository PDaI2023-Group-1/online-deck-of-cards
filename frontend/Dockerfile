#frontti stage
FROM node:18

WORKDIR /
COPY ./package.json ./
RUN npm install
COPY ./ ./

CMD ["node", "src/index.tsx"]
#TODO: tarkista GCP portitus
EXPOSE 3000