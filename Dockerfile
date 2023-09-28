FROM node:20 AS build

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build
RUN npm run tailwind:prod

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/views ./views
COPY --from=build /app/node_modules ./node_modules

CMD [ "node", "dist/main" ]
