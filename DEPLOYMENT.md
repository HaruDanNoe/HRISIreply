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

## 2. Backend Deployment (Koyeb)

### Prerequisites
- Koyeb account (Free tier available).
- GitHub repository linked to Koyeb.

### Deployment Steps
1.  **Create Service:** In Koyeb, create a new "Web Service" and select your GitHub repository.
2.  **Configuration:**
    - **Buildpack/Runtime:** Select "PHP".
    - **Work Directory:** Set this to `backend`.
    - **Run Command:** (Optional) If using a custom port, ensure PHP is listening on `8000`.
3.  **Environment Variables:** Add the following secrets in the Koyeb console:
    - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`.
    - `DB_SSL_CA`: (See SSL section below).
4.  **Automatic Deployments:** Every push to `main` (Production) or `develop` (Staging) can be mapped to different Koyeb services for automated updates.

---

## 3. Database Management (Aiven MySQL)

### Connection & SSL
Aiven requires SSL.
1. Download the `ca.pem` from the Aiven console.
2. In Koyeb, you can either:
   - Upload the cert to your `backend/` directory (not recommended for public repos).
   - **Recommended:** Store the content of `ca.pem` as a Koyeb Environment Variable or secret and write it to a temporary file during the build process.

### The Source of Truth
The current schema is maintained in `docs/db/schema.sql`.

### Syncing Changes
When a developer makes a change to the database (adding a table or column):
1.  The developer adds the SQL command to `docs/db/updates.sql`.
2.  Before deploying a new backend feature, run the commands from `updates.sql` in HelioHost's PHPMyAdmin.
3.  Periodically update `docs/db/schema.sql` to reflect the full, current schema.
