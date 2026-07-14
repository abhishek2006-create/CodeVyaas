FROM node:24-alpine
RUN addgroup -S -g 10001 runner && adduser -S -D -H -u 10001 -G runner runner
CMD ["sh", "-c", "timeout 3s node /workspace/main.js < /workspace/input.txt"]
