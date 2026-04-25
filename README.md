# 👨‍💼 Job Portal Web Application

> A full-stack job portal platform built with React, Node.js, Express.js, and MongoDB — enabling seamless job discovery, application workflows, and recruiter management.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 Overview

The **Job Portal Web Application** is a full-stack platform designed to bridge the gap between job seekers and employers. It supports user authentication, job listing management, application tracking, and secure resume uploads — all wrapped in a clean, responsive UI.

This project follows the **MVC (Model-View-Controller)** architectural pattern on the backend and uses **JWT-based authentication** to protect sensitive routes.

---

## ✨ Features

### 👤 Authentication & Authorization
- User registration and login (Job Seeker & Recruiter roles)
- JWT-based secure authentication
- Protected routes for authorized access only
- Password hashing with bcrypt

### 💼 Job Management
- Recruiters can post, update, and delete job listings
- Job seekers can browse, filter, and search jobs
- Pagination for large job datasets

### 📋 Application Workflow
- Job seekers can apply to jobs with a single click
- Resume upload via **Cloudinary** integration
- Application status tracking (Pending / Reviewed / Accepted / Rejected)
- Recruiters can view and manage all applicants

### 🔒 Security
- JWT stored securely (HttpOnly cookies / localStorage)
- Protected API routes using middleware
- Input validation and error handling

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| File Upload | Cloudinary, Multer |
| Deployment | Vercel (Frontend), Cloud/Local (Backend) |
| Dev Tools | Postman, dotenv, nodemon |

---

## 📁 Project Structure

```
job-portal/
│
├── client/                     # React Frontend
│   ├── public/
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── pages/              # Page-level components
│       ├── context/            # Auth & Global state
│       ├── hooks/              # Custom React hooks
│       ├── utils/              # Helper functions
│       └── App.jsx
│
└── server/                     # Node.js + Express Backend
    ├── config/
    │   └── db.js               # MongoDB connection
    ├── controllers/
    │   ├── authController.js
    │   ├── jobController.js
    │   └── applicationController.js
    ├── middleware/
    │   ├── authMiddleware.js   # JWT verification
    │   └── uploadMiddleware.js # Multer + Cloudinary
    ├── models/
    │   ├── User.js
    │   ├── Job.js
    │   └── Application.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── jobRoutes.js
    │   └── applicationRoutes.js
    └── server.js
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18+
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary** account

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/job-portal.git
cd job-portal
```

### 2. Setup Backend

```bash
cd server
npm install
npm run dev
```

### 3. Setup Frontend

```bash
cd client
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the `/server` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create a `.env` file in the `/client` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> ⚠️ Never commit `.env` files to version control. Add them to `.gitignore`.

---

## 🌐 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login and get JWT token | Public |
| GET | `/me` | Get current user profile | Private |
| POST | `/logout` | Logout user | Private |

### Job Routes — `/api/jobs`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all job listings | Public |
| GET | `/:id` | Get single job by ID | Public |
| POST | `/` | Create a new job | Recruiter |
| PUT | `/:id` | Update job listing | Recruiter |
| DELETE | `/:id` | Delete a job | Recruiter |

### Application Routes — `/api/applications`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/apply/:jobId` | Apply to a job (with resume) | Job Seeker |
| GET | `/my-applications` | Get all applications by user | Job Seeker |
| GET | `/job/:jobId` | Get all applicants for a job | Recruiter |
| PATCH | `/:id/status` | Update application status | Recruiter |

---

## 🔑 Authentication Flow

```
1. User registers → Password hashed with bcrypt → Stored in MongoDB
2. User logs in → Credentials verified → JWT token generated
3. JWT sent to client → Stored (cookie / localStorage)
4. Client sends JWT in Authorization header on protected requests
5. authMiddleware.js verifies token → Grants or denies access
```

---

## ☁️ Deployment

### Frontend — Vercel

```bash
# From /client directory
vercel deploy
```

Set environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Backend — Cloud / Local

You can deploy the backend to:

- **Render** — [render.com](https://render.com)
- **Railway** — [railway.app](https://railway.app)
- **Heroku** — [heroku.com](https://heroku.com)

Or run locally with:

```bash
npm run dev
```

> Make sure your MongoDB Atlas cluster whitelists the server IP for cloud deployments.

---

## 🗺 Roadmap

- [x] User authentication (JWT)
- [x] Job listing CRUD operations
- [x] Application tracking system
- [x] Resume upload via Cloudinary
- [x] Protected routes with middleware
- [ ] Real-time notifications (Socket.io)
- [ ] Admin dashboard
- [ ] Email notifications on application status change
- [ ] Advanced job filters (salary, location, experience)
- [ ] Mobile responsive UI polish
- [ ] Unit & integration testing (Jest + Supertest)

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add: your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- 📧 your.email@example.com
- [LinkedIn](#) | [GitHub](#) | [Portfolio](#)

---

> ⭐ If you found this project helpful or interesting, consider giving it a star on GitHub!
