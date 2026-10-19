---
base: f1a6e79b1444686e1f0cc6edc601834259d574db
check: test/zz-bench-check.test.js
grade: node --test --test-reporter=spec --test-timeout=120000
---
# Category rules should ignore case

My rule `{ "match": "starbucks", "category": "coffee" }` does not match `STARBUCKS #1234`. Rule matching in `categorize` should ignore upper and lower case. The first matching rule still wins.
