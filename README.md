# Attendance Management System

A Spring Boot REST API and web UI for managing students, courses and daily attendance, including per-student attendance percentages.

## Tech Stack

- Java 17
- Spring Boot 3.3 (Web, Data JPA, Validation)
- H2 in-memory database for development, MySQL for production
- Maven

## Project Structure

```
attendance-management-system/
├── pom.xml
├── README.md
├── .gitignore
└── src/
    ├── main/
    │   ├── java/com/example/attendance/
    │   │   ├── AttendanceManagementApplication.java
    │   │   ├── controller/    # REST endpoints
    │   │   ├── service/       # Business logic
    │   │   ├── repository/    # Spring Data JPA repositories
    │   │   ├── model/         # JPA entities and enums
    │   │   ├── dto/           # Request / response objects
    │   │   └── exception/     # Custom exceptions and global handler
    │   └── resources/
    │       ├── application.properties
    │       ├── application-prod.properties
    │       └── static/        # Web UI (plain HTML/CSS/JS, no build step)
    │           ├── index.html
    │           ├── css/       # tokens, layout, components, page styles
    │           ├── fonts/     # Public Sans and Young Serif (OFL), self-hosted
    │           └── js/        # api, session, router, ui/ components, pages/
    └── test/
        └── java/com/example/attendance/
```

## Getting Started

### Prerequisites

- JDK 17 or newer
- Maven 3.9+

### Run locally

```bash
mvn spring-boot:run
```

The API starts on `http://localhost:8080`. In the default profile the data lives in memory and resets on every restart. The H2 console is available at `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:attendancedb`, user `sa`, empty password).

### Web UI

Open `http://localhost:8080/` and sign in. On localhost the login page has buttons that fill in the seeded demo accounts (see `SYSTEM_DOCUMENTATION.md`, section 9).

| Role | What they can do |
|------|------------------|
| Admin | Manage users, courses, semesters, sections and enrollments (including CSV upload); take attendance; view class reports |
| Teacher | Take attendance for their own sections; view class reports and per-student history; download a CSV |
| Student | See attendance percentage per course against the 75% line, and the day-by-day history |

The UI is static files served by Spring Boot itself, so there is nothing extra to install or build. After editing files under `src/main/resources/static`, restart the app (or run `mvn process-resources`) and refresh. More detail is in section 15 of `SYSTEM_DOCUMENTATION.md`.

### Run tests

```bash
mvn test
```

### Run with MySQL (prod profile)

Create the database, then provide credentials through environment variables:

```bash
export DB_URL=jdbc:mysql://localhost:3306/attendance_db
export DB_USERNAME=your_user
export DB_PASSWORD=your_password
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

The prod profile uses `ddl-auto=validate`, so create the schema first (for example by running once with `update`, or by adding Flyway migrations).

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/students` | Create a student |
| GET | `/api/students` | List students |
| GET | `/api/students/{id}` | Get a student |
| GET | `/api/students/me` | The signed-in student's own record (student role) |
| PUT | `/api/students/{id}` | Update a student |
| DELETE | `/api/students/{id}` | Delete a student |
| POST | `/api/courses` | Create a course |
| GET | `/api/courses` | List courses |
| GET | `/api/courses/{id}` | Get a course |
| POST | `/api/attendance` | Mark attendance for a student in a course on a date |
| GET | `/api/attendance/course/{courseId}?date=YYYY-MM-DD` | Class register for a course on a date |
| GET | `/api/attendance/student/{studentId}/course/{courseId}` | A student's records in a course |
| GET | `/api/attendance/student/{studentId}/course/{courseId}/summary` | Attendance percentage |

Attendance status is one of `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`. `PRESENT` and `LATE` count as attended when calculating the percentage. Only one record is allowed per student, course and date.

### Example requests

```bash
# Create a student
curl -X POST localhost:8080/api/students -H "Content-Type: application/json" \
  -d '{"rollNumber":"CS001","name":"Asha Rao","email":"asha@example.com"}'

# Create a course
curl -X POST localhost:8080/api/courses -H "Content-Type: application/json" \
  -d '{"code":"CS301","name":"Operating Systems"}'

# Mark attendance
curl -X POST localhost:8080/api/attendance -H "Content-Type: application/json" \
  -d '{"studentId":1,"courseId":1,"date":"2026-10-26","status":"PRESENT"}'

# Get the attendance percentage
curl localhost:8080/api/attendance/student/1/course/1/summary
```

Errors are returned as RFC 7807 problem responses: `400` for validation failures, `404` for missing resources, `409` for duplicates.

## Roadmap

- [ ] Authentication and roles (admin, teacher, student) with Spring Security
- [ ] Course enrollment, so attendance can only be marked for enrolled students
- [ ] Bulk attendance marking for a whole class
- [ ] Low-attendance reports and CSV export
- [ ] Database migrations with Flyway
- [ ] OpenAPI / Swagger documentation
- [ ] Service and controller tests

## License

Add a license of your choice.
