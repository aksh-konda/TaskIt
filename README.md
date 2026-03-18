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
