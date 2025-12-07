# STEP-BY-STEP DEPLOY GUIDES
## Render & DigitalOcean App Platform

---

## RENDER DEPLOYMENT (Step-by-Step)

### Prerequisites
1. GitHub account with your project repo pushed.
2. Render account (free tier available at render.com).
3. Local `.env` file or knowledge of your DB credentials.

### Steps

1. **Log in to Render**: Go to https://dashboard.render.com, sign in or create account.

2. **Connect GitHub**: 
   - Click "New +" → "Web Service"
   - Select "Deploy an existing project from a repository"
   - Click "Connect account" and authorize GitHub
   - Select your repository and branch (e.g., main)

3. **Configure the Web Service**:
   - **Name**: `tukang-app` (or your choice)
   - **Environment**: Docker
   - **Region**: Choose closest to your users
   - **Branch**: main (or your branch)
   - **Runtime**: Docker (auto-detected from Dockerfile)
   - **Build Command**: leave blank (Render will use Dockerfile)
   - **Start Command**: leave blank (Render will use CMD from Dockerfile)

4. **Add Environment Variables** (⚠️ do NOT commit to Git):
   - Click "Advanced" → "Environment Variables"
   - Add:
     ```
     PORT = 3000
     DB_HOST = <your-mysql-host>.render.com (or external host)
     DB_USER = root
     DB_PASSWORD = <your-secure-password>
     DB_NAME = tukang_db
     ```

5. **Create Database** (optional — use Render's managed MySQL or external):
   - If using Render MySQL: click "+" → "MySQL" 
   - Name: `tukang-mysql`
   - Render will provide a host; use that for `DB_HOST` above
   - **Important**: Import `tukang_db_dump.sql` after MySQL is running:
     ```bash
     # from your machine (requires mysql client)
     mysql -h <render-db-host> -u root -p < tukang_db_dump.sql
     ```

6. **Deploy**:
   - Click "Create Web Service"
   - Render will build the Docker image and start the container
   - Wait for "✓ Live" status (takes ~2-5 min)
   - Your app is now at https://<your-app-name>.render.com

7. **Test**:
   - Open https://<your-app-name>.render.com in your browser
   - Try login or registration to verify API works
   - Check logs in Render dashboard if issues arise

---

## DIGITALOCEAN APP PLATFORM DEPLOYMENT (Step-by-Step)

### Prerequisites
1. GitHub repo with your project.
2. DigitalOcean account (free credits available).

### Steps

1. **Log in to DigitalOcean**: https://cloud.digitalocean.com

2. **Create App**:
   - Click "Apps" (sidebar) → "Create App" → "GitHub"
   - Authorize GitHub and select your repo + branch

3. **Configure Service**:
   - **Service Name**: `tukang-api`
   - **Source Type**: GitHub
   - **Dockerfile Path**: `./Dockerfile` (auto-detected)
   - **HTTP Port**: 3000
   - **Health Check Path**: `/` (optional)

4. **Add Environment Variables**:
   - Under your service, click "Edit" → "Environment"
   - Add:
     ```
     PORT=3000
     DB_HOST=<managed-mysql-host or external>
     DB_USER=root
     DB_PASSWORD=<secure-password>
     DB_NAME=tukang_db
     ```
   - ✅ Mark `DB_PASSWORD` as a Secret (DigitalOcean encrypts it)

5. **Add Database**:
   - Click "Resources" → "Create" → "MySQL Cluster"
   - Version: 8.0
   - **Size**: Basic (smallest for dev/test)
   - **Node count**: 1
   - Confirm and wait for creation (2-5 min)
   - DigitalOcean auto-injects DB credentials as env vars
   - OR use the host/user/password provided

6. **Import SQL Dump**:
   - After MySQL is running, get the host from "Database" section
   - Run locally:
     ```bash
     mysql -h <do-db-host> -u root -p < tukang_db_dump.sql
     ```

7. **Deploy**:
   - Click "Create App"
   - DigitalOcean builds Docker image and deploys
   - Wait for "Active" status
   - Your app is at https://<app-name>-<random>.ondigitalocean.app

8. **Test**:
   - Open the app URL in your browser
   - Try login or registration
   - Monitor logs in DigitalOcean dashboard

---

## ENVIRONMENT VARIABLES REFERENCE

Use these exact key names in both providers:

```
PORT = 3000

# Database connection
DB_HOST = <host.of.your.mysql>
DB_USER = root
DB_PASSWORD = <your_secure_password>
DB_NAME = tukang_db
```

**Important**: Treat `DB_PASSWORD` as a secret — never commit to Git; use each provider's secrets manager.

---

## IMPORT SQL DUMP (Both Providers)

After setting up the managed MySQL database, import the schema and sample data:

```bash
# Replace <DB_HOST> with the host provided by Render or DigitalOcean
mysql -h <DB_HOST> -u root -p < tukang_db_dump.sql
```

You'll be prompted for the password (use the one set in environment variables).

---

## TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| App won't start | Check logs in provider dashboard; ensure Dockerfile is at repo root |
| DB connection error | Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in environment variables |
| Static files 404 | Ensure `express.static(__dirname)` in `node.js` is serving from repo root |
| Slow first request | Cold start is normal; providers cache containers after first use |
| Git push not triggering deploy | Verify GitHub is connected and branch is correct in provider settings |

---

## NEXT STEPS

- Once deployed, monitor the app and update `node.js` or HTML files as needed.
- Each Git push to the connected branch will auto-redeploy (if auto-deploy is enabled).
- For production: add HTTPS (both providers auto-provide), restrict DB access, use strong passwords, and set up monitoring.

Good luck! 🚀
