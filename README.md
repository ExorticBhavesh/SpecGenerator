# 🚀 SPEC Generator

AI-Powered Software Specification & Architecture Generator

## 📌 Overview

SPEC Generator is an AI-powered platform that transforms natural language project requirements into structured software specifications. The system leverages Large Language Models (LLMs) to automatically generate:

* Project Intent Analysis
* System Design Specifications
* Database Schemas
* REST API Designs
* UI/UX Specifications
* Consistency Validation Reports
* Pipeline Execution Monitoring

The platform helps developers, students, startups, and software architects rapidly convert ideas into implementation-ready specifications.

---

## 🎯 Problem Statement

Software projects often begin with vague requirements, leading to:

* Miscommunication between stakeholders
* Incomplete specifications
* Architecture inconsistencies
* Increased development time

SPEC Generator addresses these challenges by automatically producing structured technical specifications from plain English requirements.

---

## ✨ Key Features

### 🧠 AI-Powered Requirement Analysis

* Extracts project goals and objectives
* Identifies core system requirements
* Generates structured intent documentation

### 🏗️ System Design Generation

* High-level architecture creation
* Component identification
* Service interaction mapping

### 🗄️ Database Design

* Entity extraction
* Table generation
* Relationship mapping

### 🔌 API Specification Generation

* REST endpoint generation
* Request/response structure
* Resource modeling

### 🎨 UI Specification Generation

* Screen identification
* Component recommendations
* User flow generation

### 🔍 Consistency Validation

* Cross-stage verification
* Missing dependency detection
* Architecture consistency checks

### ⚡ Pipeline Execution Tracking

* Real-time stage monitoring
* Execution history
* Detailed pipeline inspection

### 📊 Evaluation Dashboard

* Performance metrics
* Pipeline analysis
* Validation reports

---

## 🏛️ System Architecture

User Requirement
↓
Intent Analysis
↓
System Design
↓
Database Design
↓
API Design
↓
UI Design
↓
Consistency Validation
↓
Final Specification Output

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Query
* Axios
* React Router

### Backend

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL

### AI Integration

* Google Gemini API

### Deployment

* Railway
* GitHub

---

## 📂 Project Structure

SPEC-Generator/

├── frontend/

│ ├── src/

│ ├── components/

│ ├── pages/

│ ├── hooks/

│ ├── api/

│ └── routes/

│

├── backend/

│ ├── src/

│ ├── prisma/

│ ├── ai-pipeline/

│ ├── repair/

│ ├── simulation/

│ └── evaluation/

│

├── README.md

└── .gitignore

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/ExorticBhavesh/SpecGenerator.git
cd SpecGenerator
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
DATABASE_URL=your_postgresql_database_url
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
```

Run backend:

```bash
npm run start:dev
```

Backend runs on:

```bash
http://localhost:3000
```

---

## 🔑 Environment Variables

```env
DATABASE_URL=
GEMINI_API_KEY=
GEMINI_MODEL=
PORT=
```

---

## 📸 Application Screenshots

### Dashboard

(Add Screenshot Here)

### Generate Specification

(Add Screenshot Here)

### Pipeline Monitoring

(Add Screenshot Here)

### Evaluation Dashboard

(Add Screenshot Here)

---

## 🚀 Future Enhancements

* Multi-LLM Support
* PDF Export
* DOCX Export
* Architecture Diagrams
* User Authentication
* Team Collaboration
* Cloud Deployment Automation

---

## 🎓 Academic & Learning Outcomes

This project demonstrates:

* Full Stack Development
* AI Integration
* System Design Principles
* REST API Development
* Database Modeling
* Software Architecture
* Prompt Engineering
* DevOps & Deployment

---

## 👨‍💻 Author

Bhavesh R. Chaudhary

Computer Engineering Student

Passionate about AI, Full Stack Development, SaaS Products, and Software Architecture.

GitHub:
https://github.com/ExorticBhavesh

---

## 📜 License

This project is developed for educational, research, and portfolio purposes.
