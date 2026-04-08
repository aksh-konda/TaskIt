# TaskIt — Backend API

Spring Boot REST API for the TaskIt personal productivity assistant. Part of the [TaskIt monorepo](../README.md).

## Overview

Provides CRUD APIs for managing tasks, habits, appointments, and progress data, backed by a PostgreSQL database.

## Security

The API is secured with stateless JWT access tokens and refresh tokens. All non-auth endpoints require:

```
Authorization: Bearer <access_token>
```

JWT config (override with env vars):

```bash
export APP_JWT_ISSUER=taskit
export APP_JWT_SECRET="replace-with-long-random-secret"
export APP_JWT_ACCESS_TTL_SECONDS=900
export APP_JWT_REFRESH_TTL_SECONDS=1209600
```

Auth endpoints:

```bash
curl -X POST http://localhost:8080/auth/register \
	-H "Content-Type: application/json" \
	-d '{"email":"you@example.com","password":"changeme123","displayName":"You"}'

curl -X POST http://localhost:8080/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"you@example.com","password":"changeme123"}'
```

## Tech Stack

- Java 17
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Gradle

## Prerequisites

- Java 17
- PostgreSQL

## Database Setup

Create a database and user matching the default configuration:

```sql
CREATE DATABASE taskit;
CREATE USER taskit WITH PASSWORD 'taskit';
GRANT ALL PRIVILEGES ON DATABASE taskit TO taskit;
```

Defaults can be changed in `src/main/resources/application.properties`.

## Running

From the monorepo root:

```bash
cd backend
./gradlew bootRun
```

By default the app runs with the `dev` profile using `create-drop` for the schema.

## Testing

```bash
./gradlew test
```

GenAI integration test (optional):

```bash
export SPRING_AI_GOOGLE_GENAI_API_KEY=your_api_key
./gradlew test --tests "com.iamak.taskit.GenAiIntegrationTests"
```

Context tests use Testcontainers for Postgres and do not require GenAI credentials.

## License

MIT License
