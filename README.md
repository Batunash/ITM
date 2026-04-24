# IT Service Management System (ITMS)

A centralized system that allows the IT team to manage incoming requests, track company assets, and report on service performance. Built as a SENG321 homework project at OSTIM Technical University.

## Tech Stack

- **Backend:** ASP.NET Core
- **Database:** PostgreSQL
- **Frontend:** React.js
- **Architecture:** Layered (Controller → Service → Repository)
- **Authentication:** JWT
- **API Documentation:** Swagger

## Purpose

Provides a single platform for the IT team to receive, triage, assign, and resolve service requests, while tracking the hardware/software assets the company owns.

## Target Users

- **End Users** — Employees who submit IT requests.
- **IT Support Agents** — Resolve assigned tickets.
- **IT Managers** — Assign tickets to agents and oversee operations.
- **System Admin** — Manages users, roles, and system configuration.

## Business Objectives

- Optimize ticket resolution times.
- Track company IT assets (hardware and software).
- Improve reporting and decision making.
- Provide transparency through auditing and log tracking.

## Modules

1. **User Management** — System Admin manages user accounts.
2. **Role & Permission Management** — Role-Based Access Control (RBAC).
3. **Authentication & Authorization** — Secure login via JWT.
4. **Dashboard** — Real-time KPIs (open tickets, agent activity, system metrics).
5. **Notification System** — Email notifications for ticket updates and events.
6. **Document & File Management** — Attach screenshots / error logs to tickets.
7. **Approval Workflows** — Approval steps for change requests and escalations.
8. **Reporting & Analytics** — Performance reports and usage statistics.
9. **Audit Logs** — Records user activities and system events.
10. **System Settings & Configuration** — Admin-configurable parameters.
11. **Backup & Data Management** — Regular database backups and safe storage.
12. **Ticket Management** — Create, update, and track support tickets.
13. **Agent Assignment** — IT Managers assign tickets to support agents.
14. **Asset Management** — Track hardware and software inventory.
15. **SLA Tracking & Reports** — Monitor SLA compliance and report violations.
16. **Customer History** — Past tickets and assigned assets per user.
17. **Change Requests** — Manages major IT changes (e.g., server updates) separately from incident tickets.

## Architecture

The system follows a three-tier architecture:

- **Presentation Layer** — React frontend handling user interaction and HTTP requests.
- **Application Layer** — ASP.NET Core backend handling business logic, validation, and persistence.
- **Data Layer** — PostgreSQL database for users, tickets, assets, and audit data.

The backend is organized into the following projects under [ITM/backend/](ITM/backend/):

- `ITMS.API` — Controllers, Swagger, JWT auth, HTTP entry point.
- `ITMS.Application` — Service layer and business logic.
- `ITMS.Domain` — Core entities and `BaseEntity` abstractions.
- `ITMS.Infrastructure` — Repositories, EF Core / PostgreSQL access.
- `ITMS.DemoSeeder` — Seeds demo data for development.
- `ITMS.Tests` — Unit tests for service-layer logic.

The frontend lives in [ITM/frontend/itms-ui/](ITM/frontend/itms-ui/).

## Database Design

- Normalized to **Third Normal Form (3NF)**.
- Foreign key constraints enforce referential integrity.
- Passwords are stored as **hashes**, never plaintext.
- Helper tables (`Roles`, `Permissions`, `AssetType`, etc.) are used instead of hardcoded enums for easier extensibility.

### Core Entities

| Entity | Purpose |
| --- | --- |
| `Users` | Authentication credentials and role assignments. |
| `Tickets` | Service requests linked to status, priority, creator, assigned agent. |
| `TicketHistory` | Audit trail of ticket status changes with timestamps. |
| `Assets` | Hardware/software inventory and ownership. |
| `Notifications` | Messages sent to users. |
| `SLAs` | Target resolution times per priority. |
| `ChangeRequests` | Major change approvals tracked separately from incidents. |
| `Attachments` | File metadata for ticket uploads. |
| `AuditLogs` | Critical user actions and system events. |
| `Roles`, `Permissions`, `RolePermissions` | RBAC configuration. |

### Key Relationships

- One Agent/User → many Tickets.
- One User → many Assets.
- One Ticket → many TicketHistory records and Attachments.
- One Role → many Users.

## Core Workflows

- **Creating a Ticket** — End user submits a form; `TicketService` creates the record and confirms.
- **Assigning a Ticket** — IT Manager assigns a ticket; system updates assignment and writes a `TicketHistory` log.
- **Resolving a Ticket** — Agent closes the ticket; system updates status and emails the original requester.
- **Asset Assignment** — IT Manager picks an asset; if `In Storage`, system links it to a user and marks it `In Use`.

## Development Standards

- Apply **SOLID** principles throughout the codebase.
- Use **Dependency Injection** for all services and repositories.
- Follow **Layered Architecture**: Controller → Service → Repository.
- Write **unit tests** for all Service-layer business logic.
- Document all APIs with **Swagger**.
- Use **JWT** for authentication and authorization.
- **Hash** all passwords with a secure algorithm.
- Apply **RBAC** to all endpoints.
- Store configuration values in the database (not hardcoded enums).
- Normalize the database schema to **3NF** with foreign key constraints.
- Maintain `AuditLog` entries for all critical actions.

## Author

Batuhan Okullu — Student ID `240208401`, Section 1 — OSTIM Technical University, SENG321.
