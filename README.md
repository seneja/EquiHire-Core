# EquiHire-Core: The Real-Time Cognitive Bias Firewall

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tech Stack](https://img.shields.io/badge/stack-WSO2%20%7C%20Python%20%7C%20React-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-MVP%20Development-orange)

> **"Evaluating Code, Not Context."**

**EquiHire** is an AI-driven intermediary layer for technical recruitment. It intercepts live audio from candidates during technical interviews, sanitizes their identity (voice, accent, and PII) in real-time using a hybrid microservices architecture, and presents recruiters with a purely semantic text stream. This ensures hiring decisions are based solely on technical merit, effectively acting as a firewall against unconscious bias.

---

## 📑 Table of Contents
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [The Team](#-the-team)

---

## 🚩 The Problem
Technical recruitment is plagued by unconscious biases that "Blind Hiring" tools fail to solve:
1.  **The Accent Penalty:** Candidates with non-native accents are subconsciously rated lower on technical competence.
2.  **Contextual Bias:** Hiring managers favor candidates from specific universities or demographics based on visual/auditory cues.
3.  **The "Black Box" Rejection:** Rejected candidates rarely receive explainable feedback on *why* they failed.

## 💡 The Solution
EquiHire replaces the video call with a **Sanitized Real-Time Data Stream**.
1.  **Audio Interception:** We capture the candidate's voice via Twilio Media Streams.
2.  **AI Sanitization:**
    * **Whisper AI** transcribes audio to text (removing accent bias).
    * **Fine-Tuned BERT** redacts PII like Names, Schools, and Locations (removing contextual bias).
3.  **Explainable Feedback (XAI):** Our engine analyzes the gap between the candidate's answers and the job description to generate a "Growth Report" post-interview.

---

## 🏗 System Architecture
EquiHire utilizes a **Cloud-Native Hybrid Microservices** pattern hosted on **WSO2 Choreo**.



* **Service A: The Gateway (Ballerina)** 🟢
    * Handles high-concurrency WebSockets from Twilio.
    * Manages Authentication (Asgardeo) and Database Logging.
    * Routes traffic between the User and the AI Engine.
* **Service B: The Brain (Python/FastAPI)** 🐍
    * Hosts the AI Models (Whisper, BERT, Scikit-Learn).
    * Processes raw audio chunks and returns sanitized JSON.
* **Service C: The Dashboard (React + Vite)** ⚛️
    * Real-time "Blind" Dashboard for recruiters.
    * Audio-visualizer portal for candidates.

---

## 🚀 Key Features

### 🧠 AI Capabilities
* **Context-Aware Transcription:** OpenAI Whisper primed for Sri Lankan technical accents (e.g., "Moratuwa", "Batch Top").
* **Real-Time Redaction:** Custom Fine-Tuned BERT model (`bert-base-ner`) to detect and mask local entities (`[School]`, `[Location]`).
* **XAI Feedback Engine:** Uses Cosine Similarity (Scikit-Learn) to explain rejections based on semantic gaps in the transcript.

### 🛠 Software Modules
1.  **Secure Identity:** Magic Link login & Role-Based Access Control (RBAC) via **WSO2 Asgardeo**.
2.  **Live Stream Orchestrator:** Low-latency (<2s) WebSocket pipeline via **Ballerina**.
3.  **Blind Dashboard:** A React UI that hides the candidate's identity until grading is submitted.
4.  **Audit Trail:** Immutable logs of "Original vs. Redacted" text for HR compliance.

---

## 💻 Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), TypeScript, Tailwind CSS, Shadcn/UI |
| **Gateway Service** | **Ballerina** (Swan Lake) |
| **AI Service** | Python 3.10, FastAPI, PyTorch, Transformers |
| **Infrastructure** | **WSO2 Choreo** (Hosting), **WSO2 Bijira** (API Gateway) |
| **Identity** | **WSO2 Asgardeo** (OIDC/OAuth2) |
| **Communication** | Twilio Programmable Voice (Media Streams) |
| **Database** | PostgreSQL (Neon/Supabase), Redis (Caching) |

---

## ⚡ Getting Started

### Prerequisites
* Docker & Docker Compose
* Python 3.10+
* Ballerina (Swan Lake Update 8+)
* Node.js 18+

### Installation (Monorepo)

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/YourUsername/EquiHire-Core.git
    cd EquiHire-Core
    ```

2.  **Run with Docker Compose (Recommended)**
    This spins up Postgres, Redis, the AI Service, and the Gateway.
    ```bash
    docker-compose up --build
    ```

3.  **Run Frontend (Manual)**
    ```bash
    cd react-frontend
    npm install
    npm run dev
    ```

4.  **Expose Localhost (For Twilio)**
    Use Ngrok to expose your Ballerina WebSocket port (9090).
    ```bash
    ngrok http 9090
    ```

---

## 🔑 Environment Variables
Create a `.env` file in the root directory.

```env
# General
ENV=development
SECRET_KEY=your_super_secret_key

# WSO2 / Identity
ASGARDEO_CLIENT_ID=xxx
ASGARDEO_CLIENT_SECRET=xxx
ASGARDEO_ORG_URL=https://api.asgardeo.io/t/orgname

# Database
DATABASE_URL=postgres://user:password@localhost:5432/equihire

# AI Services
OPENAI_API_KEY=sk-xxx
HUGGINGFACE_TOKEN=hf_xxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx

```

---

## 📂 Project Structure

```text
EquiHire-Core/
├── ballerina-gateway/       # The Ballerina Orchestrator Service
│   ├── modules/
│   └── service.bal          # WebSocket Listener
├── python-ai-engine/        # The FastAPI AI Service
│   ├── app/
│   │   ├── core/            # Whisper & BERT Logic
│   │   └── api/
│   └── main.py
├── react-frontend/          # React Application
│   ├── src/
│   │   ├── components/      # UI Components (Shadcn)
│   │   └── hooks/           # useInterviewSocket.ts
│   └── vite.config.ts
├── docker-compose.yml       # Container Orchestration
└── README.md

```


---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

---
