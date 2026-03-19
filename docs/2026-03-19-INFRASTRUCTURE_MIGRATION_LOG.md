# Infrastructure Migration Log: Cloud & Failover Setup
**Date:** March 20, 2026
**Lead Developer:** Gemini CLI
**Status:** In Progress (Database Migration Phase)

## 📋 Infrastructure Decisions

### 1. Multi-Cloud Hosting Strategy
- **Frontend:** [Vercel](https://vercel.com/) (React/Vite).
- **Primary Backend:** [HelioHost](https://heliohost.org/) (PHP/MySQL).
- **Secondary Backend (Failover):** [AlwaysData](https://alwaysdata.com/) (PHP/MySQL).
- **Centralized Database:** [Aiven](https://aiven.io/) (MySQL 8.0).

### 2. Regional Optimization
- **Primary Region:** Singapore (`ap-southeast-1` / `asia-southeast1`).
- **Rationale:** Optimized for South East Asia (SEA) user base, providing 30-60ms latency.
- **Provider:** Google Cloud Platform (GCP) selected within Aiven for high free-tier availability in Singapore.

### 3. Failover Mechanism
- **Implementation:** "Smart Fetch" logic in `frontend/src/api/api.js`.
- **Behavior:**
    - Attempts Primary Node (HelioHost).
    - On 5xx error or timeout, automatically switches to Backup Node (AlwaysData).
    - Persists active node selection in `localStorage` to prevent repeated failover delays.
- **Requirement:** Stateless PHP logic + Centralized Aiven DB.

---

## 🕒 Activity Timeline

- **03:45 PM**: Validated Vercel serverless compatibility for PHP. Identified session statelessness as a risk; recommended JWT or Redis.
- **04:05 PM**: Evaluated PHP hosting alternatives to HelioHost. Selected **AlwaysData** (100MB Free Tier) as the primary backup due to its superior CORS handling.
- **04:25 PM**: Latency research for SEA. Confirmed Singapore as the optimal hub for Aiven MySQL deployment.
- **04:40 PM**: Designed "Smart Fetch" frontend logic for automatic backend failover.
- **05:10 PM**: Initial database migration attempt via DBeaver. 
    - **Error:** `ERROR 3750 (HY000)` - Missing Primary Keys.
    - **Cause:** Aiven strict mode (`sql_require_primary_key`).
    - **Fix:** Instructed temporary disablement of strict mode in Aiven Advanced Configuration to allow legacy `schema.sql` import.

---

## 📜 Summary of Accomplishment
Established a robust, high-availability infrastructure plan that mitigates the reliability issues of free hosting providers. By centralizing the database on Aiven and implementing frontend-level failover, the system ensures data consistency across multiple geographically distributed backend nodes.

**Current Task:** Completing the Aiven MySQL schema import.
**Next Task:** Updating `backend/config/database.php` with Aiven connection strings (Port 24754).
