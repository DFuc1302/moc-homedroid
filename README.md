# Focus

An English-language Pomodoro timer and task list. It runs entirely in the browser, with no account, external services, or dependencies.

## Features

- 25-minute focus timer, 5-minute short break, and 15-minute long break.
- Automatically switches to a long break after every 4 focus sessions.
- Tasks, completed sessions, and the light/dark theme are saved in `localStorage`.
- Responsive on phones and computers.

## Run locally

Because the app uses ES modules, serve the directory over HTTP:

```bash
python -m http.server 4173
```

Open `http://localhost:4173`. Check the timer logic:

```bash
node timer.test.mjs
```

## Deploy with HomeDroid

HomeDroid deploys from a Git repository. Push this directory to a GitHub repository, then open **Dashboard → Deployments → New deployment** and enter:

| Field | Value |
| --- | --- |
| Repository | Repository HTTPS URL |
| Branch | `main` |
| Port | `4173` (or an available port from 1024–65535) |
| Runtime | `Static` or `Auto` |
| Build command | leave blank |
| Start command | leave blank |

HomeDroid detects the project as a static site and serves it directly with Caddy. Open it at `http://<phone-IP>:4173`.

> Data stays in each browser's `localStorage`, so it does not sync across devices.
