FROM eclipse-temurin:21-jdk-alpine
RUN addgroup -S -g 10001 runner && adduser -S -D -H -u 10001 -G runner runner
CMD ["sh", "-c", "javac -d /tmp /workspace/Main.java && timeout 3s java -cp /tmp Main < /workspace/input.txt"]
