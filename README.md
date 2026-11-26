# Boibikroy Server

REST API for **Boibikroy**, a marketplace where college students in Bangladesh buy and sell used academic books.

Students list their books, choose saved campuses as meeting points, and report suspicious listings or users. Admins and moderators moderate students, books, reports and public feedback.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Conventions](#api-conventions)
  - [Base URL](#base-url)
  - [Authentication](#authentication)
  - [Roles](#roles)
  - [Request Format](#request-format)
  - [Response Format](#response-format)
  - [Error Format](#error-format)
  - [Pagination](#pagination)
  - [Common Errors](#common-errors)
- [Enumerations](#enumerations)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Admins](#admins)
  - [Students](#students)
  - [Saved Campuses](#saved-campuses)
  - [Books](#books)
  - [Reports](#reports)
  - [Feedbacks](#feedbacks)

---

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Runtime    | Node.js, TypeScript (run with `tsx`)              |
| Framework  | Express 5                                         |
| Database   | PostgreSQL via `pg` (raw SQL, no ORM)             |
| Validation | Zod 4                                             |
| Auth       | JSON Web Tokens in an HTTP-only cookie, `bcryptjs` |
| Testing    | `node:test` + `supertest` (integration tests)     |

Each module follows the same layering: **route → controller → service → repository**.

```
src/
├── app.ts              # Express app, routers, 404 & error handlers
├── index.ts            # server entry point
├── config/             # env, database pool, cookie options
├── middlewares/        # auth (JWT), role check, schema validation, errors
├── modules/            # auth, admin, students, saved_campuses, books, reports, feedbacks
├── types/              # shared TypeScript types & enums
├── utils/              # ApiResponse, AppError, asyncHandler, createJWT
└── validations/        # Zod request schemas
```

---

## Getting Started

### Prerequisites

- Node.js (a version that supports ES modules and `node:test`)
- PostgreSQL

### Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development            # development | test | production
PORT=5000
DATABASE_CONNECTION_STRING=postgresql://user:password@localhost:5432/boibikroy
JWT_SECRET=replace-with-a-random-secret-of-at-least-32-characters
```

The server validates these on startup and exits with a clear message if any are missing or invalid.

### Database

Run the table scripts in `sqls/` in dependency order:

1. `domains.create.sql` (the `email_address` and `bd_phone` domains used by other tables)
2. `divisions.create.sql`
3. `districts.create.sql`
4. `upazilas.create.sql`
5. `colleges.create.sql`
6. `education_levels.create.sql`
7. `admins.create.sql`
8. `feedback.create.sql`
9. `students.create.sql`
10. `saved_campuses.create.sql`
11. `books.create.sql`
12. `reports.create.sql`

The schema diagram lives in `erd.dbml`.

### Run

```bash
npm install
npm start            # tsx --watch src/index.ts
```

### Test

Integration tests run against the database configured in `.env`. Each test file seeds its own rows and removes them afterwards.

```bash
npm test                                         # all test files
npx tsx --test test/books.integration.test.ts    # a single file
```

---

## API Conventions

### Base URL

```
/api/v1
```

All paths below are relative to this base. For example, `POST /auth/student/login` means `POST /api/v1/auth/student/login`.

### Authentication

Login and registration set a `token` cookie that holds a signed JWT:

| Property   | Value                           |
| ---------- | ------------------------------- |
| Name       | `token`                         |
| `HttpOnly` | `true`                          |
| `SameSite` | `Lax`                           |
| `Secure`   | `true` in production only       |
| Lifetime   | 24 hours (cookie and JWT alike) |

Clients must send the cookie with every protected request (for browsers, `credentials: "include"`). The JWT payload is `{ id, email, role }`.

Logging out and changing a password both clear the cookie.

### Roles

| Role        | Who                                                                     |
| ----------- | ----------------------------------------------------------------------- |
| `student`   | A registered student (buyer and seller).                                |
| `moderator` | An admin account created by the master admin.                           |
| `admin`     | The master admin. Has every moderator permission plus admin management. |

Each endpoint lists its **Access**:

- **Public**: no cookie needed.
- **Student**, **Moderator**, **Admin**: a valid cookie for one of the listed roles.

### Request Format

- Request bodies are JSON (`Content-Type: application/json`).
- String fields are trimmed before validation.
- Path ids must be positive integers.
- Phone numbers use the Bangladeshi format `+880XXXXXXXXXX` (`+880` followed by 10 digits).
- Validation stops at the first failing rule. That rule's message is returned as the error.

### Response Format

**Single resource:** the resource object itself.

```json
{
  "id": 12,
  "title": "Higher Mathematics 1st Paper"
}
```

**Action without a resource:** a message object.

```json
{
  "message": "Book restricted successfully"
}
```

**No content:** status `204` with an empty body.

**Paginated list:** see [Pagination](#pagination).

Timestamps are ISO 8601 strings in UTC, for example `"2026-11-26T15:57:55.356Z"`.

### Error Format

Every error has the same shape:

```json
{
  "error": "Human-readable error message"
}
```

Unexpected server errors return `500` with `{ "error": "Internal Server Error" }`. Unknown routes return `404` with `{ "error": "Not Found" }`.

### Pagination

Paginated endpoints accept:

| Query   | Type    | Default | Rules     |
| ------- | ------- | ------- | --------- |
| `limit` | integer | `10`    | 1 to 100  |
| `page`  | integer | `1`     | 1 or more |

They respond with:

```json
{
  "data": [],
  "limit": 10,
  "page": 1,
  "total": 42,
  "totalPages": 5
}
```

| Field        | Description                               |
| ------------ | ----------------------------------------- |
| `data`       | Items on the requested page.              |
| `limit`      | Page size used.                           |
| `page`       | Page number returned.                     |
| `total`      | Number of items matching the filters.     |
| `totalPages` | `ceil(total / limit)`.                    |

Unless stated otherwise, lists are sorted newest first.

### Common Errors

These apply to every endpoint where they are relevant and are not repeated in each endpoint's error table.

| Status | `error`                           | When                                                       |
| ------ | --------------------------------- | ---------------------------------------------------------- |
| `400`  | *validation message*              | The body or query fails validation.                        |
| `400`  | `invalid path parameter format`   | A path id is not a positive integer.                       |
| `401`  | `Invalid token`                   | The `token` cookie is missing, invalid or expired.         |
| `403`  | `permission denied`               | The caller's role is not allowed to use the endpoint.      |
| `404`  | `Not Found`                       | The route does not exist.                                  |
| `500`  | `Internal Server Error`           | An unexpected server error.                                |

---

## Enumerations

| Name                 | Values                                                              |
| -------------------- | ------------------------------------------------------------------- |
| Student status       | `active`, `inactive`, `suspended`                                   |
| Admin status         | `active`, `inactive`, `suspended`                                   |
| Book type            | `class_book`, `easy_book`, `suggestion_and_question_bank`           |
| Book condition       | `like_new`, `normal`, `written_on`                                  |
| Book status          | `active`, `draft`, `sold_out`, `archived`, `restricted`             |
| Education year       | `1st`, `2nd`, `3rd`, `4th`                                          |
| Report type          | `book`, `student`                                                   |
| Report status        | `pending`, `reviewed`, `action_taken`                               |
| Feedback status      | `pending`, `reviewed`, `mark-as-improvement`                        |

### Book Status Lifecycle

| Status       | Meaning                                       | Visible to                                 |
| ------------ | --------------------------------------------- | ------------------------------------------ |
| `active`     | Listed for sale.                              | Everyone (unless the seller is suspended)  |
| `draft`      | Not published yet.                            | Owner only                                 |
| `sold_out`   | Sold.                                         | Owner, admins                              |
| `archived`   | Hidden by the owner.                          | Owner, admins                              |
| `restricted` | Blocked by an admin; the owner can't edit it. | Owner, admins                              |

Transitions a **student** can make (`PATCH /books/:id`):

| To         | Allowed from          |
| ---------- | --------------------- |
| `active`   | `draft`, `archived`   |
| `sold_out` | `active`              |
| `archived` | `sold_out`, `draft`   |

Transitions an **admin or moderator** can make (`POST /books/:id/:status`):

| To           | Allowed from                         |
| ------------ | ------------------------------------ |
| `restricted` | `active`, `sold_out`, `archived`     |
| `draft`      | `restricted`                         |

---

## Endpoints

### Overview

| Method   | Path                                  | Access                     |
| -------- | ------------------------------------- | -------------------------- |
| `POST`   | `/auth/student/register`              | Public                     |
| `POST`   | `/auth/student/login`                 | Public                     |
| `POST`   | `/auth/admin/login`                   | Public                     |
| `POST`   | `/auth/logout`                        | Public                     |
| `POST`   | `/auth/student/me/update-password`    | Student                    |
| `POST`   | `/auth/admin/me/update-password`      | Admin, Moderator           |
| `GET`    | `/admins`                             | Admin                      |
| `POST`   | `/admins/register`                    | Admin                      |
| `GET`    | `/admins/:id`                         | Admin                      |
| `PATCH`  | `/admins/me`                          | Admin, Moderator           |
| `POST`   | `/admins/:id/suspend`                 | Admin                      |
| `DELETE` | `/admins/:id`                         | Admin                      |
| `GET`    | `/students`                           | Admin, Moderator           |
| `GET`    | `/students/me`                        | Student                    |
| `PATCH`  | `/students/me`                        | Student                    |
| `GET`    | `/students/:id`                       | Admin, Moderator           |
| `POST`   | `/students/:id/suspend`               | Admin, Moderator           |
| `DELETE` | `/students/:id`                       | Admin                      |
| `POST`   | `/saved_campuses`                     | Student                    |
| `GET`    | `/saved_campuses`                     | Student                    |
| `GET`    | `/saved_campuses/:campus_id`          | Student                    |
| `PATCH`  | `/saved_campuses/:campus_id`          | Student                    |
| `DELETE` | `/saved_campuses/:campus_id`          | Student                    |
| `POST`   | `/books`                              | Student                    |
| `GET`    | `/books`                              | Public                     |
| `GET`    | `/books/admin`                        | Admin, Moderator           |
| `GET`    | `/books/me`                           | Student                    |
| `GET`    | `/books/:id`                          | Student, Admin, Moderator  |
| `PATCH`  | `/books/:id`                          | Student                    |
| `POST`   | `/books/:id/:status`                  | Admin, Moderator           |
| `DELETE` | `/books/:id`                          | Student                    |
| `POST`   | `/reports`                            | Student                    |
| `GET`    | `/reports`                            | Admin, Moderator           |
| `GET`    | `/reports/me`                         | Student                    |
| `GET`    | `/reports/:id`                        | Admin, Moderator           |
| `POST`   | `/reports/:id/:status`                | Admin, Moderator           |
| `POST`   | `/feedbacks`                          | Public                     |
| `GET`    | `/feedbacks`                          | Admin, Moderator           |
| `GET`    | `/feedbacks/:id`                      | Admin, Moderator           |
| `PATCH`  | `/feedbacks/:id`                      | Admin, Moderator           |

---

## Auth

### Register Student

`POST /auth/student/register` · **Public**

Creates a student account and signs the student in by setting the `token` cookie.

**Body**

| Field          | Type    | Required | Rules                       |
| -------------- | ------- | -------- | --------------------------- |
| `full_name`    | string  | Yes      | 2 to 255 characters         |
| `contact_no`   | string  | Yes      | `+880XXXXXXXXXX`, unique    |
| `email`        | string  | Yes      | Valid email, unique         |
| `password`     | string  | Yes      | 6 to 40 characters          |
| `college_id`   | integer | Yes      | Existing college            |
| `edu_level_id` | integer | Yes      | Existing education level    |
| `upazila_id`   | integer | Yes      | Existing upazila            |
| `address`      | string  | No       | Up to 500 characters        |

```json
{
  "full_name": "Rahim Uddin",
  "contact_no": "+8801712345678",
  "email": "rahim@example.com",
  "password": "secret123",
  "college_id": 1,
  "edu_level_id": 1,
  "upazila_id": 1,
  "address": "Mirpur 10, Dhaka"
}
```

**Response** `201 Created` (sets `token` cookie)

```json
{
  "id": 25,
  "full_name": "Rahim Uddin",
  "contact_no": "+8801712345678",
  "email": "rahim@example.com",
  "college_id": 1,
  "edu_level_id": 1,
  "upazila_id": 1,
  "address": "Mirpur 10, Dhaka",
  "status": "active",
  "role": "student",
  "created_at": "2026-11-26T15:57:53.104Z",
  "updated_at": "2026-11-26T15:57:53.104Z"
}
```

**Errors**

| Status | `error`                         |
| ------ | ------------------------------- |
| `400`  | `Email already exists`          |
| `400`  | `Phone number already exists`   |
| `400`  | `Invalid college`               |
| `400`  | `Invalid standard` (education level) |
| `400`  | `Invalid upazila`               |

---

### Student Login

`POST /auth/student/login` · **Public**

**Body**

| Field      | Type   | Required | Rules              |
| ---------- | ------ | -------- | ------------------ |
| `email`    | string | Yes      | Valid email        |
| `password` | string | Yes      | 6 to 40 characters |

```json
{
  "email": "rahim@example.com",
  "password": "secret123"
}
```

**Response** `200 OK` (sets `token` cookie)

```json
{
  "id": 25,
  "full_name": "Rahim Uddin",
  "contact_no": "+8801712345678",
  "email": "rahim@example.com",
  "college_id": 1,
  "role": "student",
  "edu_level_id": 1,
  "status": "active",
  "upazila_id": 1,
  "address": "Mirpur 10, Dhaka",
  "created_at": "2026-11-26T15:57:53.104Z",
  "updated_at": "2026-11-26T15:57:53.104Z"
}
```

**Errors**

| Status | `error`                      |
| ------ | ---------------------------- |
| `401`  | `Invalid email or password`  |
| `403`  | `Your account is suspended`  |

---

### Admin Login

`POST /auth/admin/login` · **Public**

Signs in an admin or moderator.

**Body**

| Field      | Type   | Required | Rules              |
| ---------- | ------ | -------- | ------------------ |
| `email`    | string | Yes      | Valid email        |
| `password` | string | Yes      | 6 to 40 characters |

**Response** `200 OK` (sets `token` cookie)

```json
{
  "id": 7,
  "full_name": "Karim Hossain",
  "email": "karim@example.com",
  "role": "moderator",
  "contact_no": "+8801812345678",
  "status": "active"
}
```

**Errors**

| Status | `error`                      |
| ------ | ---------------------------- |
| `401`  | `Invalid email or password`  |
| `403`  | `Your account is suspended`  |

---

### Logout

`POST /auth/logout` · **Public**

Clears the `token` cookie.

**Response** `200 OK`

```json
{
  "message": "logout successful"
}
```

---

### Update Student Password

`POST /auth/student/me/update-password` · **Student**

Changes the signed-in student's password and clears the `token` cookie, so the student has to sign in again.

**Body**

| Field              | Type   | Required | Rules                            |
| ------------------ | ------ | -------- | -------------------------------- |
| `old_password`     | string | Yes      | 6 to 40 characters               |
| `new_password`     | string | Yes      | 6 to 40, different from the old  |
| `confirm_password` | string | Yes      | Must equal `new_password`        |

```json
{
  "old_password": "secret123",
  "new_password": "secret456",
  "confirm_password": "secret456"
}
```

**Response** `204 No Content` (clears `token` cookie)

**Errors**

| Status | `error`                                            |
| ------ | -------------------------------------------------- |
| `400`  | `New password and confirm password do not match`   |
| `400`  | `Invalid password` (old password is wrong)         |
| `400`  | `Can't use old password`                           |
| `403`  | `Your account is suspended`                        |
| `404`  | `Student not found`                                |

---

### Update Admin Password

`POST /auth/admin/me/update-password` · **Admin, Moderator**

Same body, response and rules as [Update Student Password](#update-student-password). A missing account returns `404` with `Admin not found`.

---

## Admins

Admin management is limited to the master admin (`admin` role). The master admin can't view, suspend or delete their own account, or another `admin` account, through these endpoints.

### List Moderators

`GET /admins` · **Admin**

Returns moderator accounts. Accounts with the `admin` role are left out. Paginated, newest first.

**Query**

| Param       | Type    | Description                                                  |
| ----------- | ------- | ------------------------------------------------------------ |
| `status`    | string  | `active`, `inactive` or `suspended`.                         |
| `email`     | string  | Valid email; case-insensitive partial match.                 |
| `full_name` | string  | 2 to 100 characters; case-insensitive partial match.         |
| `limit`     | integer | See [Pagination](#pagination).                               |
| `page`      | integer | See [Pagination](#pagination).                               |

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": 7,
      "full_name": "Karim Hossain",
      "email": "karim@example.com",
      "contact_no": "+8801812345678",
      "role": "moderator",
      "status": "active",
      "created_at": "2026-11-03T03:01:27.060Z",
      "updated_at": "2026-11-10T15:43:32.323Z"
    }
  ],
  "limit": 10,
  "page": 1,
  "total": 1,
  "totalPages": 1
}
```

---

### Create Moderator

`POST /admins/register` · **Admin**

**Body**

| Field        | Type   | Required | Rules               |
| ------------ | ------ | -------- | ------------------- |
| `full_name`  | string | Yes      | 2 to 100 characters |
| `email`      | string | Yes      | Valid email, unique |
| `password`   | string | Yes      | 6 to 40 characters  |
| `contact_no` | string | Yes      | `+880XXXXXXXXXX`    |

```json
{
  "full_name": "Karim Hossain",
  "email": "karim@example.com",
  "password": "secret123",
  "contact_no": "+8801812345678"
}
```

**Response** `201 Created`

```json
{
  "id": 7,
  "full_name": "Karim Hossain",
  "email": "karim@example.com",
  "contact_no": "+8801812345678",
  "role": "moderator",
  "status": "active",
  "created_at": "2026-11-26T15:57:55.274Z",
  "updated_at": "2026-11-26T15:57:55.274Z"
}
```

**Errors**

| Status | `error`                 |
| ------ | ----------------------- |
| `400`  | `Email already exists`  |

---

### Get Moderator

`GET /admins/:id` · **Admin**

**Response** `200 OK`

```json
{
  "full_name": "Karim Hossain",
  "email": "karim@example.com",
  "contact_no": "+8801812345678",
  "role": "moderator",
  "status": "active",
  "created_at": "2026-11-26T15:57:53.853Z"
}
```

**Errors**

| Status | `error`      | When                                           |
| ------ | ------------ | ---------------------------------------------- |
| `403`  | `Forbidden`  | The id is the caller's or another `admin`'s.   |
| `404`  | `Not Found`  | No account with this id.                       |

---

### Update Own Profile

`PATCH /admins/me` · **Admin, Moderator**

Updates the signed-in admin's profile. At least one field is required.

**Body**

| Field        | Type   | Required | Rules               |
| ------------ | ------ | -------- | ------------------- |
| `full_name`  | string | No       | 2 to 100 characters |
| `contact_no` | string | No       | `+880XXXXXXXXXX`    |

**Response** `200 OK`

```json
{
  "full_name": "Karim Hossain",
  "contact_no": "+8801812345678",
  "email": "karim@example.com",
  "role": "moderator",
  "status": "active",
  "created_at": "2026-11-26T15:57:53.853Z",
  "updated_at": "2026-11-26T15:57:55.298Z"
}
```

**Errors**

| Status | `error`                                            |
| ------ | -------------------------------------------------- |
| `400`  | `At least one field must be provided to update`    |
| `404`  | `Not Found`                                        |

---

### Suspend Moderator

`POST /admins/:id/suspend` · **Admin**

No body.

**Response** `200 OK`

```json
{
  "id": 7,
  "full_name": "Karim Hossain",
  "email": "karim@example.com",
  "contact_no": "+8801812345678",
  "role": "moderator",
  "status": "suspended",
  "suspended_by": 1,
  "suspended_at": "2026-11-26T15:57:55.301Z",
  "created_at": "2026-11-26T15:57:55.274Z",
  "updated_at": "2026-11-26T15:57:55.301Z"
}
```

**Errors**

| Status | `error`      | When                                                              |
| ------ | ------------ | ----------------------------------------------------------------- |
| `403`  | `Forbidden`  | The id is the caller's or another `admin`'s, or it's already suspended. |
| `404`  | `Not Found`  | No account with this id.                                          |

---

### Delete Moderator

`DELETE /admins/:id` · **Admin**

**Response** `204 No Content`

**Errors**

| Status | `error`      | When                                           |
| ------ | ------------ | ---------------------------------------------- |
| `403`  | `Forbidden`  | The id is the caller's or another `admin`'s.   |
| `404`  | `Not Found`  | No account with this id.                       |

---

## Students

### List Students

`GET /students` · **Admin, Moderator**

Paginated, newest first.

**Query**

| Param          | Type    | Description                                                                                       |
| -------------- | ------- | ------------------------------------------------------------------------------------------------- |
| `search`       | string  | Case-insensitive match on name, phone, email, college name, and upazila, district or division name (English or Bangla). |
| `college_id`   | integer | Filter by college.                                                                                |
| `edu_level_id` | integer | Filter by education level.                                                                        |
| `status`       | string  | `active`, `inactive` or `suspended`.                                                              |
| `upazila_id`   | integer | Filter by upazila.                                                                                |
| `district_id`  | integer | Filter by district.                                                                               |
| `limit`        | integer | See [Pagination](#pagination).                                                                    |
| `page`         | integer | See [Pagination](#pagination).                                                                    |

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": 25,
      "full_name": "Rahim Uddin",
      "contact_no": "+8801712345678",
      "email": "rahim@example.com",
      "college_id": 1,
      "edu_level_id": 1,
      "status": "active",
      "upazila_id": 1,
      "district_id": 1,
      "division_id": 1,
      "suspended_by": null,
      "suspend_admin_name": null,
      "college_name": "GOVT. P. C. COLLEGE",
      "level_info": "honours 1st year",
      "upazila_name": "Debidwar",
      "upazila_bn_name": "দেবিদ্বার",
      "district_name": "Comilla",
      "district_bn_name": "কুমিল্লা",
      "division_name": "Chattagram",
      "division_bn_name": "চট্টগ্রাম"
    }
  ],
  "limit": 10,
  "page": 1,
  "total": 1,
  "totalPages": 1
}
```

---

### Get Own Profile

`GET /students/me` · **Student**

**Response** `200 OK`

```json
{
  "id": 25,
  "full_name": "Rahim Uddin",
  "contact_no": "+8801712345678",
  "email": "rahim@example.com",
  "college_id": 1,
  "edu_level_id": 1,
  "status": "active",
  "upazila_id": 1,
  "district_id": 1,
  "division_id": 1,
  "suspended_at": null,
  "suspend_reason": null,
  "address": "Mirpur 10, Dhaka",
  "created_at": "2026-11-26T15:57:53.104Z",
  "updated_at": "2026-11-26T15:57:53.104Z",
  "suspended_by": null,
  "suspend_admin_name": null,
  "college_name": "GOVT. P. C. COLLEGE",
  "level_info": "honours 1st year",
  "upazila_name": "Debidwar",
  "upazila_bn_name": "দেবিদ্বার",
  "district_name": "Comilla",
  "district_bn_name": "কুমিল্লা",
  "division_name": "Chattagram",
  "division_bn_name": "চট্টগ্রাম"
}
```

**Errors**

| Status | `error`                 |
| ------ | ----------------------- |
| `403`  | `Student is suspended`  |
| `404`  | `Student not found`     |

---

### Update Own Profile

`PATCH /students/me` · **Student**

At least one field is required.

**Body**

| Field          | Type           | Required | Rules                                   |
| -------------- | -------------- | -------- | --------------------------------------- |
| `full_name`    | string         | No       | 2 to 255 characters                     |
| `contact_no`   | string         | No       | `+880XXXXXXXXXX`, not used by another student |
| `college_id`   | integer        | No       | Existing college                        |
| `edu_level_id` | integer        | No       | Existing education level                |
| `status`       | string         | No       | `active` or `inactive`                  |
| `upazila_id`   | integer        | No       | Existing upazila                        |
| `address`      | string \| null | No       | Up to 500 characters; `null` clears it  |

```json
{
  "address": "Uttara, Dhaka"
}
```

**Response** `200 OK`

```json
{
  "message": "student patched successfully"
}
```

**Errors**

| Status | `error`                                                                  |
| ------ | ------------------------------------------------------------------------ |
| `400`  | `At least one field must be provided to update`                          |
| `400`  | `contact no is already used by other student. use your own contact no`   |
| `400`  | `Invalid upazila id` / `Invalid college id` / `Invalid education level id` |
| `403`  | `Student is suspended`                                                   |
| `404`  | `Student not found`                                                      |

---

### Get Student

`GET /students/:id` · **Admin, Moderator**

Returns the same shape as [Get Own Profile](#get-own-profile), for any student, suspended ones included.

**Errors**

| Status | `error`              |
| ------ | -------------------- |
| `404`  | `Student not found`  |

---

### Suspend Student

`POST /students/:id/suspend` · **Admin, Moderator**

Suspended students can't sign in, and their books are hidden from public listings.

**Body** (optional)

| Field            | Type   | Required | Rules              |
| ---------------- | ------ | -------- | ------------------ |
| `suspend_reason` | string | No       | 3 to 500 characters |

```json
{
  "suspend_reason": "Repeated fake listings"
}
```

**Response** `200 OK`

```json
{
  "message": "Student suspension successful"
}
```

**Errors**

| Status | `error`                         |
| ------ | ------------------------------- |
| `404`  | `Student not found`             |
| `409`  | `student is suspended already`  |

---

### Delete Student

`DELETE /students/:id` · **Admin**

Permanently deletes the student together with their saved campuses, books and reports.

**Response** `204 No Content`

**Errors**

| Status | `error`              |
| ------ | -------------------- |
| `404`  | `Student not found`  |

---

## Saved Campuses

A saved campus is a college where the student is willing to meet buyers. A student can save up to **10** campuses, one per college. Every book must use one of the owner's saved campuses as its meeting place.

All endpoints in this section are **Student** only and act on the signed-in student's own campuses.

### Create Campus

`POST /saved_campuses` · **Student**

**Body**

| Field           | Type    | Required | Rules               |
| --------------- | ------- | -------- | ------------------- |
| `college_id`    | integer | Yes      | Existing college, not already saved |
| `meeting_place` | string  | No       | 2 to 300 characters |

```json
{
  "college_id": 1,
  "meeting_place": "Main gate"
}
```

**Response** `201 Created`

```json
{
  "id": 14,
  "college_id": 1,
  "meeting_place": "Main gate",
  "created_at": "2026-11-26T15:57:55.336Z",
  "updated_at": "2026-11-26T15:57:55.336Z"
}
```

**Errors**

| Status | `error`                  |
| ------ | ------------------------ |
| `400`  | `max campus exceeds`     |
| `400`  | `campus already saved`   |

---

### List Campuses

`GET /saved_campuses` · **Student**

Not paginated (at most 10 items), newest first.

**Response** `200 OK`

```json
[
  {
    "id": 14,
    "college_id": 1,
    "meeting_place": "Main gate",
    "created_at": "2026-11-26T15:57:55.336Z",
    "updated_at": "2026-11-26T15:57:55.336Z",
    "college_name": "GOVT. P. C. COLLEGE",
    "college_code": "0101",
    "college_address": "VILL-HARINKHANA, P.O- P.C. COLLEGE, BAGERHAT"
  }
]
```

---

### Get Campus

`GET /saved_campuses/:campus_id` · **Student**

**Response** `200 OK`: one item with the same shape as in [List Campuses](#list-campuses).

**Errors**

| Status | `error`                 |
| ------ | ----------------------- |
| `404`  | `campus doesn't exist`  |

---

### Update Campus

`PATCH /saved_campuses/:campus_id` · **Student**

At least one field is required.

**Body**

| Field           | Type    | Required | Rules               |
| --------------- | ------- | -------- | ------------------- |
| `meeting_place` | string  | No       | 2 to 300 characters |
| `college_id`    | integer | No       | Existing college    |

**Response** `200 OK`

```json
{
  "id": 14,
  "student_id": 25,
  "college_id": 1,
  "meeting_place": "Main gate, near canteen",
  "created_at": "2026-11-26T15:57:55.336Z",
  "updated_at": "2026-11-26T15:57:55.336Z"
}
```

**Errors**

| Status | `error`                                            |
| ------ | -------------------------------------------------- |
| `400`  | `At least one field must be provided to update`    |
| `400`  | `Invalid college id`                               |
| `404`  | `campus not found`                                 |

---

### Delete Campus

`DELETE /saved_campuses/:campus_id` · **Student**

If any of the student's books use this campus, pass `altCampusId`. Those books are moved to the alternative campus before this one is deleted.

**Query**

| Param         | Type    | Required                          | Rules                                  |
| ------------- | ------- | --------------------------------- | -------------------------------------- |
| `altCampusId` | integer | When books use this campus        | Another of the student's saved campuses |

**Response** `204 No Content`

**Errors**

| Status | `error`                                          |
| ------ | ------------------------------------------------ |
| `400`  | `campus & aleternative campus can't be same`     |
| `400`  | `alternative campus required`                    |
| `400`  | `invalid alternative campus id`                  |
| `404`  | `campus not found`                               |

---

## Books

### Create Book

`POST /books` · **Student**

**Body**

| Field               | Type    | Required | Default      | Rules                                              |
| ------------------- | ------- | -------- | ------------ | -------------------------------------------------- |
| `image_key`         | string  | Yes      |              | 1 to 500 characters (storage key of the cover image) |
| `title`             | string  | Yes      |              | 2 to 200 characters                                |
| `author`            | string  | Yes      |              | 2 to 200 characters                                |
| `edu_level_id`      | integer | Yes      |              | Existing education level                           |
| `book_type`         | string  | No       | `class_book` | [Book type](#enumerations)                         |
| `publication`       | string  | Yes      |              | 2 to 200 characters                                |
| `paper_code`        | integer | Yes      |              | Positive integer                                   |
| `condition`         | string  | No       | `normal`     | [Book condition](#enumerations)                    |
| `original_price`    | integer | Yes      |              | Positive integer                                   |
| `selling_price`     | integer | Yes      |              | Positive, not more than `original_price`           |
| `is_negotiable`     | boolean | No       | `true`       |                                                    |
| `publication_year`  | integer | Yes      |              | Not in the future                                  |
| `status`            | string  | No       | `active`     | `active` or `draft`                                |
| `description`       | string  | No       |              | Up to 1000 characters                              |
| `meeting_campus_id` | integer | Yes      |              | One of the student's saved campuses                |
| `contact_no`        | string  | No       | Student's phone | `+880XXXXXXXXXX`                                |

```json
{
  "image_key": "books/higher-math.jpg",
  "title": "Higher Mathematics 1st Paper",
  "author": "S. U. Ahmed",
  "edu_level_id": 1,
  "book_type": "class_book",
  "publication": "Hasan Book House",
  "paper_code": 101,
  "condition": "like_new",
  "original_price": 500,
  "selling_price": 350,
  "is_negotiable": false,
  "publication_year": 2023,
  "status": "active",
  "description": "Barely used, no marks inside",
  "meeting_campus_id": 14
}
```

**Response** `201 Created`

```json
{
  "id": 42,
  "image_key": "books/higher-math.jpg",
  "title": "Higher Mathematics 1st Paper",
  "author": "S. U. Ahmed",
  "posted_by": 25,
  "edu_level_id": 1,
  "book_type": "class_book",
  "publication": "Hasan Book House",
  "paper_code": 101,
  "condition": "like_new",
  "original_price": 500,
  "selling_price": 350,
  "is_negotiable": false,
  "publication_year": 2023,
  "status": "active",
  "description": "Barely used, no marks inside",
  "meeting_campus_id": 14,
  "contact_no": "+8801712345678",
  "restricted_by": null,
  "restricted_reason": null,
  "restricted_at": null,
  "created_at": "2026-11-26T15:57:55.356Z"
}
```

**Errors**

| Status | `error`                                                |
| ------ | ------------------------------------------------------ |
| `400`  | `Selling price can't be greater than original price`   |
| `400`  | `Invalid education level id`                           |
| `400`  | `Invalid meeting campus id`                            |
| `403`  | `Student is suspended`                                 |
| `404`  | `Student not found`                                    |

---

### List Books (Public)

`GET /books` · **Public**

Lists `active` books whose sellers aren't suspended. Works with or without a cookie. Paginated; newest first unless `sortBy` is given.

**Query**

| Param          | Type    | Description                                                   |
| -------------- | ------- | ------------------------------------------------------------- |
| `title`        | string  | Case-insensitive partial match.                               |
| `author`       | string  | Case-insensitive partial match.                               |
| `publication`  | string  | Case-insensitive partial match.                               |
| `level`        | string  | Education level name, case-insensitive exact match (e.g. `honours`). |
| `department`   | string  | Department, case-insensitive exact match (e.g. `mathematics`). |
| `year`         | string  | `1st`, `2nd`, `3rd` or `4th`.                                 |
| `type`         | string  | [Book type](#enumerations).                                   |
| `papercode`    | integer | Exact paper code.                                             |
| `condition`    | string  | [Book condition](#enumerations).                              |
| `price_min`    | integer | Minimum selling price. Must not exceed `price_max`.           |
| `price_max`    | integer | Maximum selling price.                                        |
| `isNegotiable` | string  | `true` or `false`.                                            |
| `college`      | integer | College id of the meeting campus.                             |
| `sortBy`       | string  | `original_price` or `selling_price`.                          |
| `sortOrder`    | string  | `asc` (default) or `desc`. Used with `sortBy`.                |
| `limit`        | integer | See [Pagination](#pagination).                                |
| `page`         | integer | See [Pagination](#pagination).                                |

```
GET /api/v1/books?department=mathematics&year=1st&price_max=400&sortBy=selling_price&sortOrder=asc
```

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": 42,
      "title": "Higher Mathematics 1st Paper",
      "level": "honours mathematics 1st year",
      "type": "class_book",
      "selling_price": 350
    }
  ],
  "limit": 10,
  "page": 1,
  "total": 1,
  "totalPages": 1
}
```

**Errors**

| Status | `error`                                              |
| ------ | ---------------------------------------------------- |
| `400`  | `Minimum price can't be greater than maximum price`  |

---

### List Books (Admin)

`GET /books/admin` · **Admin, Moderator**

Accepts the same query parameters and returns the same shape as [List Books (Public)](#list-books-public). It includes every status except `draft`, and books of suspended sellers.

---

### List Own Books

`GET /books/me` · **Student**

Lists the signed-in student's books in every status. Paginated, newest first.

**Query**

| Param    | Type    | Description                         |
| -------- | ------- | ----------------------------------- |
| `title`  | string  | Case-insensitive partial match.     |
| `status` | string  | [Book status](#enumerations).       |
| `type`   | string  | [Book type](#enumerations).         |
| `limit`  | integer | See [Pagination](#pagination).      |
| `page`   | integer | See [Pagination](#pagination).      |

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": 42,
      "title": "Higher Mathematics 1st Paper",
      "level": "honours mathematics 1st year",
      "type": "class_book",
      "selling_price": 350,
      "status": "active",
      "created_at": "2026-11-26T15:57:55.356Z"
    }
  ],
  "limit": 10,
  "page": 1,
  "total": 1,
  "totalPages": 1
}
```

**Errors**

| Status | `error`                 |
| ------ | ----------------------- |
| `403`  | `Student is suspended`  |
| `404`  | `Student not found`     |

---

### Get Book

`GET /books/:id` · **Student, Admin, Moderator**

Who can see a book:

- **Owner**: their own book in any status.
- **Other students**: `active` books whose seller isn't suspended.
- **Admins and moderators**: every status except `draft`. Their response also includes `restricted_by` and `restricted_admin_name`.

A book the caller can't see returns `404`, the same as a missing book.

**Response** `200 OK`

```json
{
  "id": 42,
  "image_key": "books/higher-math.jpg",
  "title": "Higher Mathematics 1st Paper",
  "author": "S. U. Ahmed",
  "posted_by": 25,
  "seller_name": "Rahim Uddin",
  "edu_level_id": 1,
  "level": "honours mathematics 1st year",
  "type": "class_book",
  "publication": "Hasan Book House",
  "paper_code": 101,
  "condition": "like_new",
  "original_price": 500,
  "selling_price": 350,
  "is_negotiable": false,
  "publication_year": 2023,
  "status": "active",
  "description": "Barely used, no marks inside",
  "meeting_campus_id": 14,
  "meeting_place": "Main gate, near canteen",
  "college_id": 1,
  "college_name": "GOVT. P. C. COLLEGE",
  "contact_no": "+8801712345678",
  "restricted_reason": null,
  "restricted_at": null,
  "created_at": "2026-11-26T15:57:55.356Z"
}
```

Admin and moderator responses add:

```json
{
  "restricted_by": null,
  "restricted_admin_name": null
}
```

**Errors**

| Status | `error`           |
| ------ | ----------------- |
| `404`  | `Book not found`  |

---

### Update Book

`PATCH /books/:id` · **Student** (owner only)

Updates any subset of the book's fields. At least one field is required. Status changes must follow the [student transitions](#book-status-lifecycle).

**Body**

Every field from [Create Book](#create-book) is accepted and optional, with these differences:

| Field         | Difference                                                    |
| ------------- | ------------------------------------------------------------- |
| `status`      | `active`, `sold_out` or `archived` only.                      |
| `description` | Can be `null` to clear it.                                    |
| Prices        | If only one price is sent, it is compared with the stored one. |

```json
{
  "selling_price": 320
}
```

**Response** `200 OK`: the updated book, in the same shape as the [Create Book](#create-book) response.

**Errors**

| Status | `error`                                                |
| ------ | ------------------------------------------------------ |
| `400`  | `At least one field must be provided to update`        |
| `400`  | `Selling price can't be greater than original price`   |
| `400`  | `Invalid education level id`                           |
| `400`  | `Invalid meeting campus id`                            |
| `403`  | `restricted books can't be updated`                    |
| `403`  | `Student is suspended`                                 |
| `404`  | `Book not found` (missing, or owned by someone else)   |
| `409`  | `only draft & archived books can be active`            |
| `409`  | `only active books can be sold_out`                    |
| `409`  | `only sold_out & draft books can be archived`          |
| `409`  | `book was changed meanwhile, please try again`         |

---

### Restrict Book or Move It to Draft

`POST /books/:id/:status` · **Admin, Moderator**

| `:status`    | Effect                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `restricted` | Blocks the book and records `restricted_by`, `restricted_reason` and `restricted_at`. The owner can still see it, but can't edit or delete it. |
| `draft`      | Lifts a restriction: sets the book to `draft` and clears the restriction fields, so the owner can fix and re-publish it. |

**Body** (required for `restricted` only)

| Field               | Type   | Required          | Rules               |
| ------------------- | ------ | ----------------- | ------------------- |
| `restricted_reason` | string | For `restricted`  | 10 to 500 characters |

```json
{
  "restricted_reason": "Listing photos are not of the real book"
}
```

**Response** `200 OK`

```json
{
  "message": "Book restricted successfully"
}
```

or

```json
{
  "message": "Book moved to draft successfully"
}
```

**Errors**

| Status | `error`                                              |
| ------ | ---------------------------------------------------- |
| `400`  | `Status param must be 'restricted' or 'draft'`       |
| `400`  | `Restricted reason is required`                      |
| `404`  | `Book not found` (missing, or a `draft`)             |
| `409`  | `book is already restricted`                         |
| `409`  | `only restricted books can be moved to draft`        |
| `409`  | `book was changed meanwhile, please try again`       |

---

### Delete Book

`DELETE /books/:id` · **Student** (owner only)

Permanently deletes the book and any reports filed on it. Restricted books can't be deleted, so the evidence stays available to admins.

**Response** `204 No Content`

**Errors**

| Status | `error`                                              |
| ------ | ---------------------------------------------------- |
| `403`  | `restricted books can't be deleted`                  |
| `403`  | `Student is suspended`                               |
| `404`  | `Book not found` (missing, or owned by someone else) |
| `409`  | `book was changed meanwhile, please try again`       |

---

## Reports

Students report a book or another student. Admins and moderators review the reports.

### Create Report

`POST /reports` · **Student**

**Body**

| Field        | Type    | Required             | Rules                                    |
| ------------ | ------- | -------------------- | ---------------------------------------- |
| `type`       | string  | No (default `book`)  | `book` or `student`                      |
| `book_id`    | integer | When `type` is `book`    | Must not be sent for `student` reports |
| `student_id` | integer | When `type` is `student` | Must not be sent for `book` reports    |
| `reason`     | string  | Yes                  | At least 20 characters                   |

No other fields are allowed.

```json
{
  "type": "book",
  "book_id": 42,
  "reason": "The photos do not match the actual book condition"
}
```

**Response** `201 Created`

```json
{
  "id": 9,
  "type": "book",
  "book_id": 42,
  "student_id": null,
  "reported_by": 31,
  "reason": "The photos do not match the actual book condition",
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null,
  "created_at": "2026-11-26T15:57:55.393Z"
}
```

**Errors**

| Status | `error`                                                   |
| ------ | --------------------------------------------------------- |
| `400`  | `book_id is required when report type is 'book'`         |
| `400`  | `student_id is required when report type is 'student'`   |
| `400`  | `Reason must be at least 20 characters long`              |
| `400`  | `you can't report your own book`                          |
| `400`  | `you can't report yourself`                               |
| `404`  | `Book not found`                                          |
| `404`  | `Student not found`                                       |

---

### List Reports

`GET /reports` · **Admin, Moderator**

Paginated, newest first.

**Query**

| Param         | Type    | Description                                                                         |
| ------------- | ------- | ----------------------------------------------------------------------------------- |
| `search`      | string  | Case-insensitive match on reason, reporter name/email, reported student name/email and book title. |
| `type`        | string  | `book` or `student`.                                                                |
| `status`      | string  | `pending`, `reviewed` or `action_taken`.                                            |
| `book_id`     | integer | Reports on this book.                                                               |
| `student_id`  | integer | Reports on this student.                                                            |
| `reported_by` | integer | Reports filed by this student.                                                      |
| `reviewed_by` | integer | Reports reviewed by this admin.                                                     |
| `limit`       | integer | See [Pagination](#pagination).                                                      |
| `page`        | integer | See [Pagination](#pagination).                                                      |

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": 9,
      "type": "book",
      "book_id": 42,
      "student_id": null,
      "reported_by": 31,
      "reason": "The photos do not match the actual book condition",
      "status": "pending",
      "reviewed_by": null,
      "reviewed_at": null,
      "created_at": "2026-11-26T15:57:55.393Z",
      "reporter_name": "Karima Begum",
      "reporter_email": "karima@example.com",
      "reported_student_name": null,
      "reported_student_email": null,
      "reported_book_title": "Higher Mathematics 1st Paper",
      "reviewer_name": null
    }
  ],
  "limit": 10,
  "page": 1,
  "total": 1,
  "totalPages": 1
}
```

---

### List Own Reports

`GET /reports/me` · **Student**

Reports filed by the signed-in student. Paginated, newest first.

**Query**

| Param    | Type    | Description                                 |
| -------- | ------- | ------------------------------------------- |
| `type`   | string  | `book` or `student`.                        |
| `status` | string  | `pending`, `reviewed` or `action_taken`.    |
| `limit`  | integer | See [Pagination](#pagination).              |
| `page`   | integer | See [Pagination](#pagination).              |

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": 9,
      "type": "book",
      "book_id": 42,
      "student_id": null,
      "reason": "The photos do not match the actual book condition",
      "status": "pending",
      "reviewed_at": null,
      "created_at": "2026-11-26T15:57:55.393Z",
      "reported_student_name": null,
      "reported_book_title": "Higher Mathematics 1st Paper"
    }
  ],
  "limit": 10,
  "page": 1,
  "total": 1,
  "totalPages": 1
}
```

---

### Get Report

`GET /reports/:id` · **Admin, Moderator**

**Response** `200 OK`: one item with the same shape as in [List Reports](#list-reports).

**Errors**

| Status | `error`             |
| ------ | ------------------- |
| `404`  | `Report not found`  |

---

### Update Report Status

`POST /reports/:id/:status` · **Admin, Moderator**

Marks a `pending` report as `reviewed` or `action_taken` and records `reviewed_by` and `reviewed_at`. No body.

```
POST /api/v1/reports/9/action_taken
```

**Response** `200 OK`

```json
{
  "message": "Report status updated successfully"
}
```

**Errors**

| Status | `error`                                                  |
| ------ | -------------------------------------------------------- |
| `400`  | `Status param must be 'reviewed' or 'action_taken'`      |
| `404`  | `Report not found`                                       |
| `409`  | `only pending reports can be updated`                    |

---

## Feedbacks

Anyone can send feedback about the platform; admins and moderators review it.

### Send Feedback

`POST /feedbacks` · **Public**

**Body**

| Field         | Type   | Required | Rules                  |
| ------------- | ------ | -------- | ---------------------- |
| `subject`     | string | Yes      | 3 to 300 characters    |
| `full_name`   | string | Yes      | 2 to 100 characters    |
| `contact_no`  | string | Yes      | `+880XXXXXXXXXX`       |
| `email`       | string | Yes      | Valid email            |
| `description` | string | Yes      | 10 to 5000 characters  |

```json
{
  "subject": "Search is slow",
  "full_name": "Nusrat Jahan",
  "contact_no": "+8801912345678",
  "email": "nusrat@example.com",
  "description": "Searching books by title takes several seconds."
}
```

**Response** `201 Created`

```json
{
  "id": 5,
  "subject": "Search is slow",
  "full_name": "Nusrat Jahan",
  "contact_no": "+8801912345678",
  "email": "nusrat@example.com",
  "description": "Searching books by title takes several seconds.",
  "status": "pending",
  "created_at": "2026-11-26T15:57:55.425Z",
  "reviewed_by": null,
  "reviewed_at": null
}
```

---

### List Feedbacks

`GET /feedbacks` · **Admin, Moderator**

Paginated, newest first.

**Query**

| Param     | Type    | Description                                        |
| --------- | ------- | -------------------------------------------------- |
| `subject` | string  | Case-insensitive partial match.                    |
| `status`  | string  | `pending`, `reviewed` or `mark-as-improvement`.    |
| `limit`   | integer | See [Pagination](#pagination).                     |
| `page`    | integer | See [Pagination](#pagination).                     |

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": 5,
      "subject": "Search is slow",
      "full_name": "Nusrat Jahan",
      "contact_no": "+8801912345678",
      "email": "nusrat@example.com",
      "description": "Searching books by title takes several seconds.",
      "status": "reviewed",
      "created_at": "2026-11-26T15:57:55.425Z",
      "reviewed_by": 7,
      "reviewed_at": "2026-11-27T09:12:40.118Z",
      "reviewer_name": "Karim Hossain"
    }
  ],
  "limit": 10,
  "page": 1,
  "total": 1,
  "totalPages": 1
}
```

---

### Get Feedback

`GET /feedbacks/:id` · **Admin, Moderator**

**Response** `200 OK`: one item with the same shape as in [List Feedbacks](#list-feedbacks).

**Errors**

| Status | `error`               |
| ------ | --------------------- |
| `404`  | `feedback not found`  |

---

### Update Feedback Status

`PATCH /feedbacks/:id` · **Admin, Moderator**

Only `pending` feedback can be updated. Records the caller as `reviewed_by` and the current time as `reviewed_at`.

**Body**

| Field    | Type   | Required | Rules                                |
| -------- | ------ | -------- | ------------------------------------ |
| `status` | string | Yes      | `reviewed` or `mark-as-improvement`  |

```json
{
  "status": "reviewed"
}
```

**Response** `200 OK`: the updated feedback, in the same shape as the [Send Feedback](#send-feedback) response, with `status`, `reviewed_by` and `reviewed_at` filled in.

**Errors**

| Status | `error`                                                                  |
| ------ | ------------------------------------------------------------------------ |
| `400`  | `Invalid feedback status. Must be 'reviewed' or 'mark-as-improvement'`   |
| `409`  | `feedback status is already updated`                                     |
| `404`  | `feedback not found`                                                     |
