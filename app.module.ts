# Gate 2 – CD
# Triggered on every push to main (i.e. after a PR is merged).
#
# Pipeline:
#   build-and-test  ──►  publish  ──►  deploy-dev  ──►  deploy-staging  ──►  deploy-production
#
# The production job targets the `production` GitHub Environment which has
# required reviewers configured — this is the manual approval gate.
#
# Required repository-level secrets:
#   AWS_ROLE_ARN_ECR   IAM role ARN (OIDC) used to push images to ECR
#
# Required repository-level variables:
#   AWS_REGION         e.g. us-east-1
#   ECR_REPOSITORY     ECR repository name (not the full URI)

name: CD

on:
  push:
    branches:
      - main

jobs:
  # ── Build & Test ───────────────────────────────────────────────────────────
  build-and-test:
    name: Build & Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Unit tests
        run: npm test

      # Uncomment once Pact is configured.
      # - name: Contract tests (Pact)
      #   run: npm run test:pact
      #   env:
      #     PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
      #     PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}

  # ── Build Docker image & publish to ECR ───────────────────────────────────
  publish:
    name: Publish to ECR
    runs-on: ubuntu-latest
    needs: build-and-test
    permissions:
      id-token: write
      contents: read

    outputs:
      image: ${{ steps.push.outputs.image }}

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Configure AWS credentials (ECR push role)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN_ECR }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push Docker image
        id: push
        env:
          REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          REPOSITORY: ${{ vars.ECR_REPOSITORY }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t "$REGISTRY/$REPOSITORY:$IMAGE_TAG" .
          docker push "$REGISTRY/$REPOSITORY:$IMAGE_TAG"
          echo "image=$REGISTRY/$REPOSITORY:$IMAGE_TAG" >> "$GITHUB_OUTPUT"

  # ── Deploy → Dev ──────────────────────────────────────────────────────────
  # Auto-deploys. Runs smoke tests and monitors CloudWatch after the rollout.
  deploy-dev:
    name: Deploy to Dev
    needs: publish
    uses: ./.github/workflows/_deploy-ecs.yml
    secrets: inherit
    permissions:
      id-token: write
      contents: read
    with:
      environment: dev
      image: ${{ needs.publish.outputs.image }}
      run-e2e: false
      skip-migrations: true

  # ── Deploy → Staging ──────────────────────────────────────────────────────
  # Auto-deploys after dev passes. Runs the fuller E2E test suite.
  deploy-staging:
    name: Deploy to Staging
    if: false
    needs: [publish, deploy-dev]
    uses: ./.github/workflows/_deploy-ecs.yml
    secrets: inherit
    permissions:
      id-token: write
      contents: read
    with:
      environment: staging
      image: ${{ needs.publish.outputs.image }}
      run-e2e: true
      skip-migrations: true

  # ── Deploy → Production ───────────────────────────────────────────────────
  # Gated by the `production` GitHub Environment's required-reviewer rule.
  # Someone with permission must approve the pending deployment in the
  # GitHub Actions UI before this job executes.
  deploy-production:
    name: Deploy to Production
    if: false
    needs: [publish, deploy-staging]
    uses: ./.github/workflows/_deploy-ecs.yml
    secrets: inherit
    permissions:
      id-token: write
      contents: read
    with:
      environment: production
      image: ${{ needs.publish.outputs.image }}
      run-e2e: false
      skip-migrations: true
