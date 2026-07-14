FROM python:3.13-alpine
RUN addgroup -S -g 10001 runner && adduser -S -D -H -u 10001 -G runner runner
ENV PYTHONDONTWRITEBYTECODE=1
CMD ["sh", "-c", "timeout 3s python3 /workspace/main.py < /workspace/input.txt"]
