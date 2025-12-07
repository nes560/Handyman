DEPLOY_PROVIDER.md

This document contains step-by-step instructions to deploy the project to two providers: Render and DigitalOcean App Platform. The repo already includes a `Dockerfile` and `docker-compose.yml` for local testing.

1) PREPARATION (common)
- Ensure your project code is in a Git repository (GitHub is recommended).
- Make sure `Dockerfile` is present (at repo root) and works locally (see README_DEPLOY.md).
- Create a production MySQL database (managed service or VM) and import `tukang_db_dump.sql`.
- Create environment variables for DB credentials and PORT.

--- Render (using Docker) ---
Render supports direct Docker deployments via Git.

A. Create a Render account and connect your GitHub repository.
B. Create a new "Web Service" in Render:
   - Environment: Docker
   - Branch: choose the repo branch (main/master)
   - Dockerfile Path: `./Dockerfile` (root)
   - Build Command: leave default (Render runs `docker build`)
   - Start Command: leave default (image CMD is `node node.js`)
   - Environment Variables: set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`.
C. Add a managed Postgres/MySQL service if you want Render-managed DB or provide external MySQL host.
D. Configure Secrets: Use Render's Environment variables / Secrets UI for DB password and other credentials.
E. Deploy: Render will build and run the container. Open the service URL and test.

Database import (example using remote MySQL):
```bash
# from local machine with mysql client
mysql -h <RENDER_MYSQL_HOST> -u <user> -p < tukang_db_dump.sql
```

--- DigitalOcean App Platform (Docker) ---
Option: Use App Platform with Dockerfile.

A. Push your code to GitHub and connect to DigitalOcean App Platform.
B. Create a new App and choose the repo/branch.
C. For the service, choose "Dockerfile" and keep path `./Dockerfile`.
D. Add environment variables under the service settings: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`.
E. For the database, use DigitalOcean Managed Databases (MySQL). Create a MySQL database and note host/user/password.
F. Import the `tukang_db_dump.sql` using the MySQL host and user.

--- Notes about env vars & secrets ---
- Never commit production credentials to Git. Use the provider's secret manager or environment variable UI.
- Set `DB_HOST` to the managed database host (not localhost).
- Use `DB_USER` and `DB_PASSWORD` appropriate for the managed DB.

--- Health checks & scaling ---
- Both providers allow health checks. Ensure your app responds on `/` or another endpoint.
- If using `docker-compose` locally, compose is for dev. For production, prefer a single container image (Dockerfile) and a managed DB.

--- Import SQL dump ---
1. Copy `tukang_db_dump.sql` to a machine that can access the DB host.
2. Run:

```bash
mysql -h <DB_HOST> -u <DB_USER> -p < tukang_db_dump.sql
```

--- Troubleshooting ---
- If app can't connect: check `DB_HOST`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`, security groups and network access.
- If static files 404: ensure `express.static(__dirname)` is serving the repo root (current code uses this).

If you want, I can:
- Create provider-specific files (e.g., `render.yaml`) or exact DO App spec files.
- Walk through a live deploy to Render or DO (I can generate the exact steps and required UI values).
