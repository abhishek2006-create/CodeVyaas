FROM node:24-alpine
RUN apk add --no-cache coreutils \
  && npm install -g typescript \
  && addgroup -S -g 10001 runner \
  && adduser -S -D -H -u 10001 -G runner runner

CMD ["sh", "-c", "tsc /workspace/main.ts --target ES2022 --module commonjs --outDir /tmp && timeout 3s node /tmp/main.js < /workspace/input.txt"]