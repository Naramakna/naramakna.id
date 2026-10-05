FROM node:20-slim AS build

WORKDIR /usr/src/app

ARG VITE_API_BASE_URL
ARG VITE_BACKEND_URL
ARG VITE_UPLOADS_BASE_URL

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_UPLOADS_BASE_URL=$VITE_UPLOADS_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /usr/src/app

# Use a lightweight static server for production
RUN npm i -g serve

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
