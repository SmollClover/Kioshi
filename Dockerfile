FROM node:lts-alpine
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY tsconfig.json ./

COPY src/ ./src/
RUN pnpm run build

RUN rm -rf src/

CMD ["pnpm", "run", "start"]
