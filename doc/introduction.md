# Introduction to EquiHire

## The Problem

The technical recruitment landscape in Sri Lanka is currently flawed due to three critical bottlenecks:

1.  **The "Pedigree Effect" (Institutional Bias):** Recruiters subconsciously favor candidates from prestigious universities (e.g., Moratuwa/Colombo) while overlooking high-potential talent from regional universities (e.g., Rajarata/Ruhuna). This "University Bias" often leads to qualified candidates being rejected at the CV screening stage before their technical skills are ever tested.
2.  **Inefficient Manual Screening:** HR managers are overwhelmed by the volume of applications. To cope, they often rely on crude keyword matching (Ctrl+F) or superficial metrics, which fails to capture a candidate’s true problem-solving ability.
3.  **The "Black Box" of Rejection:** Rejected candidates rarely receive constructive feedback. They do not know if they failed because of a lack of technical knowledge or simply because they missed a specific keyword, stalling their professional growth.

## The Solution: Agentic Bias Firewall

EquiHire is an AI-Native Blind Assessment Platform designed to act as an objective "Bias Firewall." Instead of a standard interview, candidates complete a secure, lockdown technical assessment. The system acts as an intermediary agent that sanitizes the candidate's written identity and scores their technical answers semantically, ensuring hiring decisions are based strictly on code quality and logic, not background.

### Feature Name: The Agentic Bias Firewall (Tri-Agent Cognitive Engine)

The proposed solution utilizes a novel multi-agent AI architecture designed to simultaneously enforce privacy and evaluate technical merit. This "Cognitive Engine" operates through three synchronized agents:

#### 1. The Censor Agent (Privacy Enforcement)
*   **Technology:** GLiNER (Generalist Lightweight Named Entity Recognition).
*   **Function:** Unlike traditional static models, this Zero-Shot Transformer dynamically intercepts candidate text in real-time. It identifies and redacts Personally Identifiable Information (PII)—including names, universities, gender markers, and locations—based on a live "Bias Blocklist" managed by HR admins. This ensures the recruiter sees a purely technical, anonymous response.

#### 2. The Judge Agent (Semantic Evaluation)
*   **Technology:** SBERT (Sentence-BERT) with Cosine Similarity.
*   **Function:** This agent converts the candidate's anonymous answer and the recruiter's model answer into high-dimensional vector embeddings. It calculates a deterministic Technical Score (0-10) based on semantic meaning rather than simple keyword matching, ensuring candidates are credited for correct logic even if they use different terminology.

#### 3. The Auditor Agent (Feedback & Explanation)
*   **Technology:** Google Gemini API (Generative AI).
*   **Function:** Acting as a "Personalized Tutor," this agent analyzes the technical gaps identified by the Judge Agent. It generates a human-readable "Growth Report" for rejected candidates, explaining exactly which concepts they missed (e.g., "You missed the concept of Immutability in Tuples") and how to improve, effectively solving the "Black Box" rejection problem.

## System Architecture

The following **High-Level Container Diagram** (based on the C4 Model) illustrates the EquiHire system architecture, highlighting the specific roles of the Microservices, SaaS components, and the Tri-Agent Cognitive Engine.

