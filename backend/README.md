# TaskIt - Backend API

## Overview
TaskIt is a Spring Boot backend that powers the TaskIt personal assistant app. It provides APIs for managing tasks, habits, appointments, and progress data in a PostgreSQL database.

## Features
- **Task Management** - CRUD APIs for organizing and prioritizing tasks
- **Habit Tracking** - Track habits and progress over time
- **Appointments** - Manage calendar events and reminders
- **Progress Monitoring** - Store and retrieve progress insights
- **Dashboard Data** - Aggregate data for a unified overview

## Tech Stack
- Java 17
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Gradle

## Getting Started
### Prerequisites
- Java 17
- PostgreSQL

### Database Setup
Create a database and user that match the default configuration:

```sql
CREATE DATABASE taskit;
CREATE USER taskit WITH PASSWORD 'taskit';
GRANT ALL PRIVILEGES ON DATABASE taskit TO taskit;
```

You can change these defaults in `src/main/resources/application.properties`.

### Installation
```bash
git clone https://github.com/yourusername/taskit-backend.git
cd taskit-backend
```

### Running the Application
```bash
./gradlew bootRun
```

By default, the app runs with the `dev` profile and uses `create-drop` for the schema. Update the active profile or JPA settings in `src/main/resources/application.properties` if needed.

### Running Tests
```bash
./gradlew test
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
