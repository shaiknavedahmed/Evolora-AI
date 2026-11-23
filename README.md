# 🚀 Evolora AI

> **Intelligent, Adaptive & Personalized AI Interview Preparation Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)

🔗 **Live App**: [https://evolora-ai.vercel.app](https://evolora-ai.vercel.app)  
📖 **API Swagger Docs**: [https://evolora-ai.onrender.com/docs](https://evolora-ai.onrender.com/docs)  
🩺 **Backend Health**: [https://evolora-ai.onrender.com/health](https://evolora-ai.onrender.com/health)

---

## 📌 Overview

**Evolora AI** is a personalized, AI-driven career intelligence and interview preparation ecosystem. Traditional prep tools provide static, generic questions. Evolora dynamically parses real job descriptions, identifies skill gaps, simulates realistic technical and behavioral interviews, evaluates coding challenges in real-time, and generates ATS-optimized resumes.

### 🔄 The Evolora Pipeline

```
Job Description / URL ──▶ Skill Extraction ──▶ Adaptive Assessment ──▶ AI Mock Interview ──▶ Detailed Feedback & Scorecard
```

---

## ✨ Features

- **🎯 AI Job Description Extraction**: Scrape from URLs or paste raw text to extract required technical skills, preferred tools, seniority level, and focus areas.
- **🎙️ Adaptive Mock Interviews**: Multi-turn, dynamic AI interviews that ask relevant follow-up questions tailored to candidate answers.
- **📝 Role-Specific Assessments**: Targeted MCQs and flashcards with instant explanations and difficulty calibration.
- **💻 Monaco Code Execution**: Interactive in-browser IDE for coding rounds with syntax highlighting and verification.
- **📄 ATS Resume Builder**: Generate parse-safe LaTeX resumes tailored to specific target roles.
- **📊 Performance Analytics**: Multi-dimensional rubrics covering Technical Accuracy, Problem Solving, Communication, and System Design.

---

## 🏗️ Architecture & Project Structure

The repository uses a clean, two-folder structure:

```
Evolora-AI/
├── frontend/          # Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS v4)
└── backend/           # FastAPI (Python 3.11+, Motor/Beanie ODM, Groq / Claude LLMs)
```

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router, Server & Client Components) |
| **Frontend Styling** | Tailwind CSS v4, PostCSS, Lucide Icons |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Backend API** | FastAPI, Uvicorn, Python 3.11+ |
| **Database** | MongoDB Atlas (Async Motor driver + Beanie ODM) |
| **Authentication** | JWT Bearer Authentication (python-jose, bcrypt) |
| **AI / LLMs** | Groq API (Llama 3.3 70B) & Anthropic Claude |
| **Hosting** | Vercel (Frontend) + Render (Backend) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ & npm
- Python 3.11+
- MongoDB Atlas cluster (free tier)

---

### 1. Clone the Repository

```bash
git clone https://github.com/shaiknavedahmed/Evolora-AI.git
cd Evolora-AI
```

---

### 2. Backend Setup (FastAPI)

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate       # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
```

Configure `backend/.env` with your credentials:

```env
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/Evolora?retryWrites=true&w=majority
MONGODB_DB_NAME=Evolora
SECRET_KEY=your-secret-jwt-key
NVIDIA_API_KEY=your-groq-or-nvidia-api-key
```

Run the backend server:

```bash
uvicorn app.main:app --reload --port 8000
```

- API Base: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

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

- Web App: `http://localhost:3000`

---

## 🌐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
| :--- | :--- |
| `MONGODB_URL` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Database name (`Evolora`) |
| `SECRET_KEY` | Secret key for JWT signing |
| `ALLOWED_ORIGINS` | Allowed CORS origins (`https://evolora-ai.vercel.app,http://localhost:3000`) |
| `NVIDIA_API_KEY` | API Key for LLM provider (Groq) |
| `NVIDIA_BASE_URL` | LLM endpoint (`https://api.groq.com/openai/v1`) |
| `NVIDIA_MODEL` | LLM model name (`llama-3.3-70b-versatile`) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Live backend API URL (`https://evolora-ai.onrender.com/api/v1`) |

---

## ☁️ Deployment

- **Frontend**: Hosted on [Vercel](https://vercel.com) (Root directory: `frontend`)
- **Backend**: Hosted on [Render](https://render.com) (Root directory: `backend`)
- **Database**: Hosted on [MongoDB Atlas](https://www.mongodb.com/atlas) (Network Access: `0.0.0.0/0`)

---

## 👨‍💻 Author

- **Shaik Naved Ahmed** — [GitHub](https://github.com/shaiknavedahmed)
- Built for Capstone Project at SR University.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
