# Student Attendance Management System
## Complete System Documentation

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database & Data Models](#4-database--data-models)
5. [Authentication System](#5-authentication-system)
6. [Role-Based Access Control (RBAC)](#6-role-based-access-control-rbac)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Admin Features](#8-admin-features)
9. [Default Seed Credentials](#9-default-seed-credentials)
10. [How Login Works (Flow)](#10-how-login-works-flow)
11. [Session & Token Lifecycle](#11-session--token-lifecycle)
12. [Deactivation Enforcement](#12-deactivation-enforcement)
13. [Bulk CSV Enrollment](#13-bulk-csv-enrollment)
14. [Build & Run Instructions](#14-build--run-instructions)
15. [Web UI](#15-web-ui)

---

## 1. Project Overview

A Spring Boot REST API backend for managing student attendance, with:
- **JWT-based stateless authentication**
- **Three-role RBAC** (Admin / Teacher / Student)
- **Full admin control** over users, courses, semesters, sections, and enrollments
- **Bulk student enrollment** via CSV upload
- **Account activation / deactivation** (deactivated users cannot log in)
- **Persistent H2 (dev) or MySQL (prod) database**

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Spring Boot 3.2.5 |
| Security | Spring Security 6 + JWT (JJWT 0.12.5) |
| Persistence | Spring Data JPA + Hibernate |
| Database (dev) | H2 In-Memory |
| Database (prod) | MySQL 8 |
| Password Hashing | BCrypt |
| CSV Parsing | OpenCSV 5.9 |
| Validation | Jakarta Bean Validation |
| Java Version | Java 17+ (tested on JDK 25) |
| Build Tool | Maven 3.9+ |

---

## 3. Project Structure

```
src/main/java/com/example/attendance/
│
├── AttendanceManagementApplication.java       ← Spring Boot entry point
│
├── config/
│   └── DataInitializer.java                   ← Seeds default users/data on first boot
│
├── controller/
│   ├── AuthController.java                    ← POST /api/auth/login, /register
│   ├── AdminUserController.java               ← GET/POST/PUT/PATCH /api/admin/users
│   ├── CourseController.java                  ← /api/courses (CRUD)
│   ├── SemesterController.java                ← /api/admin/semesters (CRUD)
│   ├── SectionController.java                 ← /api/admin/sections (CRUD + faculty assign)
│   ├── EnrollmentController.java              ← /api/admin/enrollments (individual + bulk CSV)
│   ├── StudentController.java                 ← /api/students (legacy, admin/teacher)
│   └── AttendanceController.java              ← /api/attendance (mark + view)
│
├── dto/                                       ← Request/Response data transfer objects
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── RegisterRequest.java
│   ├── UserResponse.java
│   ├── UpdateUserRequest.java
│   ├── CourseRequest.java
│   ├── SemesterRequest.java
│   ├── SectionRequest.java
│   ├── SectionResponse.java
│   ├── EnrollRequest.java
│   ├── BulkRemoveRequest.java
│   ├── EnrollmentResponse.java
│   ├── BulkEnrollResult.java
│   ├── MarkAttendanceRequest.java
│   ├── AttendanceResponse.java
│   ├── AttendanceSummary.java
│   └── StudentRequest.java
│
├── exception/
│   ├── ResourceNotFoundException.java         ← Thrown → 404
│   ├── DuplicateResourceException.java        ← Thrown → 409
│   └── GlobalExceptionHandler.java            ← Maps all exceptions to HTTP responses
│
├── model/
│   ├── User.java                              ← Unified user entity (admin/teacher/student)
│   ├── Role.java                              ← Enum: ADMIN, TEACHER, STUDENT
│   ├── Course.java                            ← Course catalogue
│   ├── Semester.java                          ← Academic semester
│   ├── Section.java                           ← Section (course offering in a semester)
│   ├── Enrollment.java                        ← Student ↔ Section link
│   ├── EnrollmentStatus.java                  ← Enum: ACTIVE, DROPPED, COMPLETED
│   ├── AttendanceRecord.java                  ← Attendance row per student per date
│   ├── AttendanceStatus.java                  ← Enum: PRESENT, ABSENT, LATE, EXCUSED
│   └── Student.java                           ← Legacy student entity (kept for backward compat)
│
├── repository/                                ← Spring Data JPA interfaces
│   ├── UserRepository.java
│   ├── CourseRepository.java
│   ├── SemesterRepository.java
│   ├── SectionRepository.java
│   ├── EnrollmentRepository.java
│   ├── AttendanceRecordRepository.java
│   └── StudentRepository.java
│
├── security/
│   ├── JwtUtil.java                           ← Generate & validate JWT tokens
│   ├── JwtAuthFilter.java                     ← Intercepts requests, extracts JWT
│   ├── UserDetailsServiceImpl.java            ← Loads user for Spring Security
│   └── SecurityConfig.java                    ← Security filter chain + beans
│
└── service/
    ├── AuthService.java                       ← login(), register(), isCurrentStudent()
    ├── UserService.java                       ← User CRUD + activate/deactivate
    ├── CourseService.java                     ← Course CRUD
    ├── SemesterService.java                   ← Semester CRUD
    ├── SectionService.java                    ← Section CRUD + faculty assignment
    ├── EnrollmentService.java                 ← Enroll/remove + bulk CSV
    ├── AttendanceService.java                 ← Mark + query attendance
    └── StudentService.java                    ← Legacy student CRUD
```

---

## 4. Database & Data Models

### `users` table (central user store)
| Column | Type | Notes |
|---|---|---|
| id | BIGINT (PK) | Auto-increment |
| email | VARCHAR(255) | Unique |
| password_hash | VARCHAR(255) | BCrypt hashed |
| full_name | VARCHAR(150) | Display name |
| role | ENUM | ADMIN / TEACHER / STUDENT |
| roll_number | VARCHAR(30) | Null for non-students |
| is_active | BOOLEAN | Default TRUE; deactivated = cannot login |

### `semesters` table
| Column | Type | Notes |
|---|---|---|
| id | BIGINT (PK) | |
| name | VARCHAR (unique) | e.g. `2026-ODD` |
| start_date | VARCHAR | ISO date string |
| end_date | VARCHAR | ISO date string |
| is_active | BOOLEAN | Active semester flag |

### `sections` table
| Column | Type | Notes |
|---|---|---|
| id | BIGINT (PK) | |
| course_id | FK → courses | |
| teacher_id | FK → users | Must be TEACHER role |
| semester_id | FK → semesters | |
| section_name | VARCHAR | e.g. "A", "B" |
| room | VARCHAR | Optional |
| capacity | INT | Optional |
| Unique constraint | (course_id, section_name, semester_id) | No duplicate offerings |

### `enrollments` table
| Column | Type | Notes |
|---|---|---|
| id | BIGINT (PK) | |
| student_id | FK → users | Must be STUDENT role |
| section_id | FK → sections | |
| status | ENUM | ACTIVE / DROPPED / COMPLETED |
| Unique constraint | (student_id, section_id) | No double enrollment |

### `courses` table
| Column | Type | Notes |
|---|---|---|
| id | BIGINT (PK) | |
| code | VARCHAR (unique) | e.g. `CS101` |
| name | VARCHAR | Full course name |
| description | TEXT | Optional |
| credits | TINYINT | Default 4 |

---

## 5. Authentication System

### How it works

```
Client                          Server
  │                               │
  │  POST /api/auth/login         │
  │  { email, password }          │
  │──────────────────────────────►│
  │                               │  1. Find user by email
  │                               │  2. Check is_active → 403 if false
  │                               │  3. BCrypt.verify(password, hash)
  │                               │  4. Generate JWT (HS256, 24h TTL)
  │◄──────────────────────────────│
  │  { token, role, userId,       │
  │    fullName }                 │
  │                               │
  │  GET /api/courses             │
  │  Authorization: Bearer <JWT>  │
  │──────────────────────────────►│
  │                               │  5. JwtAuthFilter extracts token
  │                               │  6. Validate signature + expiry
  │                               │  7. Load user, check is_active
  │                               │  8. Set SecurityContext
  │◄──────────────────────────────│
  │  200 OK + data                │
```

### JWT Token Structure

```json
Header:  { "alg": "HS256" }
Payload: {
  "sub":    "admin@college.edu",
  "role":   "ADMIN",
  "userId": 1,
  "iat":    1234567890,
  "exp":    1234654290
}
```

### Key Security Classes

| Class | Responsibility |
|---|---|
| `JwtUtil` | Generates tokens using JJWT 0.12.x; validates signature + expiry |
| `JwtAuthFilter` | `OncePerRequestFilter` — reads `Authorization` header on every request |
| `UserDetailsServiceImpl` | Loads user from DB; maps role → `ROLE_ADMIN` / `ROLE_TEACHER` / `ROLE_STUDENT` |
| `SecurityConfig` | Stateless session, CSRF disabled, H2 console allowed, JWT filter wired in |

### application.properties JWT config
```properties
app.jwt.secret=NnB1dEQzdGhla2V5aGVyZXRvbWFrZWl0bG9uZ2Vub3VnaGZvckhNQUMtU0hBMjU2
app.jwt.expiry-ms=86400000
```

---

## 6. Role-Based Access Control (RBAC)

### Role Permissions Matrix

| Endpoint Group | ADMIN | TEACHER | STUDENT |
|---|:---:|:---:|:---:|
| `POST /api/auth/login` | ✅ | ✅ | ✅ |
| `POST /api/auth/register` | ✅ | ❌ | ❌ |
| `GET /api/courses` | ✅ | ✅ | ✅ |
| `POST /api/courses` | ✅ | ❌ | ❌ |
| `PUT /api/courses/{id}` | ✅ | ❌ | ❌ |
| `DELETE /api/courses/{id}` | ✅ | ❌ | ❌ |
| `GET /api/admin/users` | ✅ | ❌ | ❌ |
| `POST /api/admin/users` | ✅ | ❌ | ❌ |
| `PATCH /api/admin/users/{id}/activate` | ✅ | ❌ | ❌ |
| `PATCH /api/admin/users/{id}/deactivate` | ✅ | ❌ | ❌ |
| `GET /api/admin/semesters` | ✅ | ✅ | ✅ |
| `POST /api/admin/semesters` | ✅ | ❌ | ❌ |
| `GET /api/admin/sections` | ✅ | ✅ | ✅ |
| `POST /api/admin/sections` | ✅ | ❌ | ❌ |
| `PATCH /api/admin/sections/{id}/assign-faculty` | ✅ | ❌ | ❌ |
| `POST /api/admin/enrollments` | ✅ | ❌ | ❌ |
| `POST /api/admin/enrollments/bulk` | ✅ | ❌ | ❌ |
| `DELETE /api/admin/enrollments/bulk` | ✅ | ❌ | ❌ |
| `POST /api/attendance` (mark) | ✅ | ✅ | ❌ |
| `GET /api/attendance/student/{id}/...` | ✅ | ✅ | ✅ (own only) |
| `GET /api/students` | ✅ | ✅ | ❌ |
| `GET /api/students/me` | ❌ | ❌ | ✅ |
| `GET /api/admin/enrollments/section/{id}` | ✅ | ✅ | ❌ |

### How RBAC is enforced

1. **Method-level** — `@PreAuthorize("hasRole('ADMIN')")` on controller methods
2. **Spring Security filter chain** — Any request without valid JWT → 401
3. **SpEL expressions** — Attendance student queries check `@authService.isCurrentStudent(#studentId, authentication)` to prevent students from viewing other students' records
4. **Active flag check** — `JwtAuthFilter` and `AuthService.login()` both verify `user.isActive()` before granting access

---

## 7. API Endpoints Reference

### Auth (`/api/auth`)

#### `POST /api/auth/login`
**Public** — No token required

Request:
```json
{ "email": "admin@college.edu", "password": "Admin@123" }
```
Response `200 OK`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "ADMIN",
  "userId": 1,
  "fullName": "System Admin"
}
```
Errors:
- `401` — wrong email/password
- `403` — account is deactivated

#### `POST /api/auth/register` _(ADMIN only)_
Request:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@college.edu",
  "password": "Secret@123",
  "role": "STUDENT",
  "rollNumber": "CS2024099"
}
```
Response `201 Created`: User object

---

### Admin — User Management (`/api/admin/users`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List all users. Optional `?role=STUDENT` |
| `GET` | `/api/admin/users/{id}` | Get single user |
| `POST` | `/api/admin/users` | Create user (same body as register) |
| `PUT` | `/api/admin/users/{id}` | Update fullName / email / rollNumber |
| `PATCH` | `/api/admin/users/{id}/activate` | Set `is_active = true` |
| `PATCH` | `/api/admin/users/{id}/deactivate` | Set `is_active = false` |

`UserResponse` shape:
```json
{
  "id": 3,
  "email": "student@college.edu",
  "fullName": "John Doe",
  "role": "STUDENT",
  "rollNumber": "CS2024001",
  "active": true
}
```

---

### Courses (`/api/courses`)

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/courses` | All | List all courses |
| `GET` | `/api/courses/{id}` | All | Get course by ID |
| `POST` | `/api/courses` | ADMIN | Create course |
| `PUT` | `/api/courses/{id}` | ADMIN | Update course |
| `DELETE` | `/api/courses/{id}` | ADMIN | Delete course |

Request body:
```json
{
  "code": "CS301",
  "name": "Operating Systems",
  "description": "Process management, memory, file systems",
  "credits": 4
}
```

---

### Semesters (`/api/admin/semesters`)

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/semesters` | All | List semesters |
| `POST` | `/api/admin/semesters` | ADMIN | Create semester |
| `GET` | `/api/admin/semesters/{id}` | All | Get by ID |
| `PUT` | `/api/admin/semesters/{id}` | ADMIN | Update |
| `PATCH` | `/api/admin/semesters/{id}/activate` | ADMIN | Mark active |
| `PATCH` | `/api/admin/semesters/{id}/deactivate` | ADMIN | Mark inactive |

Request body:
```json
{
  "name": "2027-EVEN",
  "startDate": "2027-01-10",
  "endDate": "2027-05-30"
}
```

---

### Sections (`/api/admin/sections`)

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/sections` | All | List sections (filter by `?semesterId=` or `?courseId=`) |
| `POST` | `/api/admin/sections` | ADMIN | Create section |
| `GET` | `/api/admin/sections/{id}` | All | Get section |
| `PUT` | `/api/admin/sections/{id}` | ADMIN | Update section |
| `DELETE` | `/api/admin/sections/{id}` | ADMIN | Delete section |
| `PATCH` | `/api/admin/sections/{id}/assign-faculty` | ADMIN | Reassign teacher |

Create / Update body:
```json
{
  "courseId": 1,
  "teacherId": 2,
  "semesterId": 1,
  "sectionName": "A",
  "room": "Room 101",
  "capacity": 60
}
```

Assign faculty body:
```json
{ "teacherId": 5 }
```

`SectionResponse` shape:
```json
{
  "id": 1,
  "courseId": 1,
  "courseCode": "CS101",
  "courseName": "Introduction to Computer Science",
  "teacherId": 2,
  "teacherName": "Dr. Smith",
  "semesterId": 1,
  "semesterName": "2026-ODD",
  "sectionName": "A",
  "room": "Room 101",
  "capacity": 60
}
```

---

### Enrollments (`/api/admin/enrollments`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/enrollments/section/{sectionId}` | List all students in a section (ADMIN and TEACHER) |
| `POST` | `/api/admin/enrollments` | Enroll one student |
| `DELETE` | `/api/admin/enrollments/{enrollmentId}` | Remove one enrollment |
| `POST` | `/api/admin/enrollments/bulk` | Bulk enroll via CSV file |
| `DELETE` | `/api/admin/enrollments/bulk` | Bulk remove students from section |

Enroll one:
```json
{ "studentId": 3, "sectionId": 1 }
```

Bulk remove:
```json
{ "studentIds": [3, 4, 5], "sectionId": 1 }
```

Bulk enroll response:
```json
{
  "enrolled": 8,
  "skipped": 2,
  "errors": ["Row 5: Roll number CS9999 not found"]
}
```

---

### Attendance (`/api/attendance`)

| Method | Path | Roles | Description |
|---|---|---|---|
| `POST` | `/api/attendance` | ADMIN, TEACHER | Mark attendance |
| `GET` | `/api/attendance/student/{sId}/course/{cId}` | ADMIN, TEACHER, STUDENT (own) | Records by student+course |
| `GET` | `/api/attendance/course/{courseId}?date=YYYY-MM-DD` | ADMIN, TEACHER | Class register for a date |
| `GET` | `/api/attendance/student/{sId}/course/{cId}/summary` | ADMIN, TEACHER, STUDENT (own) | Attendance % summary |

Mark attendance body:
```json
{
  "studentId": 3,
  "courseId": 1,
  "date": "2026-10-15",
  "status": "PRESENT"
}
```
Status values: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`

Summary response:
```json
{
  "studentId": 3,
  "courseId": 1,
  "totalClasses": 20,
  "attended": 18,
  "percentage": 90.0
}
```

---

## 8. Admin Features

### User Management
- **Create** student or faculty accounts with hashed passwords
- **View** all users, filter by role (`?role=STUDENT|TEACHER|ADMIN`)
- **Update** user info (name, email, roll number)
- **Activate** — sets `is_active = true`
- **Deactivate** — sets `is_active = false`; user immediately loses the ability to log in

### Course Management
- Full CRUD: create, read, update, delete
- Each course has: code (unique), name, description, credits

### Semester Management
- Create and manage academic semesters
- Activate or deactivate individual semesters

### Section (Faculty Assignment) Management
- Create sections that link a course + teacher + semester
- **Reassign faculty** using `PATCH /api/admin/sections/{id}/assign-faculty`
- Each section is unique by `(courseId, sectionName, semesterId)`

### Enrollment Management
- **Enroll individually** — by studentId + sectionId
- **Remove individually** — by enrollmentId
- **Bulk enroll via CSV** — upload a CSV file
- **Bulk remove** — send a list of studentIds + sectionId

---

## 9. Default Seed Credentials

Automatically created on first boot (when database is empty):

| Role | Email | Password | Full Name | Roll # |
|---|---|---|---|---|
| **ADMIN** | `admin@college.edu` | `Admin@123` | System Admin | — |
| **TEACHER** | `teacher@college.edu` | `Teacher@123` | Dr. Smith | — |
| **STUDENT** | `student@college.edu` | `Student@123` | John Doe | `CS2024001` |

Also seeded:
- Semester: **2026-ODD** (Aug 1 – Dec 15, 2026)
- Course: **CS101** — Introduction to Computer Science (4 credits)
- Section: **A** in Room 101, assigned to Dr. Smith

---

## 10. How Login Works (Flow)

```
1. Client sends POST /api/auth/login  { email, password }

2. AuthService.login():
   a. Find User by email → 401 if not found
   b. Check user.isActive() → 403 "Account is deactivated" if false
   c. BCrypt.matches(plaintext, hash) → 401 if mismatch
   d. JwtUtil.generateToken(user) → HS256 signed JWT
   e. Return { token, role, userId, fullName }

3. Client stores token (localStorage / memory)

4. Every subsequent request:
   Authorization: Bearer <token>

5. JwtAuthFilter.doFilterInternal():
   a. shouldNotFilter() → skips /api/auth/** and /h2-console/**
   b. Extract Bearer token from header
   c. JwtUtil.isTokenValid() → verify signature + expiry
   d. Extract email from claims
   e. UserRepository.findByEmail() → check user.isActive() again
   f. UserDetailsService.loadUserByUsername() → get authorities
   g. Set UsernamePasswordAuthenticationToken in SecurityContextHolder

6. Controller method is called with security context set.
   @PreAuthorize checks run against the authenticated principal.
```

---

## 11. Session & Token Lifecycle

| Property | Value |
|---|---|
| Token type | JWT (Bearer) |
| Algorithm | HS256 |
| Expiry | 24 hours (86,400,000 ms) |
| Storage | Stateless — no server-side session |
| Revocation | Via `is_active = false` (checked on every request) |
| Refresh | Not implemented — user must re-login after expiry |

> [!NOTE]
> Since the system is stateless, tokens cannot be individually revoked before expiry. However, **deactivating a user blocks them immediately** because `JwtAuthFilter` checks `is_active` on every request even if the token is still valid.

---

## 12. Deactivation Enforcement

Deactivation is enforced at **two layers**:

### Layer 1 — Login (`AuthService.login()`)
```java
if (!user.isActive()) {
    throw new AccessDeniedException("Account is deactivated");
}
```
→ Returns `403 Forbidden`

### Layer 2 — Token validation (`JwtAuthFilter`)
```java
userRepository.findByEmail(email).ifPresent(user -> {
    if (user.isActive()) {           // ← checked on EVERY request
        // set SecurityContext
    }
    // if inactive: SecurityContext stays null → 401 Unauthorized
});
```
→ Even with a valid unexpired token, a deactivated user cannot access any protected endpoint.

---

## 13. Bulk CSV Enrollment

### Endpoint
```
POST /api/admin/enrollments/bulk
Content-Type: multipart/form-data
Field name: file
```

### CSV Format
```csv
CS2024001,1
CS2024002,1
CS2024003,2
```
Each row: `rollNumber,sectionId`

### Processing Logic
1. Parse CSV using OpenCSV
2. For each row:
   - Look up `User` by `rollNumber`
   - Verify user has `STUDENT` role
   - Check if already enrolled → **skip silently** (no error)
   - Create `Enrollment` with status `ACTIVE`
   - On any other error → record error message, **continue** (don't abort whole batch)
3. Return `BulkEnrollResult`:
   ```json
   {
     "enrolled": 8,
     "skipped": 2,
     "errors": ["Row 3: Roll number CS9999 not found"]
   }
   ```

---

## 14. Build & Run Instructions

### Prerequisites
- **Java 17+** (JDK 25 is installed at `C:\Program Files\Eclipse Adoptium\jdk-25.0.0.36-hotspot`)
- **Maven 3.9+** (needs to be installed or use Maven Wrapper)

### Install Maven (one-time)
```powershell
# Download Maven
Invoke-WebRequest -Uri "https://downloads.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip" `
  -OutFile "$env:USERPROFILE\apache-maven-3.9.9-bin.zip"

# Extract
Expand-Archive "$env:USERPROFILE\apache-maven-3.9.9-bin.zip" -DestinationPath "C:\tools\maven"

# Add to PATH (this session only)
$env:PATH += ";C:\tools\maven\apache-maven-3.9.9\bin"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.0.36-hotspot"
```

### Run the Application
```powershell
cd "C:\Users\user\3D Objects\se-proj"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.0.36-hotspot"

# Compile
mvn compile

# Run
mvn spring-boot:run
```

### Application starts at: `http://localhost:8080`
### H2 Console (dev): `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:attendancedb`
- Username: `sa`
- Password: *(empty)*

---

### Quick Test (PowerShell)

```powershell
# 1. Login as admin
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"admin@college.edu","password":"Admin@123"}'

$token = $response.token
$headers = @{ Authorization = "Bearer $token" }

# 2. List all courses
Invoke-RestMethod -Uri "http://localhost:8080/api/courses" -Headers $headers

# 3. Create a student account
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/users" `
  -Method POST -Headers $headers -ContentType "application/json" `
  -Body '{"fullName":"Alice Smith","email":"alice@college.edu","password":"Pass@123","role":"STUDENT","rollNumber":"CS2024099"}'

# 4. Deactivate a user (replace {id} with actual user id)
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/users/3/deactivate" `
  -Method PATCH -Headers $headers

# 5. Try logging in as deactivated user (should return 403)
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"student@college.edu","password":"Student@123"}'
```

---

## Error Responses

All errors follow [RFC 7807 Problem Detail](https://datatracker.ietf.org/doc/html/rfc7807) format:

```json
{
  "type": "about:blank",
  "title": "Forbidden",
  "status": 403,
  "detail": "Account is deactivated",
  "instance": "/api/auth/login"
}
```

| HTTP Status | Cause |
|---|---|
| `400 Bad Request` | Validation failure or bad input |
| `401 Unauthorized` | Missing/invalid/expired JWT, or wrong password |
| `403 Forbidden` | Deactivated account, or insufficient role |
| `404 Not Found` | Resource (user, course, section, etc.) not found |
| `409 Conflict` | Duplicate email, roll number, enrollment, etc. |

---

## 15. Web UI

A single-page app lives in `src/main/resources/static` and is served by Spring Boot at `/`. It uses plain HTML, CSS and ES modules, so there is no Node toolchain or build step.

### Layout

```
static/
├── index.html
├── css/        tokens.css (colours, type, spacing) · base · forms · layout · components
│               · register · attendance · dashboard · login
├── fonts/      Public Sans, Young Serif (SIL OFL, licences included)
└── js/
    ├── main.js        entry point: starts the router, picks shell or bare layout
    ├── api.js         fetch wrapper: Bearer token, JSON/multipart, problem-detail errors
    ├── session.js     sign-in/out, role checks, token kept in localStorage
    ├── router.js      #/path router with signed-in and role guards
    ├── routes.js      page registry (path, title, roles, sidebar entry)
    ├── dom.js         h() element builder, date helpers (text only, never innerHTML)
    ├── ui/            shell, modal, form dialog, table, toast, icons, status marks
    └── pages/         login, dashboard, register, report, myAttendance,
                       users, courses, semesters, sections, enrollments
```

To add a page, create a module in `pages/` that exports a `route` object and add it to `routes.js`. The sidebar is generated from that registry and filtered by role.

### Pages

| Route | Roles | Purpose |
|---|---|---|
| `#/` | all | Role-specific dashboard |
| `#/attendance/mark` | admin, teacher | Mark a section's attendance for a date |
| `#/reports` | admin, teacher | Per-student percentages for a section, history, CSV export |
| `#/my-attendance` | student | Percentage per course, outlook and history |
| `#/admin/users` `courses` `semesters` `sections` `enrollments` | admin | Management screens |

Teachers only see sections assigned to them in the attendance and report pages. This filtering happens in the UI; the API itself does not restrict a teacher to their own sections.

### API changes made for the UI

1. `GET /api/admin/enrollments/section/{id}` now also allows `TEACHER`, so a teacher can read the class list. All other enrollment endpoints remain admin-only.
2. `GET /api/students/me` (student role) returns the caller's legacy `Student` record, matched by roll number and then email.

### API behaviour the UI works around

- **Two student ids.** Attendance endpoints take the legacy `Student` id, while login and enrollments expose the `User` id. The register matches enrolled students to `/api/students` by roll number; the student views use `/api/students/me`.
- **Marks cannot be edited.** There is no update endpoint and a second mark for the same student, course and date returns 409, so recorded marks are shown locked.
- **Unauthenticated requests get an empty 403**, not 401, because the filter chain rejects them before any controller runs. A role failure inside a controller returns a JSON problem body. The client uses that difference to tell "session ended" from "not allowed".
- **Deleting a course or section that is still referenced returns 500.** The UI explains this in plain language instead of showing a generic error.
- **User edits do not update the legacy `Student` row.** Changing a student's email or roll number on the Users page leaves the `students` table as it was.
- **No minimum attendance in the API.** The 75% line is a constant in `ui/status.js`.

### Security notes

- All API data is rendered as text; the UI never builds HTML from API content.
- The JWT is stored in `localStorage`, so it survives refreshes but would be readable by any script injected into the page. Keeping all rendering text-only is the main defence.
- The demo-account buttons on the login page only appear when the host is `localhost`.
- CSV export prefixes cells starting with `=`, `+`, `-` or `@` so spreadsheets do not run them as formulas.

### Testing

The UI has no automated tests yet. A natural next step is end-to-end tests with Playwright against the running app.

---

*Generated: 2026-11-04 | Student Attendance Management System v1.0*
