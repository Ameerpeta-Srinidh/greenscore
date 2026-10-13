# GreenScore Premium

A cleaner premium version of GreenScore with React, Node.js, MongoDB, authentication, saved entries, and a richer dashboard.

## Project Structure

```text
greenscore-premium/
  frontend/
  backend/
  docker-compose.yml
```

## What Is Included

- React frontend with login, signup, and dashboard views
- Express backend with JWT authentication
- MongoDB persistence for saved carbon entries
- Environment examples for frontend and backend
- Optional Docker setup for MongoDB only
- Lockfiles included for consistent installs

## Environment Variables

Create a `.env` file inside `backend/` based on `.env.example`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/greenscore_premium
JWT_SECRET=replace-with-a-long-secret
FRONTEND_URLS=http://localhost:5173
```

Create an optional `.env` file inside `frontend/` if the API is not running on the default local address.

```env
VITE_API_URL=http://localhost:5000/api
```

## Option A: Run MongoDB locally

Make sure MongoDB is running on `mongodb://127.0.0.1:27017`.

## Option B: Run MongoDB with Docker

```bash
docker-compose up -d
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

## Included Features

- Login and signup
- Saved carbon entries in MongoDB
- Dashboard with charts and recent history
- Simple, readable project structure

## Best Fit

This version is ideal for higher-value client delivery, showcase projects, or buyers who want a cleaner full-stack product with persistence and authentication.
