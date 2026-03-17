# NestJS Task Management Service

A simple NestJS service for managing tasks with a mocked database layer.

## Installation

```bash
npm install
```

## Github Actions
The following needs set up for the Github actions flow to work in AWS:

### Add an Environment for dev
1. Add Environment Secret with AWS_ROLE_ARN
2. Add Environment variables for the following: AWS_REGION, CLOUDWATCH_ALARM_NAME, CONTAINER_NAME, ECS_CLUSTER, ECS_SERVICE, ECS_TASK_DEFINITION, MIGRATION_TASK_DEFINITION

### Add secrets and variables
1. Add Repository secret for AWS_ROLE_ARN_ECR
2. Add Repository variable for ECR_REPOSITORY

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
