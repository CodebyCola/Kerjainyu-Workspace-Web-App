# KerjainYu API Reference

## Base

All routes are prefixed by your API's base URL (e.g. `http://localhost:4000`).

**Auth header**, required on every route except `POST /auth/register` and `POST /auth/login`:

```
Authorization: Bearer <token>
```

**Success response envelope** — every successful response follows this shape:

```json
{ "success": true, "data": { ... } }
```

**Error response envelope**:

```json
{ "error": "Human-readable message", "details": { ... } }
```

`details` is only present on validation errors (400). The `error` string is written to be shown directly to the user — safe to render as-is in a toast/alert.

**Status codes used**: `200` read/update, `201` create, `204` delete/action with no body, `400` validation, `401` not logged in, `403` forbidden, `404` not found, `409` conflict.

**Naming note**: request bodies are a mix of `camelCase` and `snake_case` depending on the endpoint — this table tells you exactly which, per field, so just match what's listed rather than guessing.

---

## Auth

### `POST /auth/register`

No auth required.

```json
// Request
{
  "username": "string, 3-30 chars, letters/numbers/underscore only",
  "password": "string, min 8 chars"
}
```

```json
// 201 Response
{
  "success": true,
  "data": {
    "user": { "id": 1, "username": "alice", "created_at": "..." },
    "token": "jwt..."
  }
}
```

### `POST /auth/login`

No auth required.

```json
// Request
{ "username": "string", "password": "string" }
```

```json
// 200 Response
{
  "success": true,
  "data": {
    "user": { "id": 1, "username": "alice", "created_at": "..." },
    "token": "jwt..."
  }
}
```

### `GET /auth/me`

Auth required.

```json
// 200 Response
{ "success": true, "data": { "user": { "userId": 1, "username": "alice" } } }
```

---

## Projects

### `POST /projects`

Auth required. Creator automatically becomes `leader`.

```json
// Request
{
  "title": "string, 3-100 chars",
  "deadline": "ISO date string, optional",
  "allowFreeSwap": "boolean, optional, default false",
  "links": [
    {
      "label": "string",
      "url": "string (http/https)",
      "category": "design | development | docs | other, optional, default 'other'"
    }
  ] // optional, max 20
}
```

```json
// 201 Response
{
  "success": true,
  "data": {
    "project": {
      "id": 1,
      "title": "...",
      "status": "ongoing",
      "allow_free_swap": false,
      "deadline": null,
      "is_archived": false,
      "created_at": "..."
    }
  }
}
```

### `GET /projects`

Auth required. Lists projects the caller belongs to.
Query: `?role=leader` or `?role=member` (optional filter).

```json
// 200 Response
{ "success": true, "data": { "projects": [ { "id": 1, "title": "...", ... } ] } }
```

### `GET /projects/:projectId`

Auth required (any active member). **Returns 404, not 403, if the caller isn't a member** — this is deliberate, avoids leaking which project ids exist.

```json
// 200 Response
{ "success": true, "data": { "project": { "id": 1, "title": "...", "status": "ongoing", ... } } }
```

### `GET /projects/title/:title`

Same access rules as above, looked up by title instead of id.

### `PATCH /projects/:projectId`

Leader only.

```json
// Request (all fields optional)
{
  "title": "string",
  "deadline": "ISO date | null",
  "allowFreeSwap": "boolean",
  "status": "ongoing | completed"
}
```

```json
// 200 Response
{ "success": true, "data": { "project": { ...updated fields } } }
```

### `POST /projects/:projectId/archive`

Leader only. Reversible — sets `is_archived: true`.

```json
// 200 Response
{ "success": true, "data": { "project": { ..., "is_archived": true, "is_archived_at": "..." } } }
```

### `DELETE /projects/:projectId`

Leader only. **Hard delete — cascades to every task, submission, comment, etc. under this project. Not reversible.**

```json
// 204, no body
```

### `GET /projects/:projectId/submissions/pending`

Leader only. The review queue — every submission awaiting a decision.

