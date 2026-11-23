<div align="center">

# 🚀 Evolora AI
### Intelligent, Adaptive & Personalized AI Interview Preparation Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

[Live Demo](https://evolora-ai.vercel.app) • [API Documentation](https://evolora-ai.onrender.com/docs) • [Report Bug](https://github.com/shaiknavedahmed/Evolora-AI/issues)

</div>

---

## 📖 Overview

**Evolora AI** is an end-to-end career intelligence and mock interview preparation ecosystem. Traditional interview prep platforms offer generic questions that fail to simulate realistic company expectations. Evolora solves this by extracting role-specific requirements directly from job descriptions, generating tailored assessments, simulating real-time technical & behavioral interviews, and generating ATS-optimized resumes.

```
Job Description / URL ──▶ Skill Extraction ──▶ Personalized Assessment ──▶ AI Mock Interview ──▶ Detailed Evaluation & Roadmap
```

---

## ✨ Key Features

- **🎯 Intelligent Job Description Parsing**:
  - Paste any job posting or provide a job URL to automatically scrape and parse.
  - Extracts key technical competencies, frameworks, soft skills, seniority level, and focus areas using LLM pipelines.

- **🎙️ Real-Time Adaptive Mock Interviews**:
  - Interactive, dynamic voice/text mock interviews with simulated senior hiring managers.
  - Generates situational follow-up questions adaptively based on the candidate's previous responses.

- **📝 Custom Assessment Engine**:
  - Role-targeted Multiple Choice Questions (MCQs), concept flashcards, and technical scenarios.
  - Real-time scoring, difficulty scaling, and instant explanations.

- **💻 Interactive Code Execution Sandbox**:
  - In-browser Monaco code editor supporting multi-language syntax highlighting and execution.
  - Evaluates algorithmic correctness, code complexity, and edge-case handling.

- **📄 ATS-Optimized Resume Engine**:
  - Tailors resumes to job descriptions and scores ATS compatibility.
  - Generates clean, parse-safe LaTeX resumes guaranteed to bypass screening filters.

- **📊 Comprehensive Analytics & Performance Feedback**:
  - Multi-dimensional rubric evaluations (Technical Depth, Problem Solving, Communication, System Design).
  - Clear breakdown of strengths, weaknesses, and a personalized improvement roadmap.

---

## 🛠️ Architecture & Tech Stack

```
Evolora-AI/
├── frontend/          # Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS)
└── backend/           # FastAPI (Python 3.11+, Motor/Beanie ODM, Groq / Claude LLMs)
```

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, PostCSS
- **State & UI**: Lucide Icons, Framer Motion, Recharts
- **Code Editor**: `@monaco-editor/react`

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous, High-Performance)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with Motor (async) & Beanie ODM
- **Authentication**: JWT Bearer Tokens (HS256) with salted `bcrypt` password hashing
- **AI Inference**: Groq API (Ultra-fast Llama 3.3 70B) & Anthropic Claude
- **Scraping & Parsing**: BeautifulSoup4, PyPDF, lxml

---

## ⚡ Quick Start (Local Setup)

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- MongoDB instance (Local or free [MongoDB Atlas](https://www.mongodb.com/atlas))

---

### 1. Clone Repository

```bash
git clone https://github.com/shaiknavedahmed/Evolora-AI.git
cd Evolora-AI
```

---

### 2. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# On macOS / Linux:
source .venv/bin/activate
# On Windows:
# .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Open `backend/.env` and configure your credentials:
```env
MONGODB_URL=your_mongodb_connection_string
MONGODB_DB_NAME=Evolora
SECRET_KEY=your_secret_key
NVIDIA_API_KEY=your_groq_or_nvidia_api_key
```

Run the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/health`

---

### 3. Frontend Setup (Next.js)

In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

- Web Application: `http://localhost:3000`

---

## 🌐 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGODB_URL` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_DB_NAME` | Database name | `Evolora` |
| `SECRET_KEY` | JWT token secret key | `super-secret-jwt-key` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated or list) | `http://localhost:3000,https://evolora-ai.vercel.app` |
| `NVIDIA_API_KEY` | LLM API Key (Groq or NVIDIA) | `gsk_...` |
| `NVIDIA_BASE_URL` | LLM OpenAI-compatible endpoint | `https://api.groq.com/openai/v1` |
| `NVIDIA_MODEL` | Default LLM model | `llama-3.3-70b-versatile` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL for FastAPI backend | `https://evolora-ai.onrender.com/api/v1` |

---

## 🚀 Deployment

| Component | Recommended Platform | Configuration |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | Root Directory: `frontend` |
| **Backend** | [Render](https://render.com) / [Railway](https://railway.app) | Root Directory: `backend` |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Network Access: Allow `0.0.0.0/0` |

---

## 🔒 Security & Best Practices

- **Zero Secret Commits**: Production credentials and API keys are strictly kept in environment variables.
- **CORS Protection**: Origin validation with automatic regex matching for preview and production domains.
- **Prompt Injection Defense**: Untrusted job descriptions are strictly sandboxed and treated as raw text input.

---

## 👥 Authors & Acknowledgments

- **Shaik Naved Ahmed** - [GitHub](https://github.com/shaiknavedahmed)
- Built for Capstone Project at SR University.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
