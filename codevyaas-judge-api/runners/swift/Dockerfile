FROM swift:6.1-noble
RUN groupadd -g 10001 runner \
  && useradd -u 10001 -g runner -M -s /usr/sbin/nologin runner

CMD ["sh", "-c", "swiftc -module-cache-path /tmp/swift-module-cache /workspace/main.swift -o /workspace/main && timeout 3s /workspace/main < /workspace/input.txt"]