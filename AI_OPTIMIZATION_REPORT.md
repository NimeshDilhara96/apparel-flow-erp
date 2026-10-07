# AI Optimization Report — ApparelFlow ERP

> **Candidate Assessment Deliverable**
> This document candidly documents AI tool usage, flawed AI outputs identified, human refactoring decisions, and defensive architecture choices made during development.

---

## 1. Tools & Prompting

| AI Tool Used         | Tasks Assisted                                                                 |
|----------------------|--------------------------------------------------------------------------------|
| Google Antigravity (Claude Opus) | Project scaffolding, Prisma schema design, seed script generation, component logic |
| *(Add others if used)* | *(e.g., GitHub Copilot for autocomplete, v0 for UI mockups, etc.)*            |

### Prompting Strategy
- Used AI to generate the initial Prisma schema based on the assessment's relational entity requirements (6 tables, 4 enums).
- AI was provided the full assessment specification to ensure alignment with the BOM structure and state machine architecture.
- *(Continue documenting your prompting approach as you build...)*

---

## 2. Flawed / Broken AI Code (Minimum 2 Instances)

### Flaw #1: Prisma Init Command Failure — Conflicting with Prisma Composer Setup
- **What AI Generated:** The AI agent attempted to run `npx prisma init --datasource-provider postgresql` to automatically scaffold the Prisma directory, `.env` file, and `schema.prisma`. This standard command was expected to auto-generate all necessary boilerplate files.
- **Why It Was Wrong:** The project already had a `prisma.config.ts` file configured for **Prisma Composer** (`@prisma/composer` v0.26.0 with skills sync), and the `prisma` CLI (v8.0.0-rc) detected this existing configuration, causing a conflict. The `prisma init` command could not automatically create the expected files. The AI did not anticipate that the Prisma Composer configuration would interfere with the standard ORM initialization workflow.
- **Human Fix:** Manually created `prisma/schema.prisma`, `.env`, and `src/lib/prisma.ts` with full assessment-specific content — which was actually **superior** to the auto-generated boilerplate, since the schema included all 6 relational tables, 4 enums, and proper relations from the start instead of an empty template.
- **Lesson:** Always inspect the existing project configuration before running scaffold commands. AI agents assume standard setups but real projects often have non-standard tooling.

### Flaw #2: SHA-256 Password Hashing — Cryptographically Insecure for Authentication
- **What AI Generated:** In `prisma/seed.ts`, the AI generated a password hashing function using Node.js `crypto.createHash("sha256")`:
```typescript
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}
```
- **Why It Was Wrong:** SHA-256 is a **fast hash** designed for data integrity, not password storage. It is vulnerable to:
  - **Brute-force attacks** — SHA-256 can compute billions of hashes/second on modern GPUs
  - **Rainbow table attacks** — no salt is applied, so identical passwords produce identical hashes
  - **No work factor** — unlike bcrypt/argon2, SHA-256 has no configurable cost parameter to slow down attackers
  - Industry standard (OWASP) mandates bcrypt, scrypt, or argon2 for password hashing
- **Human Fix Required:** Replace with `bcrypt` (cost factor 10+) for production. The current SHA-256 implementation is acceptable only for demo/seed purposes with a clear comment noting the security limitation.
- **Evidence:** See `prisma/seed.ts` lines 9-13

### Flaw #3: Incorrectly Deleted Required `prisma.config.ts` Configuration File
- **What AI Did:** When cleaning up unnecessary auto-generated files (`.agents/`, `.claude/`, `.cursor/`, `.devin/`), the AI also deleted `prisma.config.ts`, assuming it was only used for Prisma Composer skills sync.
- **Why It Was Wrong:** In **Prisma 8** (`8.0.0-rc.20`), `prisma.config.ts` is a **mandatory configuration file** required by the CLI for all operations (`generate`, `db push`, `migrate`, `seed`). Unlike Prisma 7 where `datasource` in `schema.prisma` was sufficient, Prisma 8 uses `prisma.config.ts` with `definePrismaConfig()` as the primary configuration entry point. Deleting it would have broken all Prisma CLI commands.
- **Human Fix:** User caught the error. File was recreated with proper Prisma 8 ORM configuration using `@prisma/orm-postgres/config` instead of the old skills-only config.
- **Lesson:** AI agents may not be aware of breaking changes in bleeding-edge versions. Always verify before deleting configuration files in projects using RC/beta dependencies.

---

## 3. Human Refactoring

> How did you rewrite, optimize, and harden the code using your own engineering judgment?

### Refactor #1: *(Title)*
- **Before (AI Code):**
```typescript
// Paste original AI-generated code
```
- **After (Human Refactored):**
```typescript
// Paste your improved version
```
- **Reasoning:** *(Why your version is better — security, performance, correctness)*

### Refactor #2: *(Title)*
- **Before (AI Code):**
```typescript
// Paste original AI-generated code
```
- **After (Human Refactored):**
```typescript
// Paste your improved version
```
- **Reasoning:** *(Explain your engineering decision)*

---

## 4. Defensive Architecture

> How did you structure the state machine and API guards to prevent unauthorized status overrides?

### State Machine Enforcement
- **Server-Side State Transitions:** *(Describe how CUTTING_IN_PROGRESS → PENDING_VERIFICATION → VERIFIED/REJECTED is enforced on the backend, not just the UI)*
- **Invalid Transition Rejection:** *(How does the API prevent skipping states, e.g., going from CUTTING_IN_PROGRESS directly to VERIFIED?)*

### RBAC API Guards
- **Role Verification Middleware:** *(Describe how each API endpoint checks the user's role from JWT/session — never from the request body)*
- **403 Enforcement:** *(How a cutting_supervisor sending POST to /api/verification/approve gets rejected)*

### Hard Stop Gatekeeper
- **RED Component Blocking:** *(How the backend independently checks all verification_items before allowing APPROVED status — not relying on frontend state)*
- **422 Response:** *(The server-side validation that rejects approval when any component is RED or uncounted)*

### Query Isolation
- **Sewing Queue Filtering:** *(How GET /api/sewing/queue enforces WHERE status = 'VERIFIED' at the database level)*
- **No Data Leakage:** *(How URL parameter manipulation cannot expose unverified orders)*

### Audit Trail Immutability
- **Server-Derived Fields:** *(verifier_id from JWT, timestamp from server clock — never trusted from client)*
- **Write-Once Logs:** *(How verification_logs entries cannot be edited or deleted after creation)*

---

## Summary

*(Write a brief overall reflection on your experience using AI tools for this project — what worked well, what required careful human oversight, and key lessons learned.)*
