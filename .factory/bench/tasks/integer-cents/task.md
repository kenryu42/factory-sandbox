---
base: f1a6e79b1444686e1f0cc6edc601834259d574db
check: test/zz-bench-check.test.js
grade: node --test --test-reporter=spec --test-timeout=120000
---
# Store money as integer cents

Summing float dollars drifts: a month with 0.10 and 0.20 has a total of 0.30000000000000004. Switch the whole app to integer cents:

- `parseAmount('$4.95')` returns `495`, and `parseAmount('-12')` returns `-1200`.
- `formatMoney(495)` returns `$4.95`.
- `loadTransactions` and `summarizeByMonth` work in cents, so totals are exact integers.
- The `summary` command output must not change.
