# Deployment Guide for HRISIreply

The application is deployed as a split architecture: **Frontend on Vercel** and **Backend/MySQL on HelioHost**.

## 1. Frontend Deployment (Vercel)

### Prerequisites
- GitHub repository linked to Vercel.

### Deployment Steps
1. In Vercel Project Settings, set the **Root Directory** to `frontend`.
2. Ensure the **Framework Preset** is set to `Vite`.
3. Configure the following **Environment Variables**:
   - `VITE_API_URL`: Use the production URL of your HelioHost backend.
4. Pushes to `main` will automatically trigger a production deployment.
5. Pushes to `develop` or feature branches will trigger a preview deployment.

---

## 2. Backend Deployment (HelioHost)

### Prerequisites
- Active HelioHost account with cPanel/Plesk access.
- Access to PHPMyAdmin and FTP/File Manager.

### Deployment Steps
1.  **File Upload:** Upload the contents of the `backend/` directory to your HelioHost `public_html` (or a chosen subdirectory).
2.  **Config Setup:** Update `backend/config/database.php` on the server with the production MySQL credentials (host, db, user, pass).
3.  **Cross-Origin (CORS):** Ensure `backend/api/cors.php` correctly allows requests from your Vercel production and staging domains.

---

## 3. Database Management (MySQL)

### The Source of Truth
The current schema is maintained in `docs/db/schema.sql`.

### Syncing Changes
When a developer makes a change to the database (adding a table or column):
1.  The developer adds the SQL command to `docs/db/updates.sql`.
2.  Before deploying a new backend feature, run the commands from `updates.sql` in HelioHost's PHPMyAdmin.
3.  Periodically update `docs/db/schema.sql` to reflect the full, current schema.
