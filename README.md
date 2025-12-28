<div align="center">

  # 👁️ ARGUS
  ### See the Unseen. Respond Faster.
  
  <p>
    <b>Real-Time Tactical Incident Response System</b>
    <br />
    Built for <b>PROMETEO 2026</b>
  </p>

  <br />

  <p align="center">
    <a href="https://argus-murex.vercel.app">
      <img src="https://img.shields.io/badge/LIVE_DEMO-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/STATUS-OPERATIONAL_🟢-success?style=for-the-badge" alt="Status" />
    </a>
  </p>

  ![Next JS](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white)
  ![Nest JS](https://img.shields.io/badge/Nest.js-e0234e?style=flat-square&logo=nestjs&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
  ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
  ![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=Leaflet&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
  ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)

</div>

<br />

## 📜 The Mission
**Context:** In critical situations (fires, accidents, hazards), response times are bottlenecked by fragmented information and lack of verification.  
**The Solution:** **Argus** is a geospatial intelligence platform that bridges the gap between citizens and responders. It aggregates crowdsourced reports onto a real-time tactical heatmap, filters noise via a trust-based Karma system, and dispatches alerts instantly via WebSockets.

---

## ✨ Key Features

### 🗺️ Geospatial Intelligence
- **Interactive Dark Mode Maps:** Powered by Leaflet & CartoDB Dark Matter for high-contrast visibility in low-light environments.
- **Draggable Markers:** Precision location pinning for reporters.
- **Auto-Geolocation:** One-click GPS fix for rapid reporting.

### ⚡ Real-Time Operations
- **WebSocket Feeds:** Incidents appear on the Responder Dashboard **instantly** without refreshing (Socket.io).
- **Live Status:** Status changes (Investigating → Resolved) reflect immediately for all connected users.

### 🛡️ Trust & Verification (The Karma System)
- **Community Validation:** Users can Upvote/Downvote reports.
- **Reputation Engine:** Verified reports boost a user's Karma; spam reports reduce it. Low-karma users are automatically filtered out.
- **Role-Based Access:** Distinct flows for **Civilians** (Report & Vote) and **Responders** (Validate & Resolve).

### 🎨 Modern UI/UX
- **Dark Glassmorphism:** A "Tactical" aesthetic using `backdrop-blur`, semi-transparent layers, and electric blue accents.
- **Mobile-First:** Bottom-sheet drawer navigation for mobile users (Ola/Uber style) and floating glass panels for desktop.

---

## 📸 Screenshots

| **Tactical Dashboard** | **Mobile Reporting** |
|:---:|:---:|
| <img src="./frontend/public/dashboard-preview.png" alt="Dashboard" width="400"/> | <img src="./frontend/public/mobile-preview.png" alt="Mobile" width="200"/> |
| *Real-time incident heatmap* | *Draggable bottom-sheet form* |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Cloud)
- Redis (Optional, for caching)

### 1. Clone & Install
```bash
git clone [https://github.com/your-username/argus.git](https://github.com/your-username/argus.git)
cd argus
npm run install:all
cd backend
docker compose -f docker-compose.dev.yaml up -d

```

### 2. Environment Variables

Create a `.env` file in **both** `/frontend` and `/backend` directories.

**Backend (`/backend/.env`)**

```env
FRONTEND_URL="http://localhost:3000"

# Database (Default Postgres Docker settings)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password123
DB_NAME=argus_db
DATABASE_URL="postgresql://postgres:password123@localhost:5432/argus_db?schema=public"

# JWT (Freshly generated keys)
# Note: This is a random 256-bit key
JWT_AUTH_SECRET="e93596b6f9374092b32235921869818816f874944d1502421379308107952516"
JWT_EXPIRATION_TIME="900"           # 15 Minutes
JWT_REFRESH_EXPIRATION_TIME="604800" # 7 Days
JWT_ISSUER="http://localhost:8000"
JWT_AUDIENCE="http://localhost:3000"
```

**Frontend (`/frontend/.env`)**

```env
NEXT_PUBLIC_API_URL="http://localhost:8000"

```

### 3. Spin up the Database

```bash
# Inside /backend
npx prisma migrate dev --name init

```

### 4. Ignite the Engines 🏎️

We use a root script to launch both services:

```bash
npm run dev

```

* **Frontend:** `http://localhost:3000`
* **Backend:** `http://localhost:8000`

---

## 🏗️ Architecture

* **Frontend:** Next.js, Tailwind CSS, Lucide Icons, Leaflet (React-Leaflet), Axios.
* **Backend:** NestJS, Prisma ORM, Passport (JWT Auth), Socket.io Gateway, Cache Manager.
* **Database:** PostgreSQL (with geospatial data support potential).
* **Deployment:** Vercel (Frontend) + Render (Backend).

---

## 🤝 Contributing

This project was built for a 31-hour hackathon. While the core features are complete, we welcome contributions.

---

<div align="center">
<sub>Built with 💻, ☕, and 💙 by Team O(n!)</sub>
</div>