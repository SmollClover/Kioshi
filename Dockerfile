FROM node:lts-alpine
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./

COPY src/ ./src/
RUN pnpm run build

RUN rm -rf src/
RUN pnpm install --frozen-lockfile --prod

CMD ["pnpm", "run", "start"]
