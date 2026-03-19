# CI/CD and Team Collaboration Plan

**Objective:** Establish a robust workflow for a 5-developer team working on a split architecture (Vercel for Frontend, HelioHost for Backend) to prevent conflicts and maintain stable deployments.

## 1. Branching Strategy
We will adopt a simplified GitFlow model:
- **`main`**: The production-ready branch. Vercel automatically deploys pushes/merges to this branch to the live domain.
- **`develop`**: The integration branch. All developers merge their completed feature branches here first. Vercel deploys this to a staging URL.
- **Feature Branches**: Developers create branches (e.g., `feat/login`, `fix/header`) from `develop`. They submit Pull Requests (PRs) to merge back into `develop`.

## 2. Environment Management
To prevent the frontend from calling the wrong backend during development or staging:
- **Frontend Variables:** We will use `VITE_API_URL` in the React app.
  - Local Dev: `.env.development` -> `http://localhost/HRISIreply/backend/api`
  - Vercel Preview (Staging): `.env.preview` -> `https://staging-api.heliohost.org`
  - Vercel Production: `.env.production` -> `https://production-api.heliohost.org`
- **Vercel Settings:** The Vercel project will be configured with the `frontend` folder as the Root Directory.

## 3. Backend & Database Strategy (HelioHost)
- **Manual API Sync:** Because HelioHost uses a traditional file upload (FTP/cPanel), the `backend/` folder from the `main` branch must be manually uploaded for production releases.
- **Database Migrations:** We will maintain an `update.sql` file. When a developer alters a table, they add the SQL command to this file. Before a backend release, the team runs this SQL file in HelioHost's PHPMyAdmin.

## Implementation Steps

### Task 1: Initialize Git Environment
- Create and push the `develop` branch from `main`.
- Enforce branch protection rules on `main` (requires PRs, no direct pushes).

### Task 2: Configure Environment Variables
- Create `.env.example` in `frontend/`.
- Update API calls in `frontend/src/api/` (or similar) to use `import.meta.env.VITE_API_URL` instead of hardcoded paths.

### Task 3: Vercel Setup Preparation
- Ensure `frontend/vercel.json` correctly points routing to the React SPA.
- Document the Vercel project setup steps (Root Directory: `frontend`, override build commands if necessary).

### Task 4: Documentation
- Create `CONTRIBUTING.md` detailing the branch naming and PR workflow for the team.
- Create `DEPLOYMENT.md` detailing the steps to deploy the backend to HelioHost and run SQL migrations.
