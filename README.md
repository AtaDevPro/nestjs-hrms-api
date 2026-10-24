<div align="center">

# HRMS API

**A modular Human Resource Management REST API built with NestJS, TypeScript, TypeORM, and MySQL.**

Manage authentication, departments, employee attendance, and payroll through role-protected endpoints.

[![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TypeORM](https://img.shields.io/badge/ORM-TypeORM-FE0803)](https://typeorm.io/)
[![API](https://img.shields.io/badge/API-REST-0F766E)](#api-reference)

[Features](#features) · [Getting started](#getting-started) · [API reference](#api-reference) · [Architecture](#project-structure) · [Security notes](#security-and-production-readiness)

</div>

> [!IMPORTANT]
> This repository is currently a **development/learning project**, not a production-hardened HR system. See [Security and production readiness](#security-and-production-readiness) before deploying or using real employee information.

## Overview

HRMS API provides the server-side foundations of a human resources application. Its NestJS modules separate authentication, department administration, attendance recording, and payroll management. JWT authentication is applied globally, with role-based access control distinguishing **managers** from **employees**.

The API is versioned under `/api/v1` and exposes separate Swagger UI views for the two roles. Successful HTTP responses are formatted consistently by a global response interceptor.

## Features

| Area | Implemented functionality |
| --- | --- |
| Authentication | Mobile/password registration and login; JWT access and refresh tokens; hashed passwords; refresh-token rotation and revocation in the service layer |
| Authorization | Global JWT guard, `@Public()` bypass, and `@Roles()` access restrictions for `manager` and `employee` |
| Departments | Managers can create, list, retrieve, update, and delete departments; employees can list and view departments |
| Attendance | Employees can check in, check out, and list their own attendance records, optionally filtered by Jalali date range |
| Payroll | Managers can create, list, retrieve, update, and delete payroll records; filter by user, salary period, and payment status |
| Documentation | Swagger UI for manager and employee endpoints |
| API conventions | Global URL prefix, request DTO validation, CORS, and consistent successful-response envelope |
| Testing and tooling | Jest, Supertest end-to-end test files, Prettier, and Oxlint scripts |

### Technology stack

- **Runtime and framework:** Node.js, NestJS 12, TypeScript 6
- **Persistence:** MySQL, TypeORM, `mysql2`
- **Authentication:** Passport JWT, `@nestjs/jwt`, bcrypt
- **Validation:** `class-validator`, `class-transformer`
- **API documentation:** `@nestjs/swagger`, Swagger UI
- **Testing:** Jest, `ts-jest`, Supertest
- **Code quality:** Oxlint, Prettier
- **Package manager:** npm

## Getting started

### Prerequisites

- A modern Node.js version compatible with NestJS 12 and TypeScript 6 (Node.js 24 LTS is a reasonable starting point)
- npm
- A running MySQL server and credentials with access to a database

### 1. Get the source and install dependencies

```bash
git clone https://github.com/AtaDevPro/nestjs-hrms-api.git
cd nestjs-hrms-api
npm ci
```

If you obtained the source as an archive, extract it and run `npm ci` from the project directory instead.

### 2. Create the database

Run the following in your local MySQL server:

```sql
CREATE DATABASE hr_api
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Alternatively, point the configuration to an existing database.

### 3. Configure environment variables

Create a `.env` file in the project root (the application loads this file through `ConfigModule`):

```dotenv
PORT=4000
APP_NAME=HRMS API

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=replace_with_your_local_password
DB_DATABASE=hr_api

JWT_ACCESS_SECRET=replace_with_a_long_random_access_secret
ACCESS_TOKEN_EXPIRE=15m
JWT_REFRESH_SECRET=replace_with_a_different_long_random_refresh_secret
REFRESH_TOKEN_EXPIRE=14d
```

| Variable | Purpose | Code default / behavior |
| --- | --- | --- |
| `PORT` | HTTP listener port | `4000` |
| `APP_NAME` | Project metadata in the supplied environment | Present in `.env`, but not consumed by the inspected runtime code |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USERNAME` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | No explicit default |
| `DB_DATABASE` | MySQL database | `hr_api` |
| `JWT_ACCESS_SECRET` | Secret used to sign and verify access tokens | Required by JWT strategy |
| `ACCESS_TOKEN_EXPIRE` | Access-token expiry | `15m` |
| `JWT_REFRESH_SECRET` | Secret used to sign and verify refresh tokens | No explicit default |
| `REFRESH_TOKEN_EXPIRE` | Refresh-token expiry | `14d` |

**Never commit `.env` or real secrets.** The provided `.gitignore` excludes `.env`.

### 4. Start the API

```bash
# Development with file watching
npm run start:dev

# Standard development start
npm run start

# Build, then run compiled JavaScript
npm run build
npm run start:prod
```

With the example configuration, the server listens at **`http://localhost:4000`** and the API base URL is **`http://localhost:4000/api/v1`**.

> [!NOTE]
> The inspected database configuration uses `synchronize: true`. TypeORM may automatically change database tables at application startup. **Use a disposable local database**; disable schema synchronization and introduce explicit migrations before any production deployment.

## API documentation

After starting the server, open:

| Audience | Swagger UI |
| --- | --- |
| Manager | [`http://localhost:4000/api/v1/manager/docs`](http://localhost:4000/api/v1/manager/docs) |
| Employee | [`http://localhost:4000/api/v1/employee/docs`](http://localhost:4000/api/v1/employee/docs) |

Both documents include authentication routes; the remaining paths are filtered by their respective role prefixes. Click **Authorize** and provide a valid access token when trying protected endpoints.

## API reference

All paths below are relative to `/api/v1`. Unless marked public, endpoints require `Authorization: Bearer <access_token>`.

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register using an Iranian mobile number and password; accepts an optional role |
| `POST` | `/auth/login` | Public | Receive an access token, refresh token, and user role |
| `POST` | `/auth/refresh` | Public | Exchange a valid refresh token for a new token pair |

The authentication service also implements `logout(userId)` to revoke refresh tokens, **but no logout HTTP endpoint is exposed** in the inspected controller.

Example registration request:

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "mobile": "09123456789",
  "password": "change-this-password"
}
```

Example login request:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "mobile": "09123456789",
  "password": "change-this-password"
}
```

Example login response (token values abbreviated):

```json
{
  "success": true,
  "data": {
    "accessToken": "<access-token>",
    "refreshToken": "<refresh-token>",
    "role": "employee"
  },
  "message": "Operation completed successfully",
  "timestamp": "2026-10-24T00:00:00.000Z"
}
```

*The actual interceptor currently uses Persian success messages; the message above is an illustrative English translation.*

Refresh request:

```json
{
  "refreshToken": "<refresh-token>"
}
```

### Departments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/manager/departments` | Manager | Create department |
| `GET` | `/manager/departments` | Manager | List departments |
| `GET` | `/manager/departments/:id` | Manager | Get department |
| `PATCH` | `/manager/departments/:id` | Manager | Update department |
| `DELETE` | `/manager/departments/:id` | Manager | Delete department |
| `GET` | `/employee/departments` | Employee | List departments |
| `GET` | `/employee/departments/:id` | Employee | Get department |

Departments have a `name` and `description` in addition to ID and timestamps. The employee endpoints are read-only.

### Attendance

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/employee/attendance/check-in` | Employee | Record a check-in for the authenticated user |
| `POST` | `/employee/attendance/check-out` | Employee | Close a matching open attendance record |
| `GET` | `/employee/attendance` | Employee | List authenticated user's records |

**Example check-in payload**

```json
{
  "j_date": "1404/09/26",
  "notes": "Arrived at the office"
}
```

**Filter example**

```http
GET /api/v1/employee/attendance?startTime=1404/09/01&endTime=1404/09/30
Authorization: Bearer <access_token>
```

The API stores a Jalali date string (`YYYY/MM/DD`) alongside server-generated check-in/check-out timestamps. A user cannot open another unclosed attendance record for the same supplied date. Check-out looks for the latest open record matching that date. The DTO checks date **format**, not whether the supplied date is an actual valid calendar day.

### Payroll

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/manager/payroll` | Manager | Create payroll record |
| `GET` | `/manager/payroll` | Manager | List payroll records with optional filters |
| `GET` | `/manager/payroll/:id` | Manager | Get payroll record |
| `PATCH` | `/manager/payroll/:id` | Manager | Update payroll record |
| `DELETE` | `/manager/payroll/:id` | Manager | Delete payroll record |

**Example create payload**

```json
{
  "userId": 1,
  "salaryPeriod": "1404/08",
  "baseSalary": 5000000,
  "bonuses": 500000,
  "deductions": 200000,
  "status": "pending",
  "notes": "Monthly payroll"
}
```

**Payroll calculation**

```text
totalAmount = baseSalary + bonuses - deductions
```

Supported statuses are `pending` and `paid`. The service sets `paymentDate` when a record is created or first updated with `paid` status. It checks for an existing record with the same user and salary period before creating another.

Optional list filters: `userId`, `salaryPeriod` (e.g. `1404/08`), and `status` (`pending` or `paid`).

```http
GET /api/v1/manager/payroll?userId=1&salaryPeriod=1404/08&status=paid
Authorization: Bearer <manager-access-token>
```

> [!CAUTION]
> Payroll amounts have **no declared currency unit** in the code. Integrators must agree on one unit before storing amounts. The current implementation uses numeric fields rather than a purpose-designed monetary precision strategy.

### Public root endpoint

`GET /api/v1` returns `Hello World!` from the default application controller, wrapped by the global success interceptor.

## Access control

| Resource | Manager | Employee | Anonymous |
| --- | :---: | :---: | :---: |
| Register / login / refresh | Yes | Yes | Yes |
| Manager department endpoints | Yes | No | No |
| Employee department endpoints | No | Yes | No |
| Employee attendance endpoints | No | Yes | No |
| Manager payroll endpoints | Yes | No | No |
| Root endpoint | Yes | Yes | Yes |

**Important:** This table documents the explicit `@Roles()` restrictions, not organizational hierarchies. Manager tokens are **not automatically authorized** for endpoints restricted to `employee`.

## Response format

A global `TransformResponseInterceptor` normally wraps successful responses as:

```json
{
  "success": true,
  "data": {},
  "message": "<localized success message>",
  "timestamp": "<ISO-8601 timestamp>"
}
```

The interceptor also handles empty successful responses and preserves objects that already contain a `success` field. Error responses are handled by NestJS's usual exception machinery; **there is no custom global exception filter registered** in the inspected application.

## Project structure

```text
src/
├── main.ts                         # Bootstrap, validation, CORS, Swagger
├── app.module.ts                   # Database, feature modules, global guards
├── app.controller.ts               # Public root route
├── common/
│   ├── decorators/
│   │   └── user.decorator.ts       # Inject authenticated request user
│   └── interceptors/
│       └── transform-response.interceptor.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── decorators/             # Public and roles metadata
│   │   ├── dto/
│   │   ├── entities/              # User and refresh-token persistence
│   │   ├── guards/                # JWT and role enforcement
│   │   └── strategies/            # Passport JWT strategy
│   ├── departments/
│   │   ├── controllers/           # Manager and employee endpoints
│   │   ├── dto/
│   │   ├── entities/
│   │   └── services/
│   ├── attendances/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   └── services/
│   └── payroll/
│       ├── controllers/
│       ├── dto/
│       ├── entities/
│       ├── enums/
│       └── services/
└── shared/
    └── enums/                    # UserRole

test/
├── app.e2e-spec.ts
├── attendance.e2e-spec.ts
└── jest-e2e.json
```

### Data model

| Entity/table | Key data | Relationships |
| --- | --- | --- |
| `users` | Unique mobile, bcrypt password hash, role | One-to-many refresh tokens |
| `refresh_tokens` | bcrypt token hash, creation/revocation timestamps | Many-to-one user |
| `departments` | Name, description, timestamps | No user/department relation defined in the inspected schema |
| `attendances` | Jalali date, check-in/out timestamps, notes | Many-to-one user |
| `payrolls` | Salary period, base salary, bonuses, deductions, total, status, payment date | Many-to-one user |

Although departments and employees have separate API surfaces, **user-to-department assignment is not implemented** in the current entity model.

## Developer commands

| Command | Description |
| --- | --- |
| `npm run start:dev` | Start development server in watch mode |
| `npm run build` | Compile application |
| `npm run start:prod` | Run compiled output |
| `npm run lint` | Run Oxlint over `src/` and `test/` |
| `npm run format` | Format TypeScript source/test files |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:cov` | Generate Jest coverage |
| `npm run test:e2e` | Run Jest end-to-end test configuration |

### Testing notes

Unit and end-to-end test files are included, including attendance integration scenarios. The attendance end-to-end suite creates or reuses employee and manager records and requires a **running configured database**. Do **not** point integration tests at a production database. Tests have **not been executed** as part of this README preparation, so no passing-test or coverage claims are made here.

## Security and production readiness

The following limitations were verified in the inspected code and should be addressed before publicly hosting the API:

1. **Public privilege escalation:** `/auth/register` accepts a client-supplied `role`, including `manager`. Assign employee roles on the server and restrict manager provisioning to a trusted administrative process.
2. **Password-hash exposure:** The registration controller returns the persisted user entity, which includes the `password` property. The eager `user` relations in attendance/payroll entities can also serialize password hashes. Use explicit safe response DTOs or `select: false` with deliberate authentication queries; never return password hashes.
3. **Unsafe schema synchronization:** `synchronize: true` is enabled unconditionally. Replace it with versioned database migrations.
4. **Permissive CORS:** `origin: true` and `credentials: true` accept broad origins. Configure an explicit origin allowlist for production.
5. **Input and authorization hardening:** Enable `ValidationPipe` options such as `whitelist`, `forbidNonWhitelisted`, and `transform` after checking DTO compatibility; consider rate limiting and brute-force mitigation on authentication routes.
6. **Refresh-token edge case:** If no stored refresh-token hash matches an otherwise valid signed token, `refreshToken()` may fall through without an explicit unauthorized exception. Return a consistent `401` in all invalid-token branches.
7. **Payroll update semantics:** Update logic uses truthy checks for numeric values, so changing bonuses, deductions, or base salary to `0` may be ignored. Use explicit `!== undefined` checks and cover them with tests.
8. **Missing operational controls:** The inspected source has no migration scripts, deployment configuration, dedicated health endpoint, or configured monitoring. Add these according to the deployment environment.
9. **Privacy and access:** Add data minimization, audit logging, and an explicit policy for who may view personnel and compensation records.

This is a prioritized engineering checklist, **not a claim that the protections are already implemented**.

## Roadmap

Potential next steps (not currently implemented):

- Secure user onboarding and manager provisioning
- User-to-department assignments and staff management
- Manager-side attendance reporting, corrections, and approval workflows
- Employee-facing payslips
- Pagination and standardized filtering
- Schema migrations and a dedicated test database
- Auth rate limiting, centralized error handling, and structured logs
- Continuous integration and deployment documentation

## Contributing

For a local contribution workflow: create a branch, keep changes scoped to the relevant feature module, add or update tests, run `npm run lint` and `npm test`, and describe behavioral changes in your pull request. Discuss any database schema change before merging.

## License

The current `package.json` declares `"license": "UNLICENSED"`, and no separate license file was found in the inspected archive. **No open-source usage license is granted by this README.** Add an explicit license if public reuse is intended.

---

<div align="center">

Built with [NestJS](https://nestjs.com/) · Maintained by [AtaDevPro](https://github.com/AtaDevPro)

</div>
