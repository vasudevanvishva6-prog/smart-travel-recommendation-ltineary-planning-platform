# ✈️ WanderSmart — Smart Travel Recommendation & Itinerary Planning Platform

> **React + TypeScript + Node.js + Express.js + PostgreSQL + Redis + REST API + Docker + Git/GitHub**

WanderSmart is an intelligent, full-stack travel recommendation and day-by-day itinerary planning platform. It pairs multi-criteria AI/heuristic scoring (budget, trip duration, travel party, and activity preferences) with automatic day-by-day itinerary scheduling, itemized budget calculations, live weather forecasts, and interactive OpenStreetMap/Leaflet location mapping.

---

## 🌟 Modules & Features Checklist

### 👤 1. User Module & Preferences
- User Registration & Login with secure bcrypt hashing & JWT tokens.
- **Gmail OTP verification** (Nodemailer Gmail SMTP with development console fallback).
- User profile management (Name, avatar, role, verification status).
- Password change with old password verification.
- Customizable Travel Preferences:
  - **Target Budget** (e.g., ₹5,000 to ₹1,00,000+)
  - **Number of Days** (2 to 14 days)
  - **Travel Type**: Solo, Couple, Family, Friends
  - **Interests**: Nature, Adventure, Beach, Historical, Shopping, Food, Religious

### 🏠 2. Home Page
- Hero search bar with instant autocomplete.
- Trip preferences filter wizard modal.
- Popular destinations showcase with ratings and best travel seasons.
- Trending tourist attractions.
- Travel categories grid (Nature, Adventure, Beach, Historical, Food, Religious, Shopping).
- Special packages & seasonal offers with discount tags.

### 🗺️ 3. Destination Module
- Complete destination profile:
  - Hero image and gallery photos
  - Rich description, state, country
  - **Best time to visit** (e.g., *October – June*)
  - **Average budget** (e.g., *₹8,000*)
  - **Popular places** (e.g., *Ooty Lake, Botanical Garden, Doddabetta Peak, Tea Museum*)
  - Accommodations & Hotels with price per night and amenities
  - Cafes & Dining spots with popular dishes and price ranges
  - Activities, live seasonal weather, and interactive coordinates

### 🤖 4. Smart Recommendation Module
- **Core AI/Heuristic Engine**:
  - Evaluates user parameters: **Budget** (e.g., ₹20,000), **Duration** (4 Days), **Travel Type** (Friends), **Interests** (Adventure + Nature).
  - Computes multi-attribute weighted match scores:
    1. **Kerala** ⭐ **92%**
    2. **Goa** ⭐ **88%**
    3. **Coorg** ⭐ **85%**
    4. **Ooty** ⭐ **81%**
    5. **Manali** ⭐ **78%**
  - Displays dynamic reason badges (e.g., *"Top match for Adventure & Nature"*, *"Well within ₹20,000 budget"*).
  - One-click CTA: **"Generate Day-by-Day Itinerary"**.

### 📅 5. Itinerary Planning Module
- Automatically generates day-by-day timelines for the destination:
  - **DAY 1**: Morning (Munnar Tea Museum) $\to$ Afternoon (Mattupetty Dam) $\to$ Evening (Local Market)
  - **DAY 2**: Morning (Eravikulam National Park) $\to$ Afternoon (Adventure Activity) $\to$ Evening (Hotel)
  - **DAY 3**: Morning (Alleppey) $\to$ Afternoon (Houseboat) $\to$ Evening (Backwater Sunset)
  - **DAY 4**: Morning (Fort Kochi) $\to$ Afternoon (Shopping) $\to$ Evening (Return Journey)
- Pairs each slot with dining recommendations and entry fee estimates.
- Save, export to PDF, print, or share trip link.

### 💰 6. Budget Planner
- Itemized cost calculations:
  - **Transportation**: ₹5,000
  - **Hotel & Stays**: ₹6,000
  - **Food & Dining**: ₹3,000
  - **Activities & Tours**: ₹2,000
  - **Entry Tickets**: ₹1,000
  - **Total Estimated Cost**: ₹17,000
  - **Target User Budget**: ₹20,000
  - **Remaining Budget**: **+₹3,000** (Surplus)
- Visual progress bar and over-budget alerts.

### 🌦️ 7. Weather Module
- Live temperature, condition, humidity, wind speed, and precipitation.
- 4-day forecast breakdown.
- Weather-aware travel tips (e.g., scenic viewpoints in clear mornings, indoor heritage museums during rainy afternoons).
- Redis-cached for ultra-fast response.

