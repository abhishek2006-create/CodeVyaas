FROM alpine:3.22
RUN apk add --no-cache g++ coreutils && addgroup -S -g 10001 runner && adduser -S -D -H -u 10001 -G runner runner
CMD ["sh", "-c", "g++ -O2 -std=c++17 /workspace/main.cpp -o /workspace/main && timeout 3s /workspace/main < /workspace/input.txt"]