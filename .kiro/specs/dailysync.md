# DailySync — Product Specification

## Overview
DailySync is a team standup tracker web app. Team members fill a daily standup form; the app aggregates submissions into a compiled summary ready to copy-paste anywhere.

---

## Tech Stack
| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Angular (standalone components)   |
| Backend    | Node.js + Express                 |
| Database   | MongoDB + Mongoose                |
| Auth       | JWT (Bearer token)                |

---

## Feature Status

| Feature | Status |
|---------|--------|
| JWT auth (signup / login) | ✅ Done |
| Create / join team with invite code | ✅ Done |
| Daily standup form (3 prompts) | ✅ Done |
| Team feed with blocker highlights | ✅ Done |
| Submission counter | ✅ Done |
| Compiled summary + copy | ✅ Done |
| History view with date picker | ✅ Done |
| Responsive layout | ✅ Done |
| Mood / energy emoji (4th field) | ✅ Done |
| Edit window — 1 hour after submit | ✅ Done |
| Dark mode toggle | ✅ Done |
| Streak indicator (🔥 N-day streak) | ✅ Done |
| Admin: remove member | ✅ Done |
| Admin: regenerate invite code | ✅ Done |
| Admin: standup due time + late flag | ✅ Done |
| Emoji reactions on standup cards | ✅ Done |
| Blocker resolution tracking | ✅ Done |
| Export CSV | ✅ Done |
| Export PDF (print) | ✅ Done |
| Weekly digest | ✅ Done |


- Sign up with name, email, password
- Login returns JWT; stored in localStorage
- All protected routes require `Authorization: Bearer <token>`

### Teams
- Any user can create a team → gets a unique 6-char invite code
- Users join a team by entering the invite code
- A user can belong to multiple teams and switch between them
- Team creator is the **admin**
- Admin can remove members from the team
- Admin can regenerate the invite code
- Admin can set a daily **standup due time** (e.g. 10:00 AM); late submissions get a subtle "late" flag
- Team page shows member list

### Daily Standup Form
- Four fields: **Done yesterday**, **Doing today**, **Blockers**, **Mood** (optional emoji picker)
- One submission per user per team per day
- Submission is editable for **1 hour** after posting, then locked
- After the edit window closes the form becomes read-only for that day

### Mood / Energy Emoji
- Optional 4th field on the standup form
- User picks one emoji from a small set: 🚀 😊 😐 😴 🔥 🤯
- Displayed alongside the member's name in the team feed

### Team Standup Feed
- Lists all members' submissions for the selected day
- Members with **Blockers** filled are visually highlighted (orange badge)
- Shows submission count: **3 / 5 submitted**
- Unsubmitted members listed below the counter
- Each standup card shows the mood emoji next to the member's name (if set)
- Teammates can add **emoji reactions** (👍 🔥 👀) to any standup card
- Blockers can be marked **resolved**; shows a green "✅ Resolved" badge and contributes to resolution rate

### Streak Indicator
- Each member's card shows their current consecutive submission streak
- Format: **🔥 5-day streak**
- Streak resets if a member misses a day

### Compiled Summary
- Auto-generated plain-text summary of all submissions for the day
- Includes mood emoji if set
- One-click **Copy to Clipboard** button

### History View
- Date picker to browse any past day
- Shows feed + compiled summary for that date

### Export
- Export a day's or week's standups as **CSV** or **PDF**
- Weekly digest: compiled summary of the whole week

### Responsive Layout
- Mobile-first; works on desktop and mobile browsers

### Dark Mode
- Toggle between light and dark theme; preference saved in localStorage

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/team/create` | Create team, returns invite code |
| POST | `/api/team/join` | Join team via invite code |
| GET  | `/api/team/my` | List teams the current user belongs to |
| GET  | `/api/team/:teamId/members` | List team members |
| DELETE | `/api/team/:teamId/members/:userId` | Admin removes a member |
| POST | `/api/team/:teamId/regenerate-code` | Admin regenerates invite code |
| PUT  | `/api/team/:teamId/settings` | Admin updates due time |
| POST | `/api/standup` | Submit today's standup |
| PUT  | `/api/standup/:id` | Edit standup (within 1 hour of submission) |
| GET  | `/api/standup/:teamId/today` | Get today's submissions for a team |
| GET  | `/api/standup/:teamId/history?date=YYYY-MM-DD` | Get submissions for a past date |
| GET  | `/api/standup/:teamId/summary?date=YYYY-MM-DD` | Get compiled summary text |
| GET  | `/api/standup/:teamId/weekly-digest` | Get weekly summary |
| POST | `/api/standup/:id/react` | Add emoji reaction to a standup |
| PATCH | `/api/standup/:id/resolve-blocker` | Mark blocker as resolved |
| GET  | `/api/standup/:teamId/streaks` | Get streak counts per member |

---

## Database Schema

### User
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "password": "string (bcrypt hashed)",
  "teams": ["ObjectId"]
}
```

### Team
```json
{
  "_id": "ObjectId",
  "name": "string",
  "inviteCode": "string (6-char, unique)",
  "members": ["ObjectId"],
  "createdBy": "ObjectId",
  "dueTime": "string (HH:MM, optional)"
}
```

### Standup
```json
{
  "_id": "ObjectId",
  "teamId": "ObjectId",
  "userId": "ObjectId",
  "date": "string (YYYY-MM-DD)",
  "doneYesterday": "string",
  "doingToday": "string",
  "blockers": "string",
  "blockerResolved": "boolean (default false)",
  "mood": "string (emoji, optional)",
  "reactions": [{ "emoji": "string", "userId": "ObjectId" }],
  "submittedAt": "Date",
  "isLate": "boolean (default false)"
}
```
Compound unique index: `{ teamId, userId, date }`

---

## Frontend Routes (Angular)

| Path | Component | Guard |
|------|-----------|-------|
| `/login` | LoginComponent | public |
| `/signup` | SignupComponent | public |
| `/dashboard` | DashboardComponent | auth |
| `/team/:teamId` | TeamFeedComponent | auth |
| `/team/:teamId/history` | HistoryComponent | auth |

---

## Non-Functional Requirements
- Passwords hashed with bcrypt (saltRounds = 10)
- JWT expiry: 7 days
- All API errors return `{ message: "..." }` with appropriate HTTP status
- CORS enabled for Angular dev server (`localhost:4200`)
- Date logic uses `YYYY-MM-DD` strings
- Edit window: 1 hour from `submittedAt` timestamp
- Dark mode preference persisted in localStorage
