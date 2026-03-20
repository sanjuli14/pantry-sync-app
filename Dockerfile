# Etapa 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Etapa 2: Server
FROM nginx:stable-alpine
# IMPORTANTE: Reemplaza 'pantry-sync' por el nombre de tu proyecto en angular.json
COPY --from=build /app/dist/pantry-sync/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
