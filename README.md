# Collaborative Research Management Platform (CRMP) - Backend

This is the backend service for the Collaborative Research Management Platform (CRMP) - Group 11, a centralized, multi-tenant web application engineered to securely manage the academic research lifecycle, process real-time collaboration events, and ensure data integrity.

It serves as a decoupled, stateless REST API that powers the Next.js frontend, replacing fragmented institutional workflows with a unified, high-performance ecosystem.

## Tech Stack

* **Runtime & Framework:** Node.js, Express, TypeScript
* **Database & ORM:** PostgreSQL, Prisma ORM
* **Real-time:** Socket.io
* **Architecture:** Modular Monolith (Microservices-ready), Clean Architecture

## Architecture & Infrastructure

* **Clean Architecture Strategy:** Strict separation of concerns across Routes, Controllers, Services, and Data Access layers.
* **Stateless API Layer:** All REST endpoints must remain stateless, utilizing JWTs for session management to support horizontal scaling.
* **Containerization:** The application and database are fully containerized using Docker to guarantee parity across environments.
* **ORM:** Prisma enforces type safety between the TypeScript backend and the PostgreSQL database.

## Directory Structure

```text
CRMP-Backend/
├── prisma/                    # Database schema and relations
├── src/
│   ├── config/                # Environment variables, database connection config
│   ├── controllers/           # Route handlers (req, res logic)
│   ├── middlewares/           # Global logic (JWT verification, RBAC, error handling)
│   ├── routes/                # API route definitions
│   ├── services/              # Core business logic and database queries
│   ├── sockets/               # Real-time WebSockets event handlers
│   ├── utils/                 # Helper functions (password hashing, validators)
│   └── server.ts              # Entry point, Express app initialization
```

## Features & Requirements

### 1. Database Schema
Optimized for data integrity (3NF) and complex academic queries using PostgreSQL:
* **User:** Accounts, credentials, and basic info.
* **Project:** Core research workspace entity.
* **ProjectMember:** Join table managing Role-Based Access (PI, Co-Investigator, Assistant, Reviewer).
* **Task:** Project task management.
* **Document:** Collaborative rich-text or JSON documents.
* **Survey:** Dynamic survey forms (JSON schema).
* **ResearchOutput:** Academic outputs and ethical clearances.

### 2. REST API Routes
All endpoints (except `/api/auth/*`) require a valid Bearer JWT. `rbacMiddleware` intercepts requests based on project roles.

* **Auth:** Login and User Registration.
* **Projects:** Create, Read, and Manage projects and members.
* **Tasks:** Assign tasks and update completion status.
* **Surveys & Outputs:** Manage active surveys and log academic research outputs.

### 3. Real-Time Collaboration (Socket.io)
Manages persistent WebSocket connections for live document editing and dashboard updates.
* **Rooms:** Isolated broadcast events per `projectId`.
* **Events:**
  * `sendDocumentEdit`: Real-time operational transform syncing without conflicts.
  * `cursorMove`: Broadcasts active user cursor positions.
  * `broadcastActivity`: Live notifications for project activity feeds.

## Performance & Security Benchmarks

* **Response Latency:** All REST endpoints aim for <200ms latency under concurrent load.
* **Real-Time Stability:** Stable persistent multi-user connections via Socket.io.
* **Security:** `bcrypt` password hashing, strict CORS configurations, and Prisma's parametrized queries for SQL injection prevention.
