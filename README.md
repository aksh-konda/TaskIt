# TaskIt

TaskIt is a **full-stack personal productivity assistant** designed to help users manage tasks, track habits, schedule appointments, and monitor personal progress in one unified system.

The project is organized as a **monorepo** containing both the frontend application and the backend API.

TaskIt aims to serve as a foundation for building a **context-aware productivity system** that can eventually evolve into an AI-assisted personal planning tool.

---

# Repository Structure

```
taskit/
│
├── frontend/        # React + Vite frontend application
│
├── backend/         # Spring Boot REST API
│
├── docker-compose.yml
│
└── README.md
```

---

# Features

### Task Management

* Create, update, and organize tasks
* Prioritize daily activities
* Track completion status

### Habit Tracking

* Track recurring habits
* Monitor habit progress over time
* Build long-term positive routines

### Appointments

* Manage scheduled events
* Maintain a personal calendar

### Progress Monitoring

* Store and retrieve progress data
* Visualize personal growth

### Dashboard

* Unified overview of:

  * tasks
  * habits
  * upcoming appointments
  * progress metrics

---

# Tech Stack

## Frontend

* React
* Vite
* Modern component-based UI

## Backend

* Java 17
* Spring Boot
* Spring Data JPA
* PostgreSQL
* Gradle

---

# Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js (v14+)
* Java 17
* PostgreSQL
* Docker & Docker Compose (for containerised setup)

---

# Setup

## 1. Clone the Repository

```bash
git clone https://github.com/aksh-konda/TaskIt.git
cd TaskIt
```

---

# Running with Docker

The easiest way to run the entire stack locally is with Docker Compose.

## Prerequisites

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

## Start all services

```bash
docker compose up --build
```

| Service  | URL                   | Description                  |
| -------- | --------------------- | ---------------------------- |
| Frontend | http://localhost      | React app served via nginx   |
| Backend  | http://localhost:8080 | Spring Boot REST API         |
| Postgres | localhost:5432        | PostgreSQL database          |

## Stop containers

```bash
docker compose down
```

## Stop and remove the database volume

```bash
docker compose down -v
```

## Run a single service

```bash
docker compose up --build backend   # backend + postgres only
docker compose up --build frontend  # frontend only
```

## Development Mode with Hot Reload

Use the dev compose file when you want code changes to reflect quickly while developing.

```bash
docker compose -f docker-compose.dev.yml up
```

This mode runs:

| Service  | URL                   | Dev behavior |
| -------- | --------------------- | ------------ |
| Frontend | http://localhost:5173 | Vite dev server with HMR |
| Backend  | http://localhost:8080 | `bootRun --continuous` with source mounted |
| Postgres | localhost:5432        | Same database container as standard compose |

The backend loads a small set of dummy tasks automatically in this docker dev mode so the UI has sample content on first start.

Stop dev mode:

```bash
docker compose -f docker-compose.dev.yml down
```

Stop dev mode and remove database volume:

```bash
docker compose -f docker-compose.dev.yml down -v
```

### Makefile shortcuts

You can use root-level Make targets instead of typing full Docker Compose commands:

```bash
make dev
make dev-front
make dev-back
make dev-down
make dev-reset
make dev-logs
make prod
make prod-down
```

---

# Running the Backend

```
cd backend
./gradlew bootRun
```

### Authentication (JWT)

TaskIt backend now uses stateless JWT auth with refresh tokens.

Auth endpoints:

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"changeme123","displayName":"You"}'

curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"changeme123"}'
```

Use the access token for API requests:

```bash
curl -X GET http://localhost:8080/tasks \
  -H "Authorization: Bearer <access_token>"
```

JWT configuration (override via env vars):

```bash
export APP_JWT_ISSUER=taskit
export APP_JWT_SECRET="replace-with-long-random-secret"
export APP_JWT_ACCESS_TTL_SECONDS=900
export APP_JWT_REFRESH_TTL_SECONDS=1209600
```

### Spring AI Configuration (Gemini)

TaskIt backend uses Spring AI with Google Gemini for task planning.

For Docker Compose, copy [.env.example](.env.example) to `.env` in the repository root and fill in your API key. Docker Compose will automatically read that file.

Set these environment variables before running the backend locally:

```bash
export SPRING_AI_MODEL_CHAT=google-genai
export SPRING_AI_GOOGLE_GENAI_API_KEY=your_api_key
```

Optional overrides:

```bash
export SPRING_AI_GOOGLE_GENAI_CHAT_MODEL=gemini-3-flash-preview
export SPRING_AI_GOOGLE_GENAI_CHAT_TEMPERATURE=0.2
```

Generate an AI plan:

```bash
curl -X POST http://localhost:8080/ai/plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"dateTime":"2026-04-02T09:00:00"}'
```

When running with `make dev` or `make dev-back`, set the same variables in your shell or `.env` file so the backend container receives them.

Required env changes:

* Remove the OpenAI variables: `SPRING_AI_OPENAI_API_KEY`, `SPRING_AI_OPENAI_CHAT_ENABLED`, `SPRING_AI_OPENAI_CHAT_MODEL`, `SPRING_AI_OPENAI_CHAT_TEMPERATURE`, `SPRING_AI_OPENAI_BASE_URL`
* Add Gemini variables: `SPRING_AI_MODEL_CHAT`, `SPRING_AI_GOOGLE_GENAI_API_KEY`, `SPRING_AI_GOOGLE_GENAI_CHAT_MODEL`, `SPRING_AI_GOOGLE_GENAI_CHAT_TEMPERATURE`
* If you are using Google AI Studio, `SPRING_AI_GOOGLE_GENAI_API_KEY` is the key you need; no base URL is required

### Database Setup

Create a PostgreSQL database and user:

```sql
CREATE DATABASE taskit;
CREATE USER taskit WITH PASSWORD 'taskit';
GRANT ALL PRIVILEGES ON DATABASE taskit TO taskit;
```

Database settings can be changed in:

```
backend/src/main/resources/application.properties
```

---

# Running the Frontend

```
cd frontend
npm install
npm run dev
```

The frontend will start the development server and connect to the backend API.

---

# Development

Each service can be developed independently:

| Service  | Description                  |
| -------- | ---------------------------- |
| frontend | React UI and client logic    |
| backend  | REST APIs and database layer |

---

# Screenshots

(coming soon)

---

# Architecture

(coming soon)

---

# Future Improvements

* AI-assisted task planning
* Smart habit insights
* Calendar integrations
* Notification and reminder system
* Advanced progress analytics

---

# License

This project is licensed under the MIT License.
