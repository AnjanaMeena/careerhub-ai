# CareerHub AI 🚀
### AI-Powered Campus Opportunity & Career Management Platform

CareerHub AI is a centralized campus career management platform designed for university students to discover placements, internships, hackathons, workshops, and scholarships while receiving AI-driven career guidance powered by Google Gemini API.

---

## 🌟 Key Features

### 🎓 Student Portal
- **JWT Auth & Profile System**: Registration, login, profile editing, and live Profile Completion Tracker (20%, 45%, 75%, 100%).
- **Opportunity Discovery**: Search & filter placements, internships, hackathons, workshops, and scholarships with calculated AI Match Scores.
- **AI Match Score**: Calculates matching vs missing skills between student profiles and opportunity requirements.
- **Bookmark Wishlist**: Save opportunities for quick access in "My Bookmarks".
- **Application Tracker**: Real-time status pipeline (`Saved`, `Applied`, `Interview`, `Offer`, `Rejected`).
- **AI Resume Analysis**: PDF upload with Gemini AI scoring, ATS readability, missing skills, and improvement suggestions.
- **Skill Gap Analysis**: Target role breakdown (e.g. Full Stack Developer, Cybersecurity Analyst) with custom learning roadmaps.
- **AI Career Advisor Chat**: 24/7 conversational chatbot powered by Google Gemini API for interview tips and guidance.
- **Interactive Dashboard**: Recharts visual graphs displaying applications by status, recommended roles, upcoming deadlines, and notifications.

### 🛡️ Admin Portal
- **Admin Dashboard**: Visual analytics for Total Students, Total Opportunities, Applications Submitted, and Opportunities by Category chart.
- **Opportunity CRUD**: Add, edit, delete, and broadcast new campus opportunities.
- **Student Directory**: View all registered students, inspect detailed student profiles, and manage accounts.
- **Seeded Admin Account**: Out-of-the-box admin credentials (`admin@careerhub.ai` / `Admin@123`).

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), React Router DOM v6, Tailwind CSS, Axios, React Hook Form, Recharts, Framer Motion, React Hot Toast, Lucide Icons.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, BCrypt.js.
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`).
- **File Storage**: Cloudinary (with local disk storage fallback).

---

## 📁 Folder Structure

```text
careerhub-ai/
├── package.json
├── README.md
├── server/
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── Student.js
│   │   ├── Admin.js
│   │   ├── Opportunity.js
│   │   ├── Application.js
│   │   ├── Bookmark.js
│   │   ├── Resume.js
│   │   └── Notification.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── services/
│   │   ├── geminiService.js
│   │   └── cloudinaryService.js
│   ├── controllers/
│   ├── routes/
│   └── utils/
│       └── seedAdmin.js
└── client/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── context/
        ├── components/
        ├── pages/
        └── layouts/
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Run the install command from the root directory:
```bash
npm run install:all
```
*(Or navigate to `server/` and `client/` separately and run `npm install`)*

### 2. Configure Environment Variables
Copy `.env.example` to `.env` inside the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/careerhub_ai
JWT_SECRET=careerhub_super_secret_jwt_key_2026_major_project
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Seed Admin Account & Sample Data
```bash
npm run seed
```
**Admin Credentials:**
- **Email**: `admin@careerhub.ai`
- **Password**: `Admin@123`

### 4. Run Development Servers
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
