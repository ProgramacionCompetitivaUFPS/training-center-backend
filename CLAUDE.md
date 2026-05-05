# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server with auto-reload (nodemon)
npm start            # Production server

# Database (requires sequelize-cli installed globally)
sequelize db:migrate          # Run pending migrations
sequelize db:seed:all         # Seed initial data
sequelize db:seed:undo:all    # Undo all seeds

# Tests (mocha/chai installed but no npm test script configured)
npx mocha test/               # Run tests manually
```

## Environment Setup

Create a `.env` file in the project root:

```env
NODE_ENV=development
DATABASE_URL=mysql://user:password@host/database_name
SECRET_TOKEN=your_jwt_secret_key
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=email_app_password
FROM_ACCOUNT=noreply@example.com
MYSQL_DATABASE=training_center
MYSQL_PASSWORD=your_db_password
PORT=3000
```

Config is loaded via `node-env-file` in `config/config.js`, which maps `DATABASE_URL` to Sequelize's connection config.

## Architecture

**Stack**: Express 4 + Sequelize 5 (MySQL/MariaDB) + Socket.io 2 + JWT auth

**Entry point**: `bin/www` — creates an HTTP server and attaches Socket.io before Express starts listening.

**Request flow**: `app.js` mounts all routes under `/api`. Each route module (e.g., `routes/users.js`) defines endpoints and delegates to inline controller logic or service calls.

**Real-time layer**: `services/socketsApi.js` sets up two Socket.io namespaces — `/contest` and `/normal-mode` — for live submission verdicts and contest scoreboard updates.

### Authentication

- `POST /api/auth` issues a 7-day JWT. Payload includes `sub` (user id), `usertype`, and `institution`.
- `middlewares/auth.js` exports `isAuth()` and `isRecovery()`. `isAuth()` validates the Bearer token, checks the `blacklist_tokens` table (for logged-out tokens), and injects `req.user`.
- Password recovery uses a short-lived token sent via `services/mailer.js` (Nodemailer + SMTP).

### Database Models (Sequelize)

16 models in `models/`: `users`, `problems`, `submissions`, `contests`, `categories`, `materials`, `syllabuses`, `syllabus_materials`, `syllabus_students`, `assignments`, `assignment_problems`, `contests_problems`, `contests_students`, `institutions`, `blacklist_tokens`.

Migrations live in `migrations/` and seeds in `seeders/`.

### File Uploads

`services/uploader.js` configures Multer for multipart uploads. Uploaded files are stored under the `/files` volume mount (relevant for Docker deployments).

### Key Services

| File | Purpose |
|------|---------|
| `services/authenticationService.js` | JWT creation, recovery tokens, blacklist management |
| `services/socketsApi.js` | Socket.io namespace setup and event emission |
| `services/mailer.js` | Sends recovery emails via Nodemailer |
| `services/uploader.js` | Multer storage configuration |
| `helpers/enums.js` | Shared constants (user types, contest types, institution types) |
