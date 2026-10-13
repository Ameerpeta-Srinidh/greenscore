# GreenScore Pro

A simplified sellable version of GreenScore with a React frontend and one lightweight Node.js backend.

## Project Structure

```text
greenscore-pro/
  frontend/
  backend/
```

## What Is Included

- React frontend with a polished form and dashboard
- Express backend with one simple calculation API
- Chart-based breakdown for a more product-like feel
- Environment examples for easy local setup or handoff
- Lockfiles included for consistent installs

## Environment Variables

Create optional `.env` files if you want to change local ports or point the frontend to a deployed API.

`backend/.env`

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
```

`frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api/calculate
```

## Run the backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:5000`.

## Run the frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:5173`.

## Best Fit

This version is ideal for portfolio buyers, freelance delivery, or small client demos that need a frontend and backend but do not need authentication or a database.
