# DailySync — Build Instructions

## Project Structure
```
DailySync/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Team.js
│   │   └── Standup.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── team.js
│   │   └── standup.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    └── (Angular CLI project: dailysync-frontend)
```

---

## Backend Instructions

### Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/dailysync
JWT_SECRET=change_this_to_a_long_random_string
```

### Setup & Run
```bash
cd backend
npm install
npm run dev
```

### Key Implementation Rules
1. `auth` middleware extracts `req.user` from Bearer JWT — all protected routes use it.
2. Date field on Standup is always `YYYY-MM-DD` string from `new Date().toISOString().slice(0,10)`.
3. Invite codes: 6 uppercase alphanumeric chars via `Math.random().toString(36)`.
4. `POST /api/standup` checks for existing `{ teamId, userId, date }` — returns 409 if duplicate.
5. **Edit window**: `PUT /api/standup/:id` checks `Date.now() - standup.submittedAt < 2 * 24 * 3600000` (2 days). Returns 403 if window has passed.
6. **isLate**: on submit, if team has a `dueTime`, compare current time against it and set `isLate: true` if past due.
7. Admin check: compare `req.user.id === team.createdBy.toString()` for admin-only routes.
8. **Reactions**: `POST /api/standup/:id/react` with `{ emoji }` — toggle (add if not present, remove if already reacted with same emoji by same user).
9. **Streaks**: computed by querying consecutive days backwards from today per user.
10. **Weekly digest**: fetch standups for Mon–Sun of the current week, build same summary format.
11. Summary endpoint assembles plain-text string server-side and returns `{ summary: "..." }`.

---

## Frontend Instructions

### Setup
```bash
cd frontend
npm install
ng serve
```

### Angular Project Config
- Standalone components (Angular 17+)
- `HttpClient` via `provideHttpClient()` in `app.config.ts`
- Routing via `provideRouter(routes)` with `authGuard`
- Auth interceptor attaches JWT header automatically

### Services
| Service | Responsibility |
|---------|---------------|
| `AuthService` | login, signup, store/retrieve JWT, `isLoggedIn()` |
| `TeamService` | create, join, get members, my teams, remove member, regenerate code, update settings |
| `StandupService` | submit, edit, today feed, history, summary, react, resolve blocker, streaks, weekly digest |
| `ThemeService` | toggle dark/light mode, persist in localStorage |

### Component Behavior Rules
1. **DashboardComponent** — lists user's teams; navigate to `/team/<name>` with `{ teamId }` in router state.
2. **TeamFeedComponent** — reads `teamId` from router state (for API), team name from URL param (for display); loads feed + streaks on init; shows mood emoji, reactions, blocker resolve button, streak badge, late flag; History link passes state forward.
3. **HistoryComponent** — reads `teamId` from router state; date picker defaults to yesterday; back link passes state forward.
4. **Admin controls** — shown only if `currentUser._id === team.createdBy`; remove member button, regenerate code button, due time input.
5. **Dark mode** — `ThemeService` adds/removes `.dark` class on `<body>`; all components use CSS variables for colors.
6. **Edit window** — form shows "Edit" button only if `Date.now() - submittedAt < 3600000`; otherwise shows read-only view with "Locked" label.
7. **Mood picker** — small emoji button row: 🚀 😊 😐 😴 🔥 🤯; selected one highlighted; clears on re-click.
8. **Reactions** — row of emoji buttons below each standup card; highlight if current user has reacted; count shown.
9. **Streak** — displayed as `🔥 N` badge on member name; fetched from `/streaks` endpoint on feed load.
10. **Export** — CSV: build comma-separated string client-side and trigger download. PDF: use browser `window.print()` on a print-styled summary div.
11. **Weekly digest** — button on history page; fetches `/weekly-digest` and shows in same summary card.
12. **authGuard** — redirects to `/login` if no JWT in localStorage.

### Styling Rules
- CSS variables for theming: `--bg`, `--surface`, `--text`, `--border`, `--accent`
- `.dark` on body flips variable values
- Blocker highlight: orange left border + light orange background
- Late flag: small yellow "⏰ Late" badge on the standup card
- Resolved blocker: green "✅ Resolved" badge replaces the orange blocker badge
- Streak badge: small purple pill next to member name

---

## Build Order
1. Update Standup + Team models (new fields)
2. Backend: new routes (reactions, resolve, streaks, weekly digest, admin routes, settings)
3. Frontend: ThemeService + dark mode toggle
4. Frontend: mood picker on standup form
5. Frontend: edit window lock (2-day check)
6. Frontend: streak badges on feed
7. Frontend: reactions on standup cards
8. Frontend: blocker resolve button
9. Frontend: admin panel (remove member, regenerate code, due time)
10. Frontend: export CSV/PDF + weekly digest
