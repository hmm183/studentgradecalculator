# Grade Calculator Application

This repository contains a full-stack **Grade Calculator Application** designed to calculate and manage student grades, course registrations, and faculty mappings. The project is organized as a monorepo containing a React frontend and a Node.js/Express backend.

---

## Codebase Architecture

The project consists of two main components:

1. **Frontend (`/grade-calculator-frontend`)**:
   - Built with **React** and **Vite** running on `http://localhost:3000`.
   - Handles the user interface, routing, dashboard, and grading key displays.
   - Leverages Google OAuth to securely sign in students and redirect back to the dashboard with a signed token.

2. **Backend (`/backend`)**:
   - Built with **Node.js** and **Express** running on `http://localhost:5000`.
   - Connects to a MongoDB database (using Mongoose schemas).
   - Manages routes for authentication, courses, slots, marks, admin control, and previous grade range uploads.
   - Enforces rate-limiting and uniqueness constraints on data submissions.

---

## Key Features & Business Logic

### 1. Results Fetch & No-Data Grace
- The results viewer matches student marks, calculates mean and standard deviation, and assigns standard relative grades (S, A, B, C, D, E, F).
- If the database has fewer than 20 entries, the system gracefully handles the no-data state showing a message rather than crashing the page.

### 2. Admin Password Authorization
- Admin API routes (`POST /api/admin/course` and `POST /api/admin/slot`) are guarded by both user-role checks (`role === "admin"`) and password authorization.
- On the frontend, administrative changes trigger a styled overlay modal requesting the admin password.
- The entered password is sent in the `X-Admin-Password` header. The backend validates it against a PBKDF2 `salt:hash` combination stored in the user's database document, returning `401 Unauthorized` if incorrect.

### 3. Previous Grade Ranges Showcase
- Logged-in users can view and upload historical grade ranges for any course.
- **Custom Course Input**: Users can select pre-existing courses or type in a custom course code and subject name.
- **Global Faculty Autocomplete**: Users can search and select from over 700+ faculties (loaded from `faculty_list.json` data) using an interactive autocomplete drop list.
- **Database Uniqueness**: Only one historical grade range entry is permitted per course code. Subsequent uploads for an existing course are blocked.
- **Student Rate Limits**: Students (emails ending with `@vitapstudent.ac.in`) are silently rate-limited to a maximum of 20 uploads total to prevent spam. Faculty users are not limited.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas instance)

### 1. Setup the Backend Server
Navigate to the `backend` folder and install dependencies:
```bash
cd backend
npm install
```

Configure your `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your_session_secret
```

Run database seeding scripts to populate courses and slots:
```bash
node insertCourses.js
node insertSlots.js
```

Start the server:
- For production:
  ```bash
  npm start
  ```
- For development (with auto-reload using `nodemon`):
  ```bash
  npm run dev
  ```

### 2. Setup the Frontend Client
Navigate to the frontend folder and install dependencies:
```bash
cd grade-calculator-frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The client application will run and be accessible at `http://localhost:3000`.
