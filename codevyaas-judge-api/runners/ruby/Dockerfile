FROM ruby:3.4-alpine
RUN apk add --no-cache coreutils \
  && addgroup -S -g 10001 runner \
  && adduser -S -D -H -u 10001 -G runner runner

CMD ["sh", "-c", "timeout 3s ruby /workspace/main.rb < /workspace/input.txt"]