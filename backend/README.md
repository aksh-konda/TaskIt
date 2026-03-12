# TaskIt — Backend API

Spring Boot REST API for the TaskIt personal productivity assistant. Part of the [TaskIt monorepo](../README.md).

## Overview

Provides CRUD APIs for managing tasks, habits, appointments, and progress data, backed by a PostgreSQL database.

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

## License

MIT License
