FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine

ENV DOTNET_CLI_HOME=/tmp
ENV NUGET_PACKAGES=/opt/nuget
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1

RUN apk add --no-cache coreutils \
  && addgroup -S -g 10001 runner \
  && adduser -S -D -H -u 10001 -G runner runner \
  && mkdir -p /runner /opt/nuget \
  && chmod 777 /tmp /opt/nuget

COPY App.csproj /runner/App.csproj

RUN dotnet restore /runner/App.csproj \
  && chmod -R a+rX /runner /opt/nuget

CMD ["sh", "-c", "cp /runner/App.csproj /workspace/App.csproj && dotnet restore /workspace/App.csproj --ignore-failed-sources 1>&2 && dotnet build /workspace/App.csproj --no-restore -o /workspace/out 1>&2 && timeout 3s dotnet /workspace/out/App.dll < /workspace/input.txt"]