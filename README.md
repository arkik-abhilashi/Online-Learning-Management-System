# 📚 LMS – Learning Management System

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![React](https://img.shields.io/badge/react-18-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-14+-blue)

A full-featured **Learning Management System (LMS)** built with modern web technologies.  
This project supports three user roles — **Admin**, **Instructor**, and **Student** — each with its own dedicated dashboard and powerful features.

---

## ✨ Features

### 👨‍💼 Admin
- Statistical dashboard (users, courses, enrollments, revenue)
- Instructor revenue report
- User management with pagination (change role, activate/deactivate, delete)
- Instructor approval system
- Category management (CRUD)
- Activity logs
- Global notifications (WebSocket real-time)

### 👩‍🏫 Instructor
- Personal dashboard with analytics
- Course creation & management (title, description, image, price, level, publish)
- Session management (video upload/link, description, drip content)
- Multiple file attachments per session
- Quiz builder (multiple-choice questions)
- Student list with progress & quiz scores
- Question performance analytics
- Private messaging to students
- Certificate issuance (PDF)

### 🎓 Student
- Course search & filtering (category, level, price, name)
- Course detail page with introduction
- Enrollment & simulated payment (checkout page)
- Advanced learning panel:
  - Video playback with fullscreen
  - Note-taking with video timestamp
  - Video bookmarks
  - Discussion forum under each session
  - Weekly study goals
  - Download attachments
- Quiz taking with instant scoring
- Certificate generation (English PDF) & sharing
- Wishlist & shopping cart

### 🌐 General
- JWT authentication
- Role-based access control
- Dark/light theme toggle
- Responsive UI (Tailwind CSS)
- Real-time notifications (Socket.io)
- Swagger API documentation

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend    | Node.js, Express.js                  |
| Database   | PostgreSQL (native `pg` driver)      |
| Auth       | JWT (jsonwebtoken), bcryptjs         |
| Real-time  | Socket.io                            |
| File upload| Multer                               |
| PDF        | pdfkit (English certificates)        |
| API docs   | Swagger UI                           |

---

## 📁 Project Structure

```
lms-project/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middlewares/    # Auth, role, upload
│   │   ├── services/       # Notifications
│   │   ├── utils/          # DB connection, helpers
│   │   └── server.js       # Entry point
│   ├── uploads/            # Images, videos, attachments, certificates
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # Auth, Theme, Notification
│   │   ├── pages/          # All pages
│   │   ├── services/       # Axios config
│   │   ├── App.jsx         # Routing
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm

### 1️⃣ Database Setup
Create a PostgreSQL database and user:

```sql
CREATE USER lms_user WITH PASSWORD 'lms_pass123';
CREATE DATABASE lms_db OWNER lms_user;
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Then edit with your credentials
npm run dev
```

Backend runs on `http://localhost:5000`

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### 4️⃣ Seed Demo Data

Run the SQL commands in `backend/seed.sql` (or execute `seed-final-fixed.sh` on Linux) to populate users, courses, sessions, quizzes, and more.

**Demo accounts (password: `123456`):**

| Role      | Email               |
|-----------|---------------------|
| Admin     | admin@lms.local     |
| Instructor| sara@lms.local      |
| Instructor (unapproved)| hossein@lms.local |
| Student   | ali@lms.local       |
| Student   | zahra@lms.local     |
| Student   | reza@lms.local      |

---

## 📚 API Documentation

Swagger docs are available at:

```
http://localhost:5000/api-docs
```

---

## 🖼️ Media Files

Place sample images/videos in `backend/uploads/` with these names:

- `images/react-course.jpg`
- `images/nodejs-course.jpg`
- `images/uiux-course.jpg`
- `images/marketing-course.jpg`
- `videos/react-jsx.mp4`
- `videos/react-state.mp4`
- etc.

---

## 🧪 Key Challenges & Solutions

- **Prisma → pg migration:** Due to network restrictions (Prisma engines download failure), the entire data layer was migrated to native `pg` driver with raw SQL queries.
- **Persian PDF generation:** Tested with pdfkit + fontkit for RTL support; due to cross-platform font issues, final certificates are generated in English with the default font for reliability.
- **Real-time progress tracking:** Created a separate `StudentSessionProgress` table and recalculates completion percentage on every session toggle.

---

## 📈 Future Improvements

- Real payment gateway integration
- Email notifications (Nodemailer)
- Mobile app (PWA / React Native)
- Advanced question types (essay, multi-select)
- Course rating & reviews
- Live streaming support

---

## 📄 License

This project is for educational purposes. All rights reserved.
