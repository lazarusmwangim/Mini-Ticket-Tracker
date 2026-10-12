# Mini Ticket Tracker

A simple ticket management application for creating, viewing, filtering, and updating support tickets. The application includes ticket statistics, priority and status management, and pagination.

## Tech Stack

**Backend**

* Node.js v22
* Express.js
* TypeScript
* TypeORM
* MySQL 8
* Vitest and Supertest for testing

**Frontend**

* React
* TypeScript
* Vite
* Axios
* CSS

## Features

* Create tickets with a title, description, and priority.
* View tickets in a paginated table.
* Filter tickets by status.
* Search tickets by title or description.
* Update ticket status and/or priority.
* View ticket counts by status.
* Validate API requests and handle errors.

## Prerequisites

Install the following before running the application:

* Node.js and npm
* MySQL Server

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/lazarusmwangim/Mini-Ticket-Tracker
cd "Mini Ticket Tracker"
```

### 2. Configure the database

Run the db.sql script to create the database and required tables.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=username
DB_PASSWORD=your_password
DB_DATABASE=mini_ticket_tracker
PORT=3000
```

_N.B: Replace the example credentials with your database credentials._

### 3. Install and run the backend

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

Start the development server.

```bash
npm run dev
```

The API should be available at:

```text
http://localhost:3000/api
```

### 4. Install and run the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Configure `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev
```

Open the URL printed by Vite:

```text
http://localhost:5173
```

Keep both the backend and frontend running while using the application.

## API Endpoints

| Method  | Endpoint             | Description                                                    |
| ------- | -------------------- | -------------------------------------------------------------- |
| `GET`   | `/api/tickets`       | Retrieve tickets with pagination and optional status filtering |
| `POST`  | `/api/tickets`       | Create a ticket                                                |
| `PATCH` | `/api/tickets/:id`   | Update a ticket's status or priority                           |
| `GET`   | `/api/tickets/stats` | Retrieve ticket counts by status                               |

### Example: Create a ticket

```json
{
  "title": "Printer not working",
  "description": "The office printer is offline.",
  "priority": "high"
}
```

Supported statuses: `open`, `in_progress`, `closed`.

Supported priorities: `low`, `medium`, `high`.

## Running Tests

From the backend directory:

```bash
npm test
```

## Decisions & Tradeoffs

I kept the application focused on the core ticket-management workflow to deliver a working solution within the available time. I used React and TypeScript on the frontend and Express with TypeScript on the backend to maintain type safety across the application. I separated API calls from the UI components to make the frontend easier to maintain and test. I used server-side pagination and status filtering to avoid retrieving every ticket at once. Search operates on the tickets currently loaded in the browser, which is a shortcut that could be replaced with server-side filtering for larger datasets. I used mocked tests for selected API scenarios to verify request handling and response structures without depending on a live database during those tests. With more time, I would add broader integration tests against an isolated test database and end-to-end tests for the main user workflows. I would also improve validation and centralized error handling.

## Future Improvements

* Add authentication and permission-based access control.
* Add stronger validation and consistent error responses.
* Expand automated tests for failure scenarios and database operations.
* Introduce CI checks for linting, type checking, and tests.

