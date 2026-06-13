# ⚡ DailySync

> Team standup tracker — fill 3 prompts, share a clean summary anywhere.

## Quick Start

### 1. Backend
```bash
cd backend
npm install
# edit .env — set MONGO_URI and JWT_SECRET
npm run dev
# runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
ng serve
# runs on http://localhost:4200
```

> MongoDB must be running locally, or update `MONGO_URI` in `backend/.env` to your Atlas URI.

## Project Structure
```
DailySync/
├── backend/
│   ├── models/        User, Team, Standup
│   ├── routes/        auth, team, standup
│   ├── middleware/    JWT auth
│   └── server.js
└── frontend/
    └── src/app/
        ├── pages/     home, login, signup, dashboard, team-feed, history
        ├── services/  auth, team, standup
        ├── guards/    authGuard
        └── interceptors/ authInterceptor
```

## Features
- JWT auth (signup / login)
- Create team → get invite code; join via code
- Daily standup form (Done / Today / Blockers) — locked after midnight
- Team feed with blocker highlights and submission counter
- Auto-compiled copy-paste summary
- History browser with date picker
- Responsive (mobile + desktop)
