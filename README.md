# StockAI Platform

> AI-Powered Stock Market Prediction & Investment Decision Support System

## 🚀 Quick Start

### Frontend (React + Vite)
```bash
cd /path/to/mini
npm install
npm run dev
# Opens at http://localhost:3000
```

### Backend (FastAPI + MongoDB)
```bash
cd backend
pip install -r requirements.txt
# Copy .env.example to .env and fill values
cp ../.env.example .env
# Start MongoDB locally first:
mongod --dbpath /usr/local/var/mongodb
# Then run:
uvicorn main:app --reload --port 8000
# API Docs at http://localhost:8000/api/docs
```

## 🔑 Authentication
- **Google OAuth** via Firebase (configured with your project `stock-b2418`)
- **Email/Password** via Firebase + backend JWT
- Protected routes redirect to `/login`

## 📁 Project Structure
```
mini/
├── src/               # React frontend
│   ├── pages/         # All 20+ pages
│   ├── components/    # Layout, charts, cards, widgets
│   ├── store/         # Zustand state (auth, market, portfolio)
│   ├── lib/           # Firebase, utils
│   └── styles/        # Global CSS (cyberpunk neon theme)
├── backend/           # FastAPI
│   ├── routers/       # 13 API route modules
│   ├── core/          # DB, config, security
│   └── schemas/       # Pydantic models
└── ml/                # ML model scripts
```

## 🎨 Theme
- **Background**: `#050816` (Deep Black)
- **Accent**: `#00E5FF` (Neon Blue)
- **Style**: Glassmorphism + Cyber Grid + Neon Glow

