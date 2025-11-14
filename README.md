# Events Backend (JavaScript, Node.js + Express, MySQL)

This is a minimal, fully-working backend for the events project described in your PDF.
It uses **plain mysql2 queries** (no TypeScript) so you can run it immediately in JavaScript.

Features included:
- JWT authentication (login / register)
- Role-based middleware (admin / organisateur / participant)
- Users, Events, Inscriptions, Payments endpoints
- SQL schema (create_tables.sql) to initialize the database

## Quick start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a MySQL database and run the SQL file:
   ```bash
   mysql -u root -p
   CREATE DATABASE eventsdb;
   USE eventsdb;
   SOURCE create_tables.sql;
   ```
3. Copy `.env.example` to `.env` and fill credentials.
4. Start the server:
   ```bash
   npm run dev
   ```
5. Test endpoints with Postman:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/events`
   - `POST /api/events` (requires organizer/admin token)

## Notes
- The original PDF mentions Drizzle ORM + MySQL; this project uses `mysql2` raw queries to be fully JavaScript-first.
- If you want Drizzle later, I can convert controllers to use Drizzle and add drizzle-kit migrations.
