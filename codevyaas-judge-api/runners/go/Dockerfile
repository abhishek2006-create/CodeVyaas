FROM golang:1-alpine

ENV HOME=/tmp
ENV GOCACHE=/tmp/go-build
ENV GOPATH=/tmp/go

RUN apk add --no-cache coreutils \
  && addgroup -S -g 10001 runner \
  && adduser -S -D -H -u 10001 -G runner runner

CMD ["sh", "-c", "go build -o /workspace/main /workspace/main.go && timeout 3s /workspace/main < /workspace/input.txt"]