# ---- Base: shared deps layer ----
FROM node:24-alpine AS base
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./

# ---- Dependencies (cached unless package*.json changes) ----
FROM base AS deps
RUN npm ci

# ---- Development: used by docker-compose, source is bind-mounted ----
FROM deps AS development
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ---- Build: compiles TypeScript for the production image ----
FROM deps AS build
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Production: minimal runtime image ----
FROM base AS production
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/src/main"]
