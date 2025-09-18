FROM node:22-alpine

WORKDIR /opt/app
COPY . .
# build frontend
WORKDIR /opt/app/frontend
RUN  npm install; npm run build; mv  dist ../backend
# build backend
WORKDIR /opt/app/backend
RUN npm install --production
# run server
CMD ["node", "server.js"]
