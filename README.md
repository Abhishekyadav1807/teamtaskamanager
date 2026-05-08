# PulseBoard - Team Task Manager (MERN)

PulseBoard is a collaborative task manager I built to simulate a real team workflow with role-based controls.
The flow is intentionally straightforward: project -> members -> tasks -> tracking, while still handling practical access checks.

## Tech Stack
- Frontend: React (Vite), React Router, Axios, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT (Bearer token)
- Deployment target: Railway (frontend + backend services)

## Features Implemented
- Signup/Login with validation and secure password hashing
- Project creation (creator automatically becomes Admin)
- Admin can add/remove members by email
- Task creation with title, description, due date, priority, assignee
- Task status updates (`To Do`, `In Progress`, `Done`)
- Role-based behavior:
  - Admin: manage project members and all project tasks
  - Member: view and update only assigned tasks
- Dashboard metrics:
  - Total tasks
  - Tasks by status
  - Tasks per user
  - Overdue tasks
- Responsive UI with clean cards, charts, and loading/error feedback

## What I Focused On
- Practical server-side RBAC checks (not just frontend hiding)
- Clear API mapping between backend endpoints and UI actions
- Immediate dashboard refresh after task updates
- Mobile-friendly layout and readable visual hierarchy

## Data Model (Summary)
- `User`: name, email, password hash
- `Project`: name, description, creator, members[] with role (`Admin`/`Member`)
- `Task`: title, description, due date, priority, status, project, assignee, creator

## Local Setup
1. Install dependencies
```bash
npm install
npm install --workspace backend
npm install --workspace frontend
```

2. Configure environment
- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

3. Run both services
```bash
npm run dev
```
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## API Summary
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/projects`
- `POST /api/projects`
- `POST /api/projects/:projectId/members`
- `DELETE /api/projects/:projectId/members/:userId`
- `GET /api/tasks/:projectId`
- `POST /api/tasks/:projectId`
- `PATCH /api/tasks/:projectId/:taskId`
- `GET /api/dashboard`

## Railway Deployment
Deploy as 2 services from the same GitHub repository.

### Backend Service
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Required env vars:
  - `MONGO_URI` = MongoDB Atlas or other Mongo URI
  - `JWT_SECRET` = strong random secret
  - `CLIENT_URL` = Railway frontend URL
  - `NODE_ENV` = `production`
  - `PORT` is provided by Railway

### Frontend Service
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
- Required env vars:
  - `VITE_API_URL` = `https://<your-backend-domain>/api`

## Manual Verification Flow
1. Create two users from Signup (User A and User B)
2. Login as User A, create a project
3. Add User B to the project using User B email
4. Create and assign tasks to User B
5. Login as User B and update assigned task status
6. Confirm dashboard metrics change accordingly

## Submission Checklist
- Live frontend URL
- Working backend URL/API
- GitHub repository
- README with setup + deployment
- 2-5 minute demo video

## Suggested Demo Script (2-5 min)
1. Signup two users (Admin + Member)
2. Admin creates project and adds Member by email
3. Admin creates and assigns tasks
4. Member logs in and updates assigned task status
5. Show dashboard metrics including overdue count

## Known Tradeoffs
- No notifications yet for assignment changes
- No task comments/attachments yet
- Search/filter/sort can be expanded further
