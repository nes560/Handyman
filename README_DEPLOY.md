**Deployment Guide — Node + MySQL (local with Docker, or prepare for cloud)**

Overview
- This project is a Node.js + MySQL app serving static HTML and an API in `node.js`.
- The repo now includes a `Dockerfile` and `docker-compose.yml` to run the full stack locally.

Option A — Quick local run with Docker (recommended)
1. Install Docker Desktop for Windows and ensure it runs.
2. From project root open PowerShell and run:

```powershell
# build and start app + mysql
docker-compose up --build -d

# view logs (optional)
docker-compose logs -f --tail=200 app
```

3. Open http://localhost:3000 in your browser.
4. To stop and remove containers:

```powershell
docker-compose down -v
```

Notes:
- The MySQL root password inside `docker-compose.yml` is `example`. For production change this and store it securely.
- Data is persisted in a named Docker volume `db_data`.

Option B — Deploy to a cloud VM or platform
- You can deploy the app to any host that runs Node and MySQL. Steps:
  1. Provision a MySQL instance and run the SQL schema (see `database_setup.sql`).
  2. Copy repository to server.
  3. Create a `.env` with correct `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
  4. Run `npm ci` and then `node node.js` (or use PM2/systemd).

Option C — Platform-as-a-Service
- Providers like Render, Railway, or DigitalOcean App Platform support Docker or direct Node deployments.
- If using a managed MySQL service, set the DB connection string via environment variables and deploy with the included `Dockerfile` or via their Node environment.

Database export/import
- To export your local DB to a SQL dump for production use:

```powershell
# from machine with mysqldump installed and DB accessible
mysqldump -u root -p tukang_db > tukang_db_dump.sql
```

- On the target MySQL server, import:

```powershell
mysql -u <user> -p < database_name < tukang_db_dump.sql
```

Making the app production-ready
- Change the DB root password and use a dedicated DB user.
- Use HTTPS (reverse proxy like Nginx or a managed platform that provides TLS).
- Secure environment variables via secrets manager.
- Consider using a managed database for production.

If you want, I can:
- Create a ready `tukang_db_dump.sql` by building a schema from `database_setup.sql` and sample rows (I can generate a minimal dump file), or
- Help deploy this stack to a specific provider (Render, Railway, DigitalOcean) with precise steps and sample configs.
