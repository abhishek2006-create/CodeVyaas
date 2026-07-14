# CodeVyaas

CodeVyaas is a modern, full-stack online code execution platform that enables users to write, compile, and run code in real time across multiple programming languages. Built with Next.js and modern web technologies, it provides a fast, responsive, and secure coding experience.

## Features

* Real-time code execution
* Multi-language support
* Secure user authentication and authorization
* Interactive code editor
* Save and manage code submissions
* Execution results with output and error handling
* Responsive and modern UI
* Optimized performance using Next.js

## Tech Stack

* Next.js
* React
* TypeScript/JavaScript
* Node.js
* Database (Convex)
* Judge0 API
* Tailwind CSS
* Docker
* wsl
* clerk



## Code execution

Create `.env.local` in the project root:
```env
JUDGE_API_URL=http://localhost:xxxx
```

* install doker desktop and linux
  
  Open a second terminal:

```powershell
cd codevyaas-judge-api
docker compose build
```
It will take few minutes
Verify runner images:

```powershell
docker images
```
In the `codevyaas-judge-api` folder:

```powershell
cmd /c npm install

$env:PORT = "xxxx"
cmd /c npm run start
```

Expected output:

```text
Judge API listening on port 3002
```

CodeVyaas is designed to provide students, developers, and coding enthusiasts with a seamless environment to practice, test, and execute code from anywhere.
