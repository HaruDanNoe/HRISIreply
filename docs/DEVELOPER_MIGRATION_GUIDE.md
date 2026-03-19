# Developer Guide: The Migration to Vercel + Koyeb + Aiven

Welcome to the new HRISIreply infrastructure. This document explains the changes made to our repository and hosting, and how you can continue development effectively.

## 1. Why we migrated from HelioHost
HelioHost was causing persistent **CORS (Cross-Origin Resource Sharing)** errors and **502 Bad Gateway** crashes. We have moved to a professional "Cloud Native" stack to ensure stability and automatic deployments (CI/CD).

## 2. The New Stack
The application is now split across three specialized providers:
- **Frontend:** [Vercel](https://vercel.com) (React 19 + Vite).
- **Backend:** [Koyeb](https://koyeb.com) (PHP API + Apache).
- **Database:** [Aiven](https://aiven.io) (MySQL 8.0 + SSL).

**How they connect:**
The browser talks to Vercel. Vercel acts as a **Proxy** (via `/api-proxy`) to send requests to Koyeb. This eliminates CORS issues entirely. Koyeb connects to Aiven using a secure SSL certificate (`ca.pem`).

## 3. Repository Adjustments
- **Flattened Structure:** The code has been moved from the `team-cluster2-main/` subdirectory directly into the root.
- **`develop` Branch:** This is our new integration branch. **Do not code directly on `main`.**
- **Dockerized Backend:** We now use a `Dockerfile` in the `backend/` folder to ensure the server environment is consistent for everyone.

## 4. How to continue your work
If you were working on a branch in the previous repository:
1.  **Sync your Fork:** If you haven't already, fork the latest version from `aelreje/HRISIreply`.
2.  **Add the Remote:** `git remote add upstream https://github.com/HaruDanNoe/HRISIreply.git`.
3.  **Update your Local:** 
    ```bash
    git fetch upstream
    git checkout develop
    git reset --hard upstream/develop
    ```
4.  **Merging your changes:** Since the directory structure has changed (moved to root), you may encounter merge conflicts. We recommend starting a new branch from the latest `develop` and manually moving your new code into it to ensure everything aligns with the new paths.

## 5. Local Environment Setup
To work locally with the new Aiven database:
1.  Copy `backend/config/database.example.php` to `backend/config/database.php`.
2.  Add your Aiven credentials to your local `.env` or system environment variables.
3.  Ensure the `ca.pem` is present in the `backend/` folder.

## 6. Current Version Note
This repository represents a **fully functional architectural snapshot**. While some of the very latest feature commits from individual branches might not be in `main/develop` yet, the **core connection** (Frontend -> Backend -> Database) is now verified and stable. You can now merge your specific feature branches into `develop` safely.
