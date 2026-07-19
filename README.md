# 🎓 AthenAI – AI-Powered Personalized Learning Path (MVP)

> AI-powered educational platform that analyzes student assessment results, identifies learning gaps, and automatically generates personalized learning plans requiring teacher validation before delivery.

Developed during the **AUI AI Summer School 2026 Hackathon**.

---

## 🚀 Overview

AthenAI is an AI-driven educational platform designed to help teachers provide personalized learning experiences at scale.

Instead of manually analyzing every student's weaknesses, the platform automatically:

- analyzes assessment results
- detects skill gaps
- prioritizes learning needs
- generates personalized study plans using AI
- allows teachers to review, regenerate or approve recommendations
- tracks student progress through completion dashboards

The project follows an orchestrated workflow architecture built with Fusion AI.

---

# ✨ Key Features

## 📊 Student Analysis

- Assessment validation
- Score normalization
- Skill gap detection
- Priority calculation
- AI pedagogical diagnosis  and many more functions . 

---

## 🤖 AI Learning Plan Generation

The platform generates learning plans based on:

- detected weaknesses
- available learning resources
- maximum daily workload
- preferred study duration

Each plan includes structured learning activities targeting the student's weakest skills.

---

## 👨‍🏫 Teacher Validation

Teachers remain in control of the learning process.

They can:

- ✅ Approve a plan
- 🔄 Request regeneration
- ❌ Reject recommendations

No learning plan is delivered before teacher approval.

---

## 📈 Progress Tracking

Students can monitor:

- completed activities
- learning progress
- completion percentage
- current plan status

Administrators can monitor institutional KPIs through dashboards.

---

# 🏗 Architecture

The backend follows a multi-orchestrator architecture.

```
               Student Result
                      │
                      ▼
             ORCH-01 Analysis
                      │
      ┌───────────────┴──────────────┐
      ▼                              ▼
 Validation                 Gap Detection
                              │
                              ▼
                     AI Diagnosis
                              │
                              ▼
             ORCH-02 Learning Plan
                              │
                              ▼
                    Teacher Validation
                              │
             ┌────────────────┴───────────────┐
             ▼                                ▼
        Approved                      Regenerate
             │
             ▼
      Student Notification
             │
             ▼
        Progress Tracking
```

---

# ⚙ Workflow Overview

The MVP is composed of four orchestrators.

| Orchestrator | Purpose |
|--------------|----------|
| ORCH-01 | Student result analysis |
| ORCH-02 | AI learning plan generation |
| ORCH-03 | Teacher decision & distribution |
| ORCH-04 | Progress tracking & dashboard |

Each orchestrator is divided into independent workflows, allowing modular execution and easier maintenance.

---

# 🗂 Main Workflows

### ORCH-01

- WF-01 Input Validation
- WF-02 Result Storage
- WF-03 Score Analysis
- WF-04 AI Pedagogical Diagnosis

---

### ORCH-02

- WF-05 Resource Selection
- WF-06 AI Plan Generation
- WF-07 Technical Validation

---

### ORCH-03

- WF-08 Teacher Decision
- WF-09 Plan Regeneration
- WF-10 Student & Teacher Notification

---

### ORCH-04

- WF-11 Progress Tracking
- WF-12 Dashboard API

---

# 🛠 Tech Stack

## Frontend

- Next.js 14
- React
- TypeScript
- Tailwind CSS

## Backend (Architecture)

- Fusion AI
- Supabase
- AI Agents
- REST APIs
- Workflow Orchestration

## AI

- Groq API (Hackathon Demo)
- LLM-powered Diagnosis
- Personalized Learning Plan Generation

---

# 📂 Repository Structure

```
.
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── ...
│
├── Architecture_MVP.txt
├── Architecture_MVP_Personalized_Learning_Path_Fusion_AI.pdf
└── README.md
```

---

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/<repo>.git
```

Navigate to the frontend

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run locally

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

# 📊 Dashboard Modules

### Student Dashboard

- Skill breakdown
- AI diagnosis
- Learning activities
- Progress tracking

### Teacher Dashboard

- Review AI recommendations
- Approve plans
- Reject plans
- Request regeneration

### Administrator Dashboard

- Global KPIs
- Skill gap statistics
- Student overview
- Learning plan status

---

# 📚 Documentation

Additional documentation can be found in:

- `Architecture_MVP_Personalized_Learning_Path_Fusion_AI.pdf`
- `Architecture_MVP.txt`

These documents describe:

- workflow contracts
- orchestrators
- Supabase schema
- API payloads
- validation rules
- implementation roadmap

---

# 🔮 Future Improvements

- Authentication
- Real LMS integration
- Multi-course support
- Recommendation engine
- Analytics dashboard
- Email notifications
- AI feedback improvement

---

# 👥 Team

Developed during the **AUI AI Summer School 2026 Hackathon**.

---

# 📄 License

This project was created for educational and demonstration purposes.