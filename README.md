w# Campus Loop

Campus Loop is a college events website with online registration, a student help desk, and a password-protected admin portal.

## Run locally in VS Code

1. Extract the ZIP and open the `Campus_Loop` folder in VS Code.
2. Use Node.js 24 or newer. Open the integrated terminal and run `node start.mjs`.
3. Open http://localhost:3000 in your browser.
4. To manage events, open http://localhost:3000/admin and enter the local admin password printed in the terminal. If you want a fixed password across restarts, set the `ADMIN_PASSWORD` environment variable before launching.

No npm install is needed. The local server creates `campus-loop.sqlite` automatically and keeps registrations, edits, and help tickets between restarts. Use the localhost URL for the admin session cookie.

## Project files

- `src/index.html` — student website, event search, saved events, registration and help-desk forms.
- `src/admin.html` — admin sign-in and dashboard.
- `src/worker.js` and `src/admin-api.js` — backend routes and validation.
- `src/events.json` — sample events. Update their dates if you are demonstrating the project after the listed dates, or create a future event from the admin portal.
- `drizzle/` — SQLite/D1 database migrations.
- `build.mjs` — builds the deployable Worker under `dist/server/`.
- `start.mjs` — local Node.js server and SQLite adapter.

The hosted deployment uses a separate database and a runtime admin password. This ZIP contains source files and sample events.