```mermaid
graph TB
    %% --- USERS ---
    subgraph Users
        candidate[Candidate]
        recruiter[Recruiter]
        admin[IT Admin]
    end

    %% --- EXTERNAL SAAS ---
    subgraph External Managed Services
        auth[WSO2 Asgardeo<br/>(Identity & Access Mgmt)]
        storage[(Cloudflare R2<br/>Secure Object Storage)]
        db[(PostgreSQL<br/>Supabase Managed DB)]
        gemini[Google Gemini API<br/>(Auditor Agent - Feedback)]
    end

    %% --- INTERNAL SYSTEM ---
    subgraph EquiHire Cloud Environment [WSO2 Choreo Environment]
        
        %% Frontend Container
        webapp[Frontend SPA<br/>React + Vite + Tailwind]
        
        %% Backend Containers
        subgraph Backend Microservices
            gateway[API Gateway & Orchestrator<br/>Ballerina Swan Lake]
            
            subgraph IntelligenceEngine [Intelligence Engine Microservice - Python FastAPI]
                controller[FastAPI Controller]
                gliner[Censor Agent<br/>GLiNER Zero-Shot NER]
                sbert[Judge Agent<br/>Sentence-BERT scoring]
            end
        end
    end

    %% --- CONNECTIONS ---

    %% 1. Authentication Flow
    candidate -- "1. Auth / Magic Link" --> auth
    recruiter -- "Auth (OIDC)" --> auth
    auth -- "JWT Token" --> webapp

    %% 2. User Interactions
    candidate -- "2. Takes Lockdown Exam<br/>(HTTPS/WSS)" --> webapp
    recruiter -- "Views Dashboard / Grades<br/>(HTTPS)" --> webapp
    admin -- "Configures Bias Blocklist<br/>(HTTPS)" --> webapp

    %% 3. Frontend to Gateway
    webapp -- "3. API Calls (REST/JSON)<br/>with Bearer Token" --> gateway

    %% 4. Gateway Orchestration
    gateway -- "4. Route Requests / Notifications" --> controller
    gateway -- "Read/Write Job Data" --> db

    %% 5. Secure Storage Flow (The Vault)
    gateway -- "Generate Presigned URL" --> webapp
    webapp -- "5. Direct Secure Upload (CV PDF)" --> storage
    controller -- "Read CV for Parsing" --> storage

    %% 6. AI Processing Flow
    controller -- "6a. Sanitize Text" --> gliner
    controller -- "6b. Calculate Semantic Score" --> sbert
    controller -- "6c. Generate Growth Report" --> gemini

    %% 7. Data Persistence Flow
    controller -- "7. Save Redacted Text & Scores" --> db

    %% Styling
    classDef user fill:#f9f,stroke:#333,stroke-width:2px,color:black;
    classDef saas fill:#d4edda,stroke:#28a745,stroke-width:2px,color:black;
    classDef container fill:#cce5ff,stroke:#007bff,stroke-width:2px,color:black;
    classDef component fill:#e2e3e5,stroke:#6c757d,stroke-width:1px,color:black;

    class candidate,recruiter,admin user;
    class auth,storage,db,gemini saas;
    class webapp,gateway,IntelligenceEngine container;
    class controller,gliner,sbert component;
```

### Architectural Highlights

1.  **Hybrid Cloud Approach:** We adopted a Hybrid Cloud architecture deployed on **WSO2 Choreo**, separating core logic from managed SaaS providers to ensure scalability and security.
2.  **Microservices Core:**
    *   **Ballerina Gateway:** Acts as the lightweight orchestrator, handling high-concurrency API traffic, routing, and integrating with Identity Providers (Asgardeo).
    *   **Python Intelligence Engine:** A dedicated compute-heavy service hosting AI models (GLiNER, SBERT), ensuring that inference doesn't block API calls.
3.  **Agentic AI Layer:** The Intelligence Engine hosts three distinct agents:
    *   **The Censor (GLiNER):** Local Zero-Shot model for dynamic redaction.
    *   **The Judge (SBERT):** Local Sentence-Transformer for awarding semantic scores.
    *   **The Auditor (Gemini):** External API for generating explainable feedback.
4.  **Zero-Trust "Vault" Data Flow:** CVs are uploaded directly to **Cloudflare R2** via Presigned URLs. The backend never handles the raw file stream, minimizing the security surface area.

## Feature Contribution

| Student No | Feature Name | Brief Description of Feature (Software) |
| :--- | :--- | :--- |
| IT24102092 | Admin Control Center | * Developing the System Configuration Dashboard UI.<br>* Implementing the Notification Service (Ballerina) for sending email invites.<br>* Creating the "Bias Blocklist" management interface for admins. |
| IT24100886 | Core Backend & Vault | * Architecting the central Python FastAPI Microservice.<br>* Implementing the Cloudflare R2 Vault integration for zero-trust file storage.<br>* Managing the secure database transactions for "Blind" vs "Revealed" profiles. |
| IT24104161 | Lockdown Exam Engine | * Developing the Fullscreen Assessment UI with countdown timers.<br>* Implementing JavaScript-based Copy-Paste Blocking and Context Menu restrictions.<br>* Building the "Auto-Submit" backend logic for timed-out sessions. |
| IT24101554 | Recruiter Command Hub | * Building the Job Creation Wizard and Question Bank UI.<br>* Developing the "Grading View" to display redacted answers securely.<br>* Implementing the visual components for scoring and candidate ranking. |
| IT24102710 | Candidate Access Portal | * Developing the "Magic Link" (Passwordless) authentication flow.<br>* Building the "My Assessments" dashboard for candidates.<br>* Implementing the CV Upload UI with drag-and-drop functionality. |
| IT24101081 | Analytics & Reporting | * Designing the PostgreSQL database schema for audit logs and scores.<br>* Developing the "Bias Discrepancy" visualization charts.<br>* Implementing the PDF generation engine for downloadable "Growth Reports". |
