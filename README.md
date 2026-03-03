# Task Tracker Dashboard

Full-stack task management application with authentication, tasks, calendar/focus tracking, notifications, and admin capabilities.


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
- Vercel account (backend)

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

## 4. Deploy Backend (cercel)

1. Push latest code to GitHub.
2. In Vercel: New + > project.
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

## 4. Useful Commands

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

## 07 Common Issues

- `CORS error`: set correct `CLIENT_URL` on backend env and redeploy backend.
- `Network error from frontend`: ensure `VITE_API_URL` points to deployed backend URL.
- `Mongo connection failed`: verify Atlas IP/network + credentials in `MONGO_URI`.
- `Blank page on refresh`: ensure `frontend/vercel.json` rewrite is present (already included).

---

Maintainer: Ghaffar0610
