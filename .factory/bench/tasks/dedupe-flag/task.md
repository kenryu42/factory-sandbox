---
base: f1a6e79b1444686e1f0cc6edc601834259d574db
check: test/zz-bench-check.test.js
grade: node --test --test-reporter=spec --test-timeout=120000
---
# Add a --dedupe flag for duplicate rows

When I merge exports from two downloads, some rows appear twice. Add `dedupe(transactions)` to `src/transactions.js`. It drops a transaction when an earlier one has the same date, description and amount, and keeps the order otherwise. Add `--dedupe` to the `summary` command to apply it before summarizing.
