# ⚡ DailySync

> Team standup tracker — submit daily standups, share a polished summary, and keep a team-facing history.

## What This Project Does

DailySync helps distributed teams capture daily standup updates with a simple form, stores submissions per team and date, and aggregates them into a clean summary for easy sharing.

Key capabilities:
- login/signup with JWT auth
- create or join teams via invite code
- submit daily standups with progress, plans, blockers, and mood
- view team feed with blocker status, late flags, reactions, and streaks
- edit standups within a limited window
- export summaries as CSV or print-friendly PDF
- browse past days and weekly digests
- admin team settings for member management and due time

## Tech Stack

- Frontend: Angular standalone components, `HttpClient`, `Router`, `FormsModule`
- Backend: Node.js, Express, JWT-secured REST API
- Database: MongoDB with Mongoose models
- Deployment: Vercel for frontend hosting, local or cloud MongoDB for backend storage

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
    ├── src/app/
    │   ├── pages/     home, login, signup, dashboard, team-feed, history
    │   ├── services/  auth, team, standup, theme
    │   ├── guards/    authGuard
    │   └── interceptors/ authInterceptor
    ├── angular.json
    ├── package.json
    └── tsconfig.json
```

## Live Demo
- https://daily-sync-two.vercel.app/

## Features
- JWT auth (signup / login)
- Create or join teams using a 6-character invite code
- Daily standup form with Done / Today / Blockers / Mood fields
- Standups editable for up to 2 days after submission
- Team feed with blocker highlights, late flags, reactions, streaks, and submission counter
- Admin controls for member removal, invite code regeneration, and daily due time settings
- Auto-generated compiled summary with copy-to-clipboard
- Export CSV and print/PDF summary support
- History view with date picker and weekly digest summary
- Dark mode toggle and responsive UI for mobile and desktop
