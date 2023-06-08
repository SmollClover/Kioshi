FROM node:20-alpine
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./

COPY src/ ./src/
RUN pnpm run build

RUN rm -rf src/
RUN pnpm install --frozen-lockfile --prod

CMD ["pnpm", "run", "start"]
