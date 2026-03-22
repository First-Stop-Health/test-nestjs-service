# NestJS Task Management Service

A simple NestJS service for managing tasks with a mocked database layer.

## Installation

```bash
npm install
```

## GitHub Actions

Two pipelines are defined in `.github/workflows/`:

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Pull request → `main` | Build & test gate. Must pass before a PR can be merged. |
| `cd.yml` | Push to `main` (PR merged) | Build → publish to ECR → deploy to dev → staging → production. |

The CD pipeline currently auto-deploys to **dev** only. The staging and production jobs exist in the workflow but are disabled (`if: false`) until those environments are ready.

### Prerequisites

The workflows authenticate to AWS using **OIDC** (no long-lived access keys). You must have an IAM OIDC identity provider configured for GitHub Actions in your AWS account before the secrets below will work.

---

### 1. Repository secrets and variables

Go to **Settings → Secrets and variables → Actions** in your GitHub repository.

**Secrets**

| Name | Description |
|---|---|
| `AWS_ROLE_ARN_ECR` | ARN of the IAM role assumed to push images to ECR (e.g. `arn:aws:iam::123456789012:role/github-ecr-push`) |

**Variables**

| Name | Example | Description |
|---|---|---|
| `AWS_REGION` | `us-east-1` | AWS region where ECR lives |
| `ECR_REPOSITORY` | `my-service` | ECR repository name (not the full URI) |

---

### 2. GitHub Environments

Go to **Settings → Environments** and create an environment for each deployment target. Currently only `dev` is active; create `staging` and `production` when you are ready to enable those pipeline stages.

For each environment, add the following secrets and variables.

**Environment secret**

| Name | Description |
|---|---|
| `AWS_ROLE_ARN` | ARN of the IAM role assumed via OIDC to deploy to this environment |

**Environment variables**

| Name | Example | Description |
|---|---|---|
| `AWS_REGION` | `us-east-1` | AWS region for this environment |
| `ECS_CLUSTER` | `my-cluster` | ECS cluster name |
| `ECS_SERVICE` | `my-service-dev` | ECS service name |
| `ECS_TASK_DEFINITION` | `my-service-dev` | Task definition family name |
| `CONTAINER_NAME` | `app` | Container name inside the task definition |
| `CLOUDWATCH_ALARM_NAME` | `my-service-dev-5xx` | Alarm monitored during the 5-minute bake period after each deploy |
| `SERVICE_URL` | `https://dev.example.com` | Base URL used for smoke and E2E tests |
| `MIGRATION_TASK_DEFINITION` | `my-service-migrations-dev` | Task definition used to run DB migrations (required when `skip-migrations` is false) |
| `MIGRATION_SUBNET` | `subnet-0abc1234` | Subnet ID for the migration Fargate task |
| `MIGRATION_SECURITY_GROUP` | `sg-0abc1234` | Security group ID for the migration Fargate task |

> **Note:** `MIGRATION_TASK_DEFINITION`, `MIGRATION_SUBNET`, and `MIGRATION_SECURITY_GROUP` are only used when the deploy workflow is called with `skip-migrations: false`. The current pipeline sets `skip-migrations: true` for all environments, so these can be left blank until a real database is wired up.

---

### 3. Production approval gate

When you enable the `production` environment, configure **required reviewers** under **Settings → Environments → production → Environment protection rules**. The CD pipeline will pause before the production deploy job and wait for a reviewer to approve it in the GitHub Actions UI.

## Running the Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Get All Tasks
- **GET** `/tasks`
- Returns all tasks

### Get Task by ID
- **GET** `/tasks/:id`
- Returns a single task by ID

### Create Task
- **POST** `/tasks`
- Body:
  ```json
  {
    "title": "Task title",
    "description": "Task description",
    "completed": false
  }
  ```

### Update Task
- **PUT** `/tasks/:id`
- Body (all fields optional):
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "completed": true
  }
  ```

### Delete Task
- **DELETE** `/tasks/:id`
- Deletes a task by ID

## Example Usage

```bash
# Get all tasks
curl http://localhost:3000/tasks

# Get a specific task
curl http://localhost:3000/tasks/1

# Create a new task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Task description","completed":false}'

# Update a task
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete a task
curl -X DELETE http://localhost:3000/tasks/1
```

## Project Structure

```
src/
├── database/
│   └── database.service.ts    # Mocked database layer
├── tasks/
│   ├── dto/
│   │   ├── create-task.dto.ts # Create task validation
│   │   └── update-task.dto.ts # Update task validation
│   ├── interfaces/
│   │   └── task.interface.ts  # Task interface
│   ├── tasks.controller.ts    # REST API endpoints
│   ├── tasks.service.ts       # Business logic
│   └── tasks.module.ts        # Module definition
├── app.module.ts              # Root module
└── main.ts                    # Application entry point
```

## Features

- RESTful API endpoints for task management
- In-memory mocked database with sample data
- Input validation using class-validator
- Proper HTTP status codes
- Error handling with NotFoundException
