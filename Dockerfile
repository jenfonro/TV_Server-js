# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /opt/app

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY web/package.json web/package.json

RUN npm ci --include=dev --no-audit --no-fund && npm cache clean --force


FROM node:20-bookworm-slim
WORKDIR /app

ENV NODE_ENV=production \
  PORT=8080 \
  ASSET_VERSION=V1.0.0

COPY --from=deps /opt/app/node_modules /opt/node_modules
COPY docker-entrypoint.sh /usr/local/bin/tvserver-entrypoint
RUN chmod +x /usr/local/bin/tvserver-entrypoint

EXPOSE 8080
VOLUME ["/app/node_modules"]

ENTRYPOINT ["/usr/local/bin/tvserver-entrypoint"]
CMD ["sh", "-lc", "npm run build && npm run start"]
