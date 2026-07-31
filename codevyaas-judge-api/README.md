# CodeVyaas Judge API

This reference service runs each submission in a language-specific Docker image. Source and input are mounted read-only; the execution container has no network and runs as an unprivileged user.

## Run locally

1. Start Docker Desktop in Linux-container mode.
2. Open PowerShell in this folder and build the language images:

```powershell
docker compose build
```

3. Install and start the API. `cmd /c` avoids a PowerShell execution-policy block on `npm.ps1`.

```powershell
cmd /c npm install
cmd /c npm run start
```

4. In a second PowerShell window, submit code:

```powershell
$body = @{ language = 'python'; source = 'n = int(input()); print(n * n)'; stdin = '12' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri /api/execute -ContentType 'application/json' -Body $body
```

The `stdout` value should be `144` followed by a newline.

## Add another language

1. Add `runners/<language>/Dockerfile`. Its command must only refer to fixed filenames in `/workspace`.
2. Add the build/image entry to `docker-compose.yml`.
3. Add its public name, image name, and fixed filename to `src/languages.js`.
4. Rebuild with `docker compose build`.

## Important before production

Keep the restrictions in `src/dockerRunner.js`: no network, read-only mount, non-root user, CPU/memory/PID limits, capability drop, and timeout. Do not let client input become a shell command. A public deployment also needs auth, rate limiting, a job queue/concurrency cap, logging, and a separate execution host or VM because the API needs access to Docker.
