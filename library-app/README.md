# The Reading Room — Library Management System

React + Express + MySQL library application. The existing interface, layout and styling have been preserved. Application records are stored in MySQL through the Express API; browser localStorage is not used as a data store.

## Assignment coverage
- React hooks and reusable components; React Router navigation.
- Dashboard stock totals and low-stock warning for fewer than two copies.
- Book add, edit and delete with validation.
- Stock-in and borrowing transactions, stock adjustment and history.
- Login, member management, and membership request approval.
- Express REST API, JSON middleware, CORS and MySQL integration.

## Requirements
- Node.js and npm
- MySQL Server running on this PC
- VS Code (recommended)

## Setup on Windows / VS Code

### 1. Configure MySQL credentials
Open `backend/.env.example`. Copy it to a new file named `.env` in the same `backend` folder. In VS Code, right-click `backend` > **New File** > type `.env`, then copy the settings below and replace the password with the password for your MySQL account:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_REAL_MYSQL_PASSWORD
DB_NAME=reading_room
```

If your MySQL root account has no password, use `DB_PASSWORD=`. Do not type the placeholder `YOUR_REAL_MYSQL_PASSWORD` as the actual password.

### 2. Start the backend
In VS Code, open Terminal > New Terminal. Run:

```powershell
cd library-app\backend
npm.cmd install
npm.cmd run seed
npm.cmd start
```

The backend creates the `reading_room` database and its tables automatically at startup. **You do not need `schema.sql` or to run SQL manually.** Keep this terminal open. If you see `Access denied for user 'root'`, correct `DB_PASSWORD` in `backend/.env` and restart the backend.

The seed command creates a starter admin and sample books:
- Membership ID: `901020581`
- Password: `NTLAMA`

This is a demo account. Change the password before using the application for real users.

Check database connectivity at `http://localhost:5000/api/health`. A successful response contains `"status":"ok"` and `"database":"connected"`.

### 3. Start the React frontend
Open a **second** VS Code terminal:

```powershell
cd library-app\frontend
npm.cmd install
npm.cmd run dev
```

Open the local address Vite prints, usually `http://localhost:5173`.

## Important
- Do not close the backend terminal while using the frontend.
- MySQL Server must be running.
- The app intentionally shows a connection error instead of silently saving records in browser localStorage if the backend/database is unavailable.
- The assignment brief asks for a GitHub repository containing both `frontend/` and `backend/`; upload this project to GitHub when you finish testing.
- This is a coursework/demo system. Production use would require stronger session-based authentication and server-side role authorization.
