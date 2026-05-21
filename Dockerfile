FROM node:20-alpine

RUN apk add --no-cache bash su-exec wget

COPY docker-dev-entry.sh /usr/local/bin/docker-dev-entry.sh
RUN chmod +x /usr/local/bin/docker-dev-entry.sh

WORKDIR /home/node/app

# Cache dependencies in the image; bind-mounted named volume still shadows node_modules at runtime.
COPY package.json package-lock.json ./
RUN npm ci