```json
// 200 Response
{ "success": true, "data": { "submissions": [ { "id": 1, "task_id": 5, "submitted_by": 3, "review_status": "pending", ... } ] } }
```

### `GET /projects/:projectId/appeals/pending`

Leader only.

```json
// 200 Response
{ "success": true, "data": { "appeals": [ { "id": 1, "task_id": 5, "raised_by": 3, "status": "pending", "reason": "...", ... } ] } }
```

### `GET /projects/:projectId/activity`

Leader only. Full ownership-change feed across the project.
Query: `?reason=claimed` (optional — filter by `assigned | claimed | swap | reassigned | released`).

```json
// 200 Response
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "task_id": 5,
        "from_user_id": null,
        "to_user_id": 3,
        "reason": "claimed",
        "changed_at": "..."
      }
    ]
  }
}
```

---

## Project members

### `GET /projects/:projectId/members`

Any active member.

```json
// 200 Response
{
  "success": true,
  "data": {
    "members": [
      { "id": 1, "username": "alice", "role": "leader", "joined_at": "..." }
    ]
  }
}
```

### `POST /projects/:projectId/members`

Leader only.

```json
// Request
{ "userId": 5, "role": "leader | member" }
```

```json
// 201 Response
{ "success": true, "data": { "member": { "id": 1, "project_id": 1, "user_id": 5, "role": "member", ... } } }
```

### `DELETE /projects/:projectId/members/:userId`

Leader only. Cannot remove the leader (use transfer-leader first).

```json
// 204, no body
```

### `POST /projects/:projectId/members/leave`

Any member except the leader (leader must transfer leadership first).

```json
// 204, no body
```

### `POST /projects/:projectId/members/transfer-leader`

Current leader only.

```json
// Request
{ "new_leader_id": 5 }
```

```json
// 200 Response
{ "success": true, "data": { "membership": { ...new leader's membership row } } }
```

---

## Project links (workapp links)

### `GET /projects/:projectId/links`

Any active member.

```json
// 200 Response
{
  "success": true,
  "data": {
    "links": [
      {
        "id": 1,
        "label": "Figma",
        "url": "https://...",
        "category": "design",
        "added_by": 1,
        "created_at": "..."
      }
    ]
  }
}
```

### `POST /projects/:projectId/links`

Leader only.

```json
// Request
{
  "label": "string, 1-100 chars",
  "url": "string (http/https)",
  "category": "design | development | docs | other, optional"
}
```

```json
// 201 Response
{ "success": true, "data": { "link": { "id": 1, "label": "Figma", ... } } }
```

### `PATCH /projects/:projectId/links/:linkId`

Leader only. Same body shape as create (all fields currently required together, not partial).

### `DELETE /projects/:projectId/links/:linkId`

Leader only.

```json
// 204, no body
```

---

## Tasks

### `GET /projects/tasks/mine`

Any logged-in user. Tasks assigned to the caller **across every project
they're an active member of** — powers the My Tasks page. Not nested
under `:projectId` since it deliberately spans all projects.

Query params (both optional, both validated — an unrecognized value
returns `400`):

- `status` — one of `unclaimed | todo | ongoing | submitted | in_revision | approved | rejected`
- `sort` — one of `deadline_asc` (default) `| deadline_desc | priority | recent`

Filtering and sorting both happen in the DB query, not after the fact
in the app layer.

```json
// 200 Response
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "string",
        "description": "string | null",
        "status": "todo",
        "priority": 1,
        "deadline": "ISO date | null",
        "project_id": 1,
        "project_title": "string",
        "assignee_id": 1,
        "created_by": 1,
        "is_claimable": false,
        "created_at": "ISO date",
        "updated_at": "ISO date | null"
      }
    ]
  }
}
```

### `GET /projects/:projectId/tasks`

Any active member. All tasks in the project.

### `GET /projects/:projectId/tasks/claimable`

Any active member. Open-pool tasks — `status: unclaimed` and `is_claimable: true`.

### `GET /projects/:projectId/tasks/mine`

