# Elliot Runs On Tech (`elliotrunsontech.com`)

Official launchpad and web portfolio for applications, multiplayer arcade games, and digital experiments built by Elliot.

## ✨ Adding a New App in 30 Seconds

1. Open [`src/data/apps.json`](./src/data/apps.json).
2. Add your new project object inside the `"liveApps"` array (or update an entry in `"comingSoonApps"`).
3. Run the automated safety check and publish to GitHub Pages:

```bash
npm.cmd run deploy
```

## 🛠️ Local Development Commands

- **Start local dev preview**:
  ```bash
  npm.cmd run dev
  ```
- **Run automated safety & privacy tests (Vitest)**:
  ```bash
  npm.cmd run test:run
  ```
- **Format & lint code (Prettier & ESLint)**:
  ```bash
  npm.cmd run format
  npm.cmd run lint
  ```
- **Build production static bundle (`dist/`)**:
  ```bash
  npm.cmd run build
  ```
