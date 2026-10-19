---
base: f1a6e79b1444686e1f0cc6edc601834259d574db
check: test/zz-bench-check.test.js
grade: node --test --test-reporter=spec --test-timeout=120000
---
# slugify should lowercase and trim dashes

`slugify('  Hello, World! ')` returns `Hello-World-`. It should return `hello-world`: lowercase, words joined by single dashes, and no leading or trailing dash.
