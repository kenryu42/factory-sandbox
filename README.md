# factory-sandbox

A small target repo for testing [kenryu42/factory](https://github.com/kenryu42/factory). Issues labeled `factory` here become pull requests written by an agent.

It holds `ledger`, a tiny expense tracker: `node bin/ledger.js summary examples/transactions.csv --rules examples/rules.json`, plus some text helpers in `src/text.js`.

Run the tests with `npm test`.

Check budgets: `node bin/ledger.js budget examples/transactions.csv --budgets examples/budgets.json --rules examples/rules.json` (exit code 1 if any category is over).
