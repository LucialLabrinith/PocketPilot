# PocketPilot — Free-First Personal Finance Platform

PocketPilot is a free-first, privacy-respecting personal finance management platform featuring **both a modern responsive Web App and a native JavaFX Desktop Application** connecting to the same unified REST API and relational database.

---

## 🎯 Architecture Overview

PocketPilot operates with a clean separation of concerns:
```
               +-----------------------------+
               |      React Web Client       |
               | (Port 3000 / Modern Browser)|
               +--------------+--------------+
                              |
                              | HTTP / JSON (Bearer Token)
                              v
               +-----------------------------+
               |  Unified Spring Boot 3 API  | <--- JavaFX Desktop Client
               |    (Java 21 / Port 8080)    |      (JavaFX 21 + ApiClient)
               +--------------+--------------+
                              |
                              v
               +-----------------------------+
               |    MySQL 8 / Relational DB  |
               | (InnoDB, Decimal Precision) |
               +-----------------------------+
```

Both clients share the identical database state, schema, authentication mechanisms, and business calculations. Any transaction added or account reconciled in the web application reflects immediately in the desktop application upon refresh/synchronization, and vice versa.

---

## 🛠️ Tech Stack

- **Java Runtime**: OpenJDK 21 LTS
- **Backend API**: Spring Boot 3.3.4 (Spring Web, Spring Data JPA, Bean Validation)
- **Desktop Application**: JavaFX 21 (`javafx-controls`, `javafx-fxml`, `java.net.http.HttpClient`)
- **Web Frontend**: React 19, TypeScript, Tailwind CSS, Lucide icons, Motion
- **Build System**: Apache Maven 3.8+ & Node.js 22 / Vite
- **Database**: MySQL 8.0+ DDL (`database/schema-mysql.sql`) & file-backed persistent relational store with atomic transactions
- **Authentication**: Email OTP verification (6-digit, 10-min expiration, 3-attempt limit, 15-min resend rate limiting, PBKDF2/SHA-256 password hashing)

---

## 🚀 Running the Applications

### 1. Web Application & Full-Stack API
```bash
# Start the unified dev server (serves web UI & REST API on port 3000)
npm run dev

# Or compile production bundle
npm run build
```
Visit `http://localhost:3000` in your browser.

### 2. Spring Boot 3 Backend (Java 21)
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
The Spring Boot REST API serves endpoints on `http://localhost:8080/api`.

### 3. JavaFX Desktop Application
```bash
cd desktop
chmod +x run-desktop.sh
./run-desktop.sh
# Or directly via Maven:
mvn javafx:run
```

---

## 🔐 Authentication & Email OTP Workflow

1. **User Registration (`POST /api/auth/register`)**:
   - User provides Name, Email, Password (min 6 chars), and Preferred Currency.
   - Password is salted and hashed with SHA-256.
   - A 6-digit cryptographic OTP is generated with a 10-minute expiration.
   - Account is created in `is_verified = false` state.

2. **OTP Verification (`POST /api/auth/verify-otp`)**:
   - User submits the 6-digit code.
   - Max 3 verification attempts allowed before the code is invalidated.
   - Upon valid verification, account is marked `is_verified = true` and a 7-day session token is issued.

3. **Development OTP Mode**:
   - In development mode (`POCKETPILOT_OTP_DEV_MODE=true`), the OTP code is output directly in the server logs and returned in the API response banner (`devOtp`), allowing 1-click filling in the web UI.
   - In production, OTPs are dispatched via standard SMTP (`spring.mail.host`, `spring.mail.username`, etc.).

4. **Password Reset (`POST /api/auth/forgot-password` & `/api/auth/reset-password`)**:
   - Safe password recovery via email OTP validation without leaking account existence.
