# Getting Started with EquiHire

## Prerequisites
*   Ballerina (Swan Lake Update 8+)
*   Python 3.10+
*   Node.js 18+
*   Supabase Account (Database)
*   Google Gemini API Key (Feedback)
*   Cloudflare R2 Account (Secure Storage)

## Installation

### 1. Fork and Clone the Repository
```bash
git clone https://github.com/YourUsername/EquiHire-Core.git
cd EquiHire-Core
```

### 2. Database Setup (Supabase)
Run the SQL scripts in `supabase_schema.sql` via your Supabase SQL Editor.

### 3. Backend Gateway (Ballerina)
```bash
cd ballerina-gateway
cp Config.toml.example Config.toml
# IMPORTANT: Update Config.toml with your keys. follow the Config.toml.example file.
# Note: R2 'accessKeyId' is a string ID, not a URL.
bal run
```

### 4. AI Intelligence Engine (Python)

> **Recommendation:** We strongly recommend using **Miniforge Conda** to manage the Python environment.

```bash
cd python-ai-engine

# 1. Create the environment (Python 3.11)
conda create --name EquiHire-Core python=3.11 -y

# 2. Activate the environment
conda activate EquiHire-Core

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure Environment Variables
cp .env.example .env
# Update .env with:
# - GEMINI_API_KEY
# - R2 Credentials
# - SUPABASE_URL & SUPABASE_KEY

# 5. Run the Engine
# Option A: Direct uvicorn
uvicorn main:app --port 8000 --reload

# Option B: Via Python module (if command not found)
python -m uvicorn main:app --port 8000 --reload
```

### 5. Frontend (React)
```bash
cd react-frontend
npm install
npm run dev
```