### 📍 8. Map & Location Module
- Interactive **Leaflet & OpenStreetMap** map (zero API billing required).
- Color-coded pins for Attractions (Blue), Hotels (Indigo), and Dining (Amber).
- Popups with thumbnails, category, price, and ratings.
- Route polyline connecting planned attractions.

### 🏨 9. Hotel Module
- Filter by destination, price per night, and rating.
- Amenities display (WiFi, Pool, Mountain View, Breakfast, Fireplace).
- Direct booking inquiry simulation.

### 🍴 10. Restaurant Module
- Filter by destination, cuisine, and price tier (₹, ₹₹, ₹₹₹).
- Ratings and must-try popular dishes (e.g., *Karimeen Pollichathu*, *Appam*, *Pandi Curry*).

### ⭐ 11. Review & Rating Module
- Verified traveler reviews with 1 to 5 star ratings.
- Dynamic recalculation of destination overall score.

### ❤️ 12. Wishlist / Saved Trips
- Save favorite destinations with one click.
- Persistent saved items accessible from navbar badge.

### 📋 13. My Trips
- Personal trip dashboard:
  - ✓ **Kerala – 4 Days**
  - ✓ **Goa – 3 Days**
  - ✓ **Ooty – 2 Days**
- Open full itinerary, view budget, print, or remove.

### 🔐 14. Authentication & Security
- Secure registration $\to$ Gmail OTP $\to$ Verify OTP $\to$ JWT Login.
- Password hashing using bcrypt with salt rounds.

### 👨‍💼 15. Admin Module & Dashboard
- Platform Statistics:
  - **Total Users**: 1,250
  - **Total Destinations**: 85
  - **Total Trips Planned**: 2,430
  - **Total Reviews**: 4,820
- Most Popular Ranking (Goa, Kerala, Ooty, Manali, Coorg).
- Destination CRUD (Add, Edit, Delete).
- User activity and review management.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React-Leaflet, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, Zod, JWT, bcryptjs, Nodemailer |
| **Database** | PostgreSQL 16 (in Docker/Production) / SQLite (zero-config local dev) |
| **Caching** | Redis 7 (in Docker/Production) / Resilient In-Memory Cache (local fallback) |
| **Maps** | OpenStreetMap + Leaflet (Interactive, free, no API keys required) |
| **DevOps** | Docker, Docker Compose, Nginx, Git, GitHub |

---

## 🚀 Getting Started

### Option 1: Instant Local Run (Zero Configuration)

#### 1. Backend Setup:
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```
*Backend runs on `http://localhost:5000`*

#### 2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

### Option 2: Docker Compose (Full Production Stack)

Run the entire PostgreSQL, Redis, Node Backend, and Vite Frontend stack with a single command:

```bash
docker compose up --build
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Status |
|---|---|---|---|
| **Traveler** | `traveler@gmail.com` | `traveler123` | Verified (Includes pre-saved Kerala 4-Day Trip) |
| **Administrator** | `admin@travel.com` | `admin123` | Admin Role (Access to `/admin` dashboard) |

---

## 📡 REST API Endpoints Overview

### Auth (`/api/auth`)
- `POST /register`: Create account & generate OTP
- `POST /login`: JWT authentication
- `POST /send-otp`: Generate & send OTP (SMTP or console fallback)
- `POST /verify-otp`: Validate 6-digit OTP code
- `GET /profile`: User details & preferences
- `PUT /preferences`: Update budget, days, travel party, interests
- `POST /change-password`: Update password

### Destinations (`/api/destinations`)
- `GET /`: List all destinations with search & category filters
- `GET /featured`: Top rated, trending spots, categories, packages
- `GET /:id`: Full destination profile with places, hotels, dining, weather
- `GET /slug/:slug`: Destination profile by slug

### Recommendations (`/api/recommendations`)
- `POST /`: Multi-factor AI recommendation engine with match percentage

### Itineraries (`/api/itineraries`)
- `POST /generate`: Dynamic day-by-day itinerary & budget breakdown
- `POST /save`: Save itinerary to user's trips
- `GET /my-trips`: List user's saved trips
- `GET /:id`: Specific trip details
- `DELETE /:id`: Delete saved trip

### Admin (`/api/admin`)
- `GET /stats`: Platform analytics KPI statistics
- `GET /users`: List registered users
- `POST /destinations`: Create new destination
- `DELETE /destinations/:id`: Delete destination

---

## 📄 License
MIT License. Built for seamless travel discovery and planning!
