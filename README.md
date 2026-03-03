# Task Tracker Dashboard

Full-stack task management application with authentication, tasks, calendar/focus tracking, notifications, and admin capabilities.

## Deliverables Checklist
- [x] GitHub repository with frontend and backend code
- [x] Root `README.md` with complete setup and deployment instructions
- [ ] Deployed frontend URL
- [ ] Deployed backend URL
- [ ] UI screenshots added in repo

After deployment, replace placeholder links in this README and check all boxes.

## Repository Structure

```text
.
|-- backend/
|-- frontend/
|-- image/
|-- ENVIRONMENT.md
```

## Tech Stack
- Frontend: React 19, Vite, TailwindCSS, React Router
- Backend: Node.js, Express, MongoDB, JWT
- File upload: Multer

## Prerequisites
- Node.js 18+ (recommended 20 LTS)
- npm
- MongoDB Atlas connection string
- GitHub account
- Vercel account (frontend)
- Render account (backend)

## 1. Clone and Install

```bash
git clone https://github.com/Ghaffar0610/task-tracker-dashboard.git
cd task-tracker-dashboard
```

### Backend install

```bash
cd backend
npm install
```

### Frontend install

```bash
cd ../frontend
npm install
```

## 2. Environment Setup

### Backend env (`backend/.env`)
Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin123@gmail.com
```

Notes:
- `CLIENT_URL` can contain one or more origins separated by commas in production.
- Example production value:
  `CLIENT_URL=https://your-frontend.vercel.app,https://www.yourdomain.com`

### Frontend env (`frontend/.env.local`)
Create `frontend/.env.local` from `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:5000
```

## 3. Run Locally

Open 2 terminals.

### Terminal 1: backend

```bash
cd backend
npm run dev
```

Backend health checks:
- `GET http://localhost:5000/`
- `GET http://localhost:5000/health`

### Terminal 2: frontend

```bash
cd frontend
npm run dev
```

App URL:
- `http://localhost:5173`

## 4. Deploy Backend (Render)

1. Push latest code to GitHub.
2. In Render: New + > Web Service.
3. Connect repository: `Ghaffar0610/task-tracker-dashboard`.
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables:
   - `PORT=5000`
   - `MONGO_URI=...`
   - `JWT_SECRET=...`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - `ADMIN_EMAIL=...`
6. Deploy.
7. Verify:
   - `https://your-backend.onrender.com/health` returns `{ "ok": true }`.

Set deployed backend URL here:
- Backend URL: `https://<your-backend-url>`

## 5. Deploy Frontend (Vercel)

1. In Vercel: Add New > Project.
2. Import repository: `Ghaffar0610/task-tracker-dashboard`.
3. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable:
   - `VITE_API_URL=https://<your-backend-url>`
5. Deploy.
6. Open deployed app and test login/register + task APIs.

Set deployed frontend URL here:
- Frontend URL: `https://<your-frontend-url>`

## 6. Connect CORS for Production

After frontend is deployed:
1. Go to backend hosting env vars.
2. Update `CLIENT_URL` to your exact frontend origin.
3. Redeploy backend.

If you use multiple frontend domains, comma-separate them:

```env
CLIENT_URL=https://your-frontend.vercel.app,https://www.yourdomain.com
```

## 7. Capture and Add Screenshots

Capture these screens from the deployed frontend:
- Login page
- Register/Forgot Password page
- Dashboard
- Tasks page
- Calendar page
- Settings/Admin page (if role-based)

Save images in repo, for example:

```text
image/ui/login.png
image/ui/dashboard.png
image/ui/tasks.png
image/ui/calendar.png
image/ui/settings.png
```

Then add them to README:

```md
## UI Screenshots

### Login
![Login](image/ui/login.png)

### Dashboard
![Dashboard](image/ui/dashboard.png)

### Tasks
![Tasks](image/ui/tasks.png)

### Calendar
![Calendar](image/ui/calendar.png)
```

## 8. Final Submission Format

Submit these 5 items:
1. GitHub repository link
2. README with setup + deployment + screenshots
3. Deployed frontend URL
4. Deployed backend URL
5. Screenshot section in README

Example:
- Repo: `https://github.com/Ghaffar0610/task-tracker-dashboard`
- Frontend: `https://<your-frontend-url>`
- Backend: `https://<your-backend-url>`

## 9. Useful Commands

From `backend/`:

```bash
npm run dev
npm start
```

From `frontend/`:

```bash
npm run dev
npm run build
npm run preview
```

## 10. Common Issues

- `CORS error`: set correct `CLIENT_URL` on backend env and redeploy backend.
- `Network error from frontend`: ensure `VITE_API_URL` points to deployed backend URL.
- `Mongo connection failed`: verify Atlas IP/network + credentials in `MONGO_URI`.
- `Blank page on refresh`: ensure `frontend/vercel.json` rewrite is present (already included).

---

Maintainer: Ghaffar0610
