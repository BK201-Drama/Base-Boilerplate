# Vibe Coding Playbook (TDD Alternative)

Use this default flow for fast but controlled delivery.

## 0) One-line goal
- Write one sentence: user value + scope boundary.

## 1) Prototype-first (10-30 min)
- Build a thin happy-path demo first.
- No over-abstraction in this step.

## 2) Contract-first
- Backend updates OpenAPI (`/api/docs-json`) before UI integration.
- Frontend runs `npm run gen:api-types` to sync types.
- Break build if contract is stale.

## 3) BDD-lite (ATDD)
- Write 3-5 acceptance scenarios in Given/When/Then.
- Cover: happy path, validation error, permission denied.

## 4) Risk-based testing
- Test only P0/P1 paths first:
  - auth, permission, data integrity, money-like logic, destructive ops.

## 5) Observability-driven delivery
- Add structured logs for key actions.
- Ensure every critical API has: request id, actor id, status, duration.
- Verify `/api/health` and error logs before merge.

## 6) Ship gate (Definition of Done)
- Contract updated
- Acceptance scenarios pass
- P0/P1 checks pass
- Observability checklist complete

---

## Command quickstart

### Backend
```bash
cd backend
npm run lint
npm run test
npm run test:e2e
```

### Frontend
```bash
cd frontend
npm run lint
npm run gen:api-types
npm run build
```

### Full check (manual)
```bash
# 1) backend checks
cd backend && npm run lint && npm run test && npm run test:e2e

# 2) frontend checks
cd ../frontend && npm run lint && npm run gen:api-types && npm run build
```
