# Task Tracker App Structure

This repo is split into `frontend/` and `backend/`.

```
task-tracker-app/
├── backend/                # Node.js + Express
│   ├── config/             # Database connection logic
│   ├── controllers/        # Logical reasoning: Logic separated from routes
│   ├── middleware/         # Auth & error handlers
│   ├── models/             # Mongoose schemas (User, Task) [cite: 13, 14]
│   ├── routes/             # API endpoints [cite: 18]
│   └── server.js           # Entry point
└── frontend/               # React + Vite
    ├── src/
    │   ├── components/     # Reusable UI elements (Modals, Buttons)
    │   ├── context/        # State management (AuthContext)
    │   ├── pages/          # Full pages (Dashboard, Login)
    │   └── services/       # Axios API calls
```
