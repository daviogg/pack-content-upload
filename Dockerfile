# syntax=docker/dockerfile:1

# ---- build: compile the SvelteKit app with the Node adapter -------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Public URL of the deployment, baked in for CSRF checks on form posts.
ARG ORIGIN
ENV ORIGIN=$ORIGIN
# SvelteKit validates src/env.ts while analysing routes; the real value is only read at runtime.
ENV DATABASE_URL=postgres://build-time-placeholder
RUN npm run build

# ---- deps: production dependencies only ---------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# ---- runtime: small image, non-root user --------------------------------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Max request body accepted by the Node adapter (200 MB uploads)
ENV BODY_SIZE_LIMIT=209715200
ENV LOCAL_STORAGE_DIR=/app/data/uploads

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json ./
# Migrations are applied by the app at startup (see src/hooks.server.ts)
COPY drizzle ./drizzle

RUN mkdir -p /app/data/uploads && chown -R node:node /app/data
USER node

EXPOSE 3000
CMD ["node", "build"]
