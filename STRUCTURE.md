# Task Tracker App Structure

This repo is split into `backend/` and `task-tracker/` (frontend).

```
task_tracker_dashboard/
|- backend/                 # Node.js + Express API
|  |- config/               # Database connection logic
|  |- controllers/          # Request handlers
|  |- middleware/           # Auth & error handlers
|  |- models/               # Mongoose schemas (User, Task)
|  |- routes/               # API endpoints
|  |- package.json
|  `- server.js             # Entry point
|
`- task-tracker/            # React + Vite frontend
   |- public/
   |- src/
   |  |- assets/
   |  |- components/
   |  |- context/
   |  `- pages/
   |- index.html
   |- package.json
   `- vite.config.js
```
