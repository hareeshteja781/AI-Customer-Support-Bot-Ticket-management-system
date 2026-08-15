# AI Customer Support Bot & Ticket Management System

An AI-powered customer support platform built with **FastAPI, React, SQLite/PostgreSQL, and Gemini**.

The system allows customers to interact with an AI support assistant, create and manage support tickets, maintain conversations, use browser-based voice support, and work with uploaded knowledge documents. Agents and administrators have role-based access to tickets, users, analytics, and support operations.

## Features

### Customer Support
- AI-powered customer support chat
- Conversation history
- Create and manage support tickets
- Ticket status and priority tracking
- Customer account management
- Browser-based voice support

### Agent & Admin
- Agent support dashboard
- Admin dashboard
- User management
- Ticket management
- Support analytics
- Role-based access control

### AI & Documents
- Gemini-based AI responses
- Document upload and ingestion
- Support for TXT, CSV, PDF, DOCX, and XLSX files
- RAG-style document retrieval
- AI responses using retrieved document context

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite for local development
- PostgreSQL support
- JWT authentication
- Pydantic
- Gemini API
- PyPDF
- python-docx
- openpyxl
- Pytest

### Frontend
- React
- Vite
- React Router
- Axios
- Lucide React
- Recharts
- Sonner

## Project Architecture

```text
AI-Customer-Support-Bot-Ticket-management-system/
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── tests/
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── docker-compose.yml
├── .env.example
├── run_backend.bat
├── run_frontend.bat
├── .gitignore
└── README.md
