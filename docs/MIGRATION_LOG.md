# HRISIreply Migration & Update Log

This log tracks major architectural changes and repository updates during the transition to a professional hosting stack.

### 📅 2026-03-18
- **Root Relocation:** Consolidated `team-cluster2-main` contents into the repository root.
- **Git Sync:** Bulk migrated 80+ branches from the source `team-cluster2` repository.
- **Workflow Setup:** Initialized `develop` branch and established GitFlow-based team collaboration standards.
- **Environment Logic:** Refactored `frontend/src/api/api.js` to use environment-aware `VITE_API_URL`.

### 📅 2026-03-19
- **CORS Centralization:** Created `backend/api/cors.php` to handle dynamic origin validation.
- **Vercel Routing:** Configured `vercel.json` to handle React SPA routing.
- **Infrastructure Shift:** Migrated Database from HelioHost to **Aiven MySQL**.
- **Backend Infrastructure:** Transitioned Backend hosting from HelioHost to **Koyeb** for CI/CD support.
- **Security Update:** Implemented SSL connection logic for Aiven using `ca.pem` and `mysqli_ssl_set`.
- **Proxy Implementation:** Established Vercel Proxy (`/api-proxy`) to bypass CORS and connect directly to Koyeb.
- **Stability Fix:** Refactored frontend error handling to prevent React render crashes (Minified Error #31).
- **Final Integration:** Merged all migration changes into the `develop` branch and synchronized across remotes.
