# GreenScore+

A carbon footprint tracking application that uses AI to parse natural language activity descriptions and calculate carbon emissions. Track your daily activities, set monthly goals, and monitor your GreenScore.

## Project Structure

```
greenscore/
├── frontend/       # React + Vite frontend application (Dockerized)
├── backend/        # Node.js + Express backend API (Dockerized)
└── ai_service/     # Python FastAPI service for AI text parsing (Dockerized)
```

## Features

- 🔐 **Secure Authentication**: JWT-based auth with input validation.
- 🤖 **AI-Powered**: Uses local LLM (Ollama) to parse natural language activities.
- 📊 **Analytics**: Interactive charts for emission breakdown and trends.
- 🐳 **Dockerized**: specific Dockerfiles for each service and Docker Compose for orchestration.
- 🛡️ **Robust**: Input validation (Joi), global error handling, and centralized config.

## Prerequisites

- **Docker** and **Docker Compose**
- **Ollama** with `llama3:8b` model installed (running on host)
  - `ollama pull llama3:8b`
  - Ensure Ollama is running (`ollama serve`).

## Quick Start (Docker)

1.  Start all services:
    ```bash
    docker-compose up --build
    ```
2.  Open the application:
    - Frontend: `http://localhost:5173`
    - Backend API: `http://localhost:5000`
    - AI Service: `http://localhost:8000`

## Manual Setup (Dev)

### 1. Backend

```bash
cd backend
npm install
npm start
```
Runs on `http://localhost:5000`.

### 2. AI Service

```bash
cd ai_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Runs on `http://localhost:8000`.
**Note**: Set `OLLAMA_URL` env var if Ollama is not on default localhost port.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

## Technology Stack

- **Frontend**: React 19, Vite, Chart.js, React Router, Context API
- **Backend**: Node.js, Express, MongoDB, Mongoose, Joi (Validation)
- **AI Service**: Python, FastAPI, Ollama (LLM)
- **DevOps**: Docker, Nginx (frontend prod)

## API Endpoints

- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /activity/ai-text` - Add activity via AI
- `GET /dashboard/:userId` - Get analytics
