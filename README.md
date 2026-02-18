# Casino Game — Next.js

Frontend and API migrated from Laravel to Next.js. The game server (Socket.io) remains in `../server/app.js` and should call this Next.js app by its base URL.


## Contact for support or suggestions

**Telegram:** [@crypmancer](https://t.me/crypmancer)


## Reference images

UI reference screenshots for the main game views:

| Game / View | Screenshot |
|-------------|------------|
| **Dashboard** | ![Dashboard](refference%20images/dashboard.png) |
| **Crash** | ![Crash](refference%20images/crash.png) |
| **X100** | ![X100](refference%20images/x100.png) |
| **Dice** | ![Dice](refference%20images/dice.png) |
| **Keno** | ![Keno](refference%20images/keno.png) |
| **Mines** | ![Mines](refference%20images/mines.png) |

---

## Project guide

### Overview

- **Stack:** Next.js 14, React 18, Prisma, NextAuth, Socket.io client.
- **Backend:** This app serves the frontend and REST API; the separate Node game server (`../server`) handles real-time game logic and calls these APIs.

### Requirements

- Node.js 18+
- MySQL (same DB as Laravel, or a new one with Prisma migrations)
- Redis (optional, for balance history and chat)

### 1. Setup

```bash
cd next-app
cp .env.example .env
# Edit .env: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, and optionally game server / Redis URLs
npm install
npx prisma generate
```

### 2. Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string (e.g. `mysql://user:password@localhost:3306/goldenx_casino`) |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Secret for NextAuth (e.g. `openssl rand -base64 32`) |
| `NEXT_PUBLIC_SOCKET_URL` | Game server WebSocket URL |
| `GAME_SERVER_BASE_URL` | Game server HTTP base URL |
| `REDIS_URL` | Optional Redis URL |

### 3. Database

Uses the same MySQL as Laravel. Tables must match the Prisma schema. If tables do not exist yet:

```bash
npx prisma db push
```

To create a user: use site registration or manually hash the password (bcrypt) and insert into `users`.

### 4. Running the app

```bash
# Development
npm run dev
# Open http://localhost:3000

# Production
npm run build
npm start
```

### 5. Game server (Node)

From the project root, run the existing server:

```bash
cd ../server
node app.js
```

In `server/app.js`, set `domain` (or `API_BASE_URL`) to the Next.js base URL, e.g.:

```js
domain = 'http://localhost:3000';  // or https://yourdomain.com
```

Then requests like `domain + '/generate_number_x30'`, `domain + '/winwheel'`, `domain + '/wincrash'`, etc. will go to the Next.js API.

### 6. API (Next.js routes)

| Method + Path | Purpose |
|---------------|---------|
| `POST /api/auth/register` | Registration |
| `POST /api/auth/[...nextauth]` | NextAuth (login/logout) |
| `POST /api/balance/get` | Current balance |
| `POST /api/change/balance` | Switch balance type (real/demo) |
| `POST /api/wheel/get`, `POST /api/wheel/bet` | Wheel |
| `POST /api/crash/get`, `POST /api/crash/bet` | Crash |
| `POST /api/chat/get`, `POST /api/chat/send` | Chat |
| `GET /api/generate_number_x30`, `GET /api/winwheel` | Game server (wheel) |
| `GET /api/generate_number_x100`, `GET /api/winx100` | X100 |
| `GET /api/wincrash` | Crash round end |

Other games (Keno, Jackpot, Mines, Coin, Shoot, etc.) follow the same pattern; see `CONVERSION-TO-NEXTJS.md` in the project root for the full list.

---
