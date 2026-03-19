# HRISIreply - Team Management & Attendance System

Welcome to the HRISIreply repository. This system is a full-stack role-based application for team management and attendance tracking.

## 🚀 The Architecture
The application uses a modern, distributed cloud stack:
- **Frontend:** React 19 + Vite (Hosted on **Vercel**)
- **Backend:** PHP API (Hosted on **Koyeb**)
- **Database:** MySQL 8.0 (Hosted on **Aiven**)

### How they connect
Vercel acts as a secure proxy. Requests to `/api-proxy/*` are automatically routed to our Koyeb backend, bypassing CORS and ensuring a seamless connection.

## 📂 Project Structure
- `/frontend`: React source code and assets.
- `/backend`: PHP API logic, authentication, and database configurations.
- `/docs`: Project documentation, logs, and database schemas.
- `/conductor`: Ongoing development tracks and migration plans.

## 📖 Documentation Guide
Use these documents to understand the system and contribute effectively:

### 🛠 System Guides
- **[BACKEND_API_GUIDE.md](./docs/BACKEND_API_GUIDE.md)**: Details on API endpoints, request/response formats, and role requirements.
- **[FRONTEND_GUIDE.md](./docs/FRONTEND_GUIDE.md)**: Overview of React component patterns, styling, and state management.
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Step-by-step instructions for Vercel, Koyeb, and Aiven setup.

### 📅 Migration & History
- **[2026-03-19-DEVELOPER_MIGRATION_GUIDE.md](./docs/2026-03-19-DEVELOPER_MIGRATION_GUIDE.md)**: **CRITICAL READ** for developers moving from the old HelioHost setup.
- **[2026-03-19-MIGRATION_LOG.md](./docs/2026-03-19-MIGRATION_LOG.md)**: Timestamped history of the infrastructure shift and repository reorganization.

### 🧪 QA & Testing
- **[ATTENDANCE_TEST_CASES.md](./docs/qa/ATTENDANCE_TEST_CASES.md)**: Verified test scenarios for the attendance module.

## 🤝 Contributing
Please read the **[CONTRIBUTING.md](./CONTRIBUTING.md)** file before starting any work. We follow a strict **GitFlow** model merging into the `develop` branch.

## ⚙️ Local Setup
1. Clone the repository.
2. Navigate to `frontend/` and run `npm install`.
3. Configure your local `.env` using `frontend/.env.example`.
4. Ensure your local PHP environment matches the `backend/Dockerfile` specifications.
