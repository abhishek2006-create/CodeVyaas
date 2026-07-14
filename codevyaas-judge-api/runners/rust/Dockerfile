FROM rust:1-alpine
RUN apk add --no-cache coreutils \
  && addgroup -S -g 10001 runner \
  && adduser -S -D -H -u 10001 -G runner runner

CMD ["sh", "-c", "rustc -O /workspace/main.rs -o /workspace/main && timeout 3s /workspace/main < /workspace/input.txt"]