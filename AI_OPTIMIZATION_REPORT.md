# AI Optimization & Engineering Judgment Report

**Project:** ApparelFlow ERP - Verification Terminal
**Role:** Software Engineering Intern Assessment

## 1. Tools & Prompting

During the development of this application, I utilized **Gemini Pro** as my primary AI thought partner. My prompting strategy was strictly focused on seeking advice for industrial best practices, architectural design patterns, and resolving specific TypeScript compiler errors. I explicitly avoided using AI to blindly generate complete features. Instead, I used it to scaffold boilerplate code for Zod schemas, generate initial Jest test structures, and brainstorm optimal ways to implement Server-Side RBAC within the Next.js App Router context.

## 2. Flawed/Broken AI Code

While the AI was helpful for syntax and scaffolding, I encountered several instances where its suggestions were fundamentally flawed for a production environment, requiring immediate human intervention:

- **Instance 1: Unstable Dependency Installation (Prisma 8 RC)**
  When prompted for Prisma setup instructions, the AI suggested commands that inadvertently installed `Prisma 8.0.0-rc.14` (a highly unstable Release Candidate). This fundamentally broke the database migration process, as the CLI commands like `db push` were completely deprecated in that version, causing the backend to fail.
- **Instance 2: Poor Architectural Structure and Tightly Coupled Logic**
  The AI initially generated a flat directory structure, placing complex database transactions and business logic directly inside Next.js Server Actions and even UI components. This violated the separation of concerns, making the code impossible to unit test effectively and highly vulnerable to security bypasses.

## 3. Human Refactoring

To ensure the application met production-grade standards, I discarded the flawed AI suggestions and implemented the following manual refactors:

- **Dependency Correction:** I manually uninstalled the unstable Prisma release candidate and explicitly pinned the versions to the stable `prisma@5` and `@prisma/client@5`. I then re-wrote the `schema.prisma` using strict enums (`OrderStatus`, `ItemStatus`) to enforce data integrity at the database level rather than relying solely on application-level checks.
- **Architectural Overhaul:** I completely restructured the application into an N-tier architecture. I created a dedicated `services/` layer (e.g., `verify.service.ts`, `order.service.ts`) to handle all database transactions and business logic. I then restricted Server Actions (`actions/`) to act purely as controllers that validate RBAC permissions before passing sanitized data to the services. This made the codebase modular and testable.
- **Defensive Input Guards:** I manually implemented Zod schemas (`schemas/order.schema.ts`) to strictly validate incoming payloads, ensuring negative numbers and string injections were caught before hitting the database.

## 4. Defensive Architecture

To satisfy the strict server-enforced hard stop and separation of duties required by the domain, I designed a defensive state machine architecture:

- **Server-Side Session Validation:** The frontend UI state (like hidden buttons) is never trusted. All Server Actions authenticate the user via secure server-side cookies (`lib/session.ts`). If a non-verifier attempts to POST an approval, the system throws a strict `403 Forbidden`.
- **Atomic Transactions & Hard-Stop Logic:** Inside `verify.service.ts`, the traffic-light logic computes the status of each component. If ANY component evaluates to `RED` (Actual < Expected), the backend immediately aborts the operation and throws a `422 Unprocessable Entity` error. This guarantees that a shortage batch can never reach the `VERIFIED` state, regardless of any client-side manipulation via Postman or cURL.
- **Query Isolation:** The Sewing Queue endpoint queries the database strictly with `WHERE status = 'VERIFIED'`. Unverified or rejected orders are completely isolated at the database level, ensuring data leaks are structurally impossible.
