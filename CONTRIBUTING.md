# Contributing to HRISIreply

To maintain a stable and conflict-free repository, please follow these workflow guidelines.

## 1. Branching Strategy
- **`main`**: Production-only. Direct pushes are disabled.
- **`develop`**: The integration branch. All feature branches must be merged here first.
- **Feature Branches**: Create a new branch from `develop` for every task.
  - Prefix with `feat/` for new features (e.g., `feat/attendance-page`).
  - Prefix with `fix/` for bug fixes (e.g., `fix/login-error`).
  - Prefix with `chore/` for maintenance (e.g., `chore/update-readme`).

## 2. Development Workflow
1.  **Sync your local environment:**
    ```bash
    git checkout develop
    git pull origin develop
    ```
2.  **Create your feature branch:**
    ```bash
    git checkout -b feat/your-feature-name
    ```
3.  **Work and Commit:** Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add attendance summary card`).
4.  **Push and PR:**
    ```bash
    git push -u origin feat/your-feature-name
    ```
    Create a Pull Request (PR) on GitHub from your branch into `develop`.

## 3. Local Environment Setup
- **Backend:** Ensure you have XAMPP/Apache running and the `backend/` directory is accessible.
- **Frontend:**
  1.  Navigate to `frontend/`.
  2.  Copy `.env.example` to `.env.development`.
  3.  Update `VITE_API_URL` if your local backend path differs.
  4.  Run `npm install` and `npm run dev`.

## 4. Code Standards
- Use functional React components.
- Adhere to the existing Vanilla CSS styling patterns in `frontend/src/styles/`.
- Document new API endpoints in `docs/BACKEND_API_GUIDE.md`.