Any active member. Tasks assigned to the caller, scoped to this one project.

### `GET /projects/:projectId/tasks/:taskId`

Any active member.

```json
// 200 Response
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "title": "...",
      "description": "...",
      "status": "todo",
      "priority": null,
      "display_order": 0,
      "deadline": null,
      "assignee_id": null,
      "created_by": 1,
      "is_claimable": true,
      "created_at": "...",
      "updated_at": null
    }
  }
}
```

`status` is one of: `unclaimed | todo | ongoing | submitted | in_revision | approved | rejected`.

### `POST /projects/:projectId/tasks`

Leader only.

```json
// Request
{
  "title": "string, 3-100 chars",
  "description": "string, optional",
  "priority": "number | null, optional — null = unprioritized, sorted by created_at",
  "displayOrder": "number, optional",
  "project_id": "number — must match the :projectId in the URL",
  "deadline": "ISO date | null, optional",
  "assignee_id": "number | null, optional — omit/null to put it in the open pool",
  "isClaimable": "boolean, optional, default false"
}
```

Note: `status` is NOT accepted here — the server decides `todo` (pre-assigned) vs `unclaimed` (open pool) based on whether `assignee_id` is provided.

```json
// 201 Response
{ "success": true, "data": { "task": { ...created task, "status": "todo" or "unclaimed" } } }
```

### `PATCH /projects/:projectId/tasks/:taskId`

Leader only. Edits title/description/deadline/etc — not for status changes.

### `PATCH /projects/:projectId/tasks/:taskId/status`

The task's assignee only. Self-service transition.

```json
// Request
{ "status": "ongoing" }
```

**Only `todo → ongoing` is allowed here.** `ongoing → submitted` happens via the submissions endpoint below, not this one — it requires actual submission content.

### `DELETE /projects/:projectId/tasks/:taskId`

Leader only.

### `POST /projects/:projectId/tasks/:taskId/claim`

Any active member. Succeeds only if the task is currently `unclaimed` and `is_claimable: true`. Returns `409 Conflict` if someone else claimed it first (race-safe).

### `POST /projects/:projectId/tasks/:taskId/reassign`

Leader only.

```json
// Request
{ "new_assignee_id": 5 }
```

### `POST /projects/:projectId/tasks/:taskId/release`

The task's assignee only. Puts it back in the open pool (`unclaimed`, `assignee_id: null`). Fails if the task isn't `is_claimable`, or if it's already `submitted`.

---

## Task submissions

### `POST /projects/:projectId/tasks/:taskId/submissions`

The task's assignee only. Task must currently be `ongoing` or `in_revision`.

```json
// Request
{
  "note": "string, optional, max 1000 chars",
  "attachments": [
    {
      "type": "text | image | file | link",
      "content": "string — URL or text depending on type"
    }
  ] // required, at least 1
}
```

```json
// 201 Response
{ "success": true, "data": { "submission": { "id": 1, "task_id": 5, "submitted_by": 3, "review_status": "pending", "attachments": [ ... ] } } }
```

Sets the task's status to `submitted`.

### `PATCH /projects/:projectId/tasks/:taskId/submissions/:submissionId/review`

Leader only.

```json
// Request
{
  "review_status": "approved | revision_requested | rejected",
  "review_note": "string, optional — REQUIRED if review_status is 'revision_requested'"
}
```

Maps to task status: `approved → approved`, `revision_requested → in_revision`, `rejected → rejected`.

### `GET /projects/:projectId/tasks/:taskId/submissions/latest`

Any active member. Most recent submission for the task.

### `GET /projects/:projectId/tasks/:taskId/submissions/history`

Any active member. Every submission ever made on this task, oldest first.

### `GET /projects/:projectId/tasks/:taskId/submissions/:submissionId/attachments`

Any active member.

```json
// 200 Response
{
  "success": true,
  "data": {
    "attachments": [
      {
        "id": 1,
        "submission_id": 1,
        "type": "link",
        "content": "https://...",
        "created_at": "..."
      }
    ]
  }
}
```

