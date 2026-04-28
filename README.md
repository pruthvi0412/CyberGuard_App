# 🛡️ AI Cybercrime Reporting & Complaint Management System

A full-stack, AI-powered cybercrime reporting platform with:
- **Backend**: Node.js + Express + MongoDB + Socket.IO
- **ML Service**: Python Flask + TF-IDF + Logistic Regression
- **Web App**: React + Three.js 3D UI + Recharts
- **Mobile App**: React Native + Expo

---

## 📁 Folder Structure

```
cybercrime-system/
├── backend/          → Node.js REST API (port 5000)
├── ml-service/       → Python Flask ML API (port 5001)
├── web-app/          → React web frontend (port 3000)
└── mobile-app/       → React Native Expo app
```

---

## ⚡ Quick Start (Run Locally)

### Prerequisites
- Node.js 18+ → nodejs.org
- Python 3.10+ → python.org
- MongoDB 7.0 → mongodb.com
- Expo Go app on your phone

### Step 1 — Start MongoDB
```bash
# macOS
brew services start mongodb-community@7.0

# Linux
sudo systemctl start mongod
```

### Step 2 — Start ML Service
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate          # Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
mkdir -p models
python3 train_model.py
python3 src/app.py
```

### Step 3 — Start Backend
```bash
cd backend
npm install
# Copy .env and fill in your values
cp .env .env.backup
npm run dev
```

### Step 4 — Start Web App
```bash
cd web-app
npm install
npm start
# Opens http://localhost:3000
```

### Step 5 — Start Mobile App
```bash
cd mobile-app
npm install
# Edit src/services/api.js — change BASE_URL to your LAN IP
npx expo start
# Scan QR code with Expo Go
```

---

## 🔑 Default Admin Login
- **Email**: admin@cybercrime.gov
- **Password**: Admin@123456

---

## 🌐 Ports
| Service    | Port |
|------------|------|
| Backend    | 5000 |
| ML Service | 5001 |
| Web App    | 3000 |
| MongoDB    | 27017|

---

## 🚀 Deploy to Internet
See the Deployment Guide PDF for full instructions:
- MongoDB → **MongoDB Atlas** (free)
- ML Service + Backend → **Railway.app** (free tier)
- Web App → **Vercel** (free)
- Mobile → **Google Play** ($25) + **App Store** ($99/year)

---

## 📊 Tech Stack
| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Node.js, Express, MongoDB, Socket.IO    |
| ML         | Python, Flask, scikit-learn, NLTK       |
| Web        | React, Three.js, Recharts, Framer Motion|
| Mobile     | React Native, Expo, AsyncStorage        |
| Auth       | JWT (access + refresh tokens)           |
| Real-time  | Socket.IO WebSockets                    |
| AI         | TF-IDF + Logistic Regression (11 categories)|
