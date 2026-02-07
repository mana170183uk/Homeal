FROM node:20-alpine

WORKDIR /app

# Copy workspace root
COPY package.json package-lock.json* ./
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY packages/api/package.json packages/api/

# Install dependencies
RUN npm install --workspace=packages/api --workspace=packages/db --workspace=packages/shared

# Copy source
COPY packages/db packages/db
COPY packages/shared packages/shared
COPY packages/api packages/api

# Generate Prisma client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build API
WORKDIR /app/packages/api
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/server.js"]
