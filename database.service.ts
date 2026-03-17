# Gate 1 – CI
# Runs on every pull request targeting main.
# Must pass before a PR can be merged.
name: CI

on:
  pull_request:
    branches:
      - main

jobs:
  build-and-test:
    name: Build & Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      # TODO: update package.json "test" script once Jest (or Vitest) is wired up.
      # The current placeholder exits 1, which will correctly block merges until
      # real tests are added.
      - name: Unit tests
        run: npm test

      # Uncomment once Pact is configured for contract testing.
      # - name: Contract tests (Pact)
      #   run: npm run test:pact
      #   env:
      #     PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
      #     PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