---

## Task swap requests

Mounted at the project level (not per-task) — a swap can involve two different tasks.

### `GET /projects/:projectId/swap-requests`

Any active member. Query: `?status=pending` (optional).

### `GET /projects/:projectId/swap-requests/task/:taskId/pending`

Any active member. Pending swap requests specifically involving one task.

### `POST /projects/:projectId/swap-requests`

Any active member — but the caller must currently own `task_id`.

```json
// Request
{
  "task_id": "number — the task YOU are offering",
  "target_task_id": "number, optional — a task of theirs you want in exchange (two-way swap)",
  "requested_to": "number — the other member's user id"
}
```

### `PATCH /projects/:projectId/swap-requests/:swapRequestId/resolve`

**Who can call this depends on the project's `allow_free_swap` setting:**

- `allow_free_swap: true` → only the requested member (`requested_to`) can respond
- `allow_free_swap: false` → only the leader can respond

```json
// Request
{ "status": "approved | rejected" }
```

On `approved`, ownership actually transfers (both tasks, if it's a two-way swap) and gets logged.

### `DELETE /projects/:projectId/swap-requests/:swapRequestId`

The original requester only. Only works while still `pending`.

---

## Task appeals ("aju banding")

### `GET /projects/:projectId/tasks/:taskId/appeals`

Any active member.

### `POST /projects/:projectId/tasks/:taskId/appeals`

The task's assignee only. One pending appeal per task at a time.

```json
// Request
{
  "submission_id": "number, optional — omit if appealing while the task is still ongoing (pre-submission)",
  "reason": "string, 10-1000 chars"
}
```

### `PATCH /projects/:projectId/tasks/:taskId/appeals/:appealId/resolve`

Leader only.

```json
// Request
{ "status": "accepted | rejected", "resolution_note": "string, optional" }
```

Note: resolving an appeal does not automatically change the task/submission state — that's a manual follow-up action by the leader.

---

## Task comments

### `GET /projects/:projectId/tasks/:taskId/comments`

Any active member — viewing is unrestricted.

### `POST /projects/:projectId/tasks/:taskId/comments`

Any active member — but **a regular member can only comment on tasks assigned to them**; the leader can comment on any task.

```json
// Request
{ "comment": "string, 1-1000 chars" }
```

### `DELETE /projects/:projectId/tasks/:taskId/comments/:commentId`

The comment's author, or the leader (moderation).

---

## Task ownership log (read-only)

### `GET /projects/:projectId/tasks/:taskId/ownership-log`

Any active member. Full history of who has owned this task, in order.

```json
// 200 Response
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "from_user_id": null,
        "to_user_id": 3,
        "reason": "claimed",
        "changed_at": "..."
      }
    ]
  }
}
```

`reason` is one of: `assigned | claimed | swap | reassigned | released`.

---

## Notifications

Not project-scoped — these belong to the logged-in user directly.

### `GET /notifications`

Query: `?unread=true` (optional), `?limit=50&offset=0` (optional, defaults shown).

```json
// 200 Response
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "task_assigned",
        "reference_type": "task",
        "reference_id": 5,
        "message": "...",
        "is_read": false,
        "created_at": "..."
      }
    ]
  }
}
```

`type` is one of: `deadline_reminder | task_assigned | task_swapped | swap_requested | submission_pending | submission_reviewed | comment_added | appeal_updated`.

### `GET /notifications/unread-count`

```json
// 200 Response
{ "success": true, "data": { "count": 3 } }
```

### `PATCH /notifications/:notificationId/read`

Marks one as read. Scoped to the caller — you can't mark someone else's notification.

### `PATCH /notifications/read-all`

Marks every unread notification for the caller as read.

```json
// 204, no body
```

---

## Known pending backend changes (not yet in your database)

Two enum values referenced above aren't in the database schema yet — check with backend before relying on them:

- `task_ownership_log.reason` needs `"released"` added (and `to_user_id` needs to become nullable for that case)
- `notifications.type` needs `"submission_pending"` added
