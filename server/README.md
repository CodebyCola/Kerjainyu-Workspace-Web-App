# Auth, rate limiting & validation setup

## Install

```bash
npm install express cors jsonwebtoken bcrypt express-rate-limit zod
npm install -D @types/express @types/cors @types/jsonwebtoken @types/bcrypt
```

## Env vars to add

```bash
# .env
JWT_SECRET=<generate with: openssl rand -base64 48>
JWT_EXPIRES_IN=7d
```

## What each file does

| File                                    | Purpose                                                                                                                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config/env.ts`                         | Validates all env vars at boot via Zod. App crashes immediately with a clear message if something's missing — not mid-request.                                                         |
| `shared/errors.ts`                      | Typed error classes (`UnauthorizedError`, `ForbiddenError`, `ValidationError`, etc.) — throw these anywhere.                                                                           |
| `shared/jwt.ts`                         | `signToken()` / `verifyToken()` — used at login and by the auth middleware.                                                                                                            |
| `shared/auth.schema.ts`                 | Example Zod schemas for register/login bodies.                                                                                                                                         |
| `types/express.d.ts`                    | Type augmentation so `req.user` is typed everywhere without `as any`.                                                                                                                  |
| `middlewares/auth.middleware.ts`        | `requireAuth` — verifies the JWT, attaches `req.user`. `optionalAuth` — same but doesn't reject if missing.                                                                            |
| `middlewares/projectRole.middleware.ts` | `requireProjectRole('leader')` — checks `project_members` in the DB, since leadership is per-project, not global. Mount after `requireAuth` on routes like `/projects/:projectId/...`. |
| `middlewares/rateLimiter.middleware.ts` | `generalLimiter` (app-wide), `authLimiter` (strict, login/register only), `writeLimiter` (for write-heavy routes).                                                                     |
| `middlewares/validate.middleware.ts`    | `validate({ body, query, params })` — parses + replaces req fields with Zod-validated data, throws `ValidationError` on failure.                                                       |
| `middlewares/error.middleware.ts`       | Central handler — mount LAST. Converts any `AppError` into consistent JSON; logs + hides unexpected errors in prod.                                                                    |
| `app.ts`                                | Example wiring showing correct middleware order.                                                                                                                                       |

## What's still missing (next steps)

- **`auth.service.ts`** — actual `bcrypt.hash`/`bcrypt.compare` + calling `signToken()`, wired to the `users` table via Kysely. The routes in `app.ts` are stubs right now.
- **Password hashing on register** — not implemented yet, just validated.
- Once you set up feature folders, move `auth.schema.ts` and the auth routes into `modules/auth/`.

## Middleware order matters

```
generalLimiter → (route-specific: authLimiter/writeLimiter) → validate → requireAuth → requireProjectRole → controller
...
notFoundMiddleware → errorMiddleware   (always last, in this order)
```
