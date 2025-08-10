Status: RESOLVED on 2025-08-10

Summary
- Root cause: Prisma Client types were out of sync with the actual schema (Deno struggled to load CJS during generate), so fields like emailVerified, emailVerificationToken, passwordResetToken, passwordResetExpires, isInPool, and poolOrder weren’t present in the generated TypeScript types.
- Fix applied:
    - Updated Prisma generator output to default (removed custom output path) in packages/backend/prisma/schema.prisma.
    - Ensured Prisma tasks run with CJS detection in Deno by adding --unstable-detect-cjs to prisma:* tasks in packages/backend/deno.json.
    - Regenerated Prisma Client and re-ran type checking and linting.

Verification
- Type check: PASS (deno task type-check)
- Lint: PASS (deno task lint)

Notes on code dispersion
- Kept a single source of truth for DB fields in Prisma schema; after generation, all services consume the same typed client.
- Reduced friction by centralizing Prisma CLI flags in tasks (no per-command workarounds needed).

Next minor cleanups (optional)
- Consider extracting the ticket-to-DTO mapping in TicketsService into a small util for reuse if needed elsewhere.