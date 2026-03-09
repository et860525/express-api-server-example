FROM oven/bun:latest AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:slim AS release
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY . .

RUN bun prisma generate
RUN mkdir -p /app/uploads && chown -R bun:bun /app

USER bun

EXPOSE ${PORT}
CMD ["bun", "start"]