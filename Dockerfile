# Dockerfile
FROM node:18 as react
WORKDIR /app
COPY package*.json .
RUN npm install --production
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=react /app/build /usr/share/nginx/html