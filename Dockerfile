FROM node:18.7.0 

WORKDIR /app
COPY . .

RUN npm install --force
RUN npm run build

EXPOSE 80

ENV PORT 80


CMD ["npm", "run", "start"]