# Risk Matrix Template

| Module | Risk | Level (P0/P1/P2) | Failure Impact | Required Test |
|---|---|---|---|---|
| Auth | Token verify / expiry | P0 | Unauthorized access | unit + e2e |
| Permission | RBAC guard | P0 | Privilege escalation | e2e |
| Data write | create/update/delete | P0 | Data corruption | unit + integration |
| File import/export | parsing & format | P1 | Wrong data output | integration |
| UI flow | list/detail/edit | P1 | User blocked | e2e smoke |
| Non-critical UI | cosmetic logic | P2 | minor UX issue | optional |

> Rule: Ship only when all P0 pass; P1 can have limited known issues with notes.
