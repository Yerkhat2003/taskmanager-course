# Task Manager

Task management application with Nest.js backend and React frontend.

## Project Structure

- `task-backend` - Nest.js API server
- `task-frontend` - React frontend application

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (running on port 7777)
- npm or yarn

## Installation

### Backend

```bash
cd task-backend
npm install
```

### Frontend

```bash
cd task-frontend
npm install
```

## Configuration

### Backend

Create `.env` file in `task-backend` directory:

```
DB_HOST=localhost
DB_PORT=7777
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_NAME=course_db
```

Make sure PostgreSQL database `course_db` exists.

## Running the Application

### Backend

```bash
cd task-backend
npm run start:dev
```

Backend will run on http://localhost:7777

### Frontend

```bash
cd task-frontend
npm run dev
```

Frontend will run on http://localhost:5173

## API Endpoints

### Boards

- `GET /boards` - Get all boards
- `GET /boards/:id` - Get board by id
- `POST /boards` - Create new board

## Technologies

### Backend

- Nest.js
- TypeORM
- PostgreSQL
- class-validator
- class-transformer

### Frontend

- React
- Vite
- Tailwind CSS
- i18next
- xlsx

## License

UNLICENSED
