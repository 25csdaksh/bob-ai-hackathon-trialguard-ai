# ⚡ Setup & Run Guide — TrialGuard AI

## Prerequisites

Before starting, verify you have installed:
- **Python**: 3.10 or higher
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

---

## 1. Clone & Environment Setup

```bash
# Clone the repository
git clone https://github.com/25csdaksh/bob-ai-hackathon-trialguard-ai.git
cd bob-ai-hackathon-trialguard-ai
```

---

## 2. Backend Setup (FastAPI)

```bash
# Navigate to backend folder
cd src/backend

# Install Python requirements
python -m pip install -r requirements.txt

# Launch FastAPI server (seeds database automatically on startup)
python -m uvicorn app.main:app --reload --port 8000
```

The backend server will start on `http://localhost:8000`.  
You can view interactive OpenAPI swagger docs at `http://localhost:8000/docs`.

---

## 3. Frontend Setup (React + Vite)

Open a new terminal window:

```bash
# Navigate to frontend folder
cd src/frontend

# Install dependencies
npm install

# Launch Vite dev server
npm run dev
```

The frontend application will launch at `http://localhost:5173`.

---

## 4. Optional Environment Variables (.env)

If using IBM watsonx.ai REST integration, create a `.env` file inside `src/backend/`:

```env
WATSONX_API_KEY=your_ibm_watsonx_api_key
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_PROJECT_ID=your_project_id
DATABASE_URL=sqlite:///./trialguard.db
```

*Note: If credentials are not present, TrialGuard AI operates seamlessly in a deterministic data-grounded fallback mode.*

---

## 5. Verification Commands

To verify the submission files locally:

```bash
# Test backend module import
python -c "from src.backend.app.main import app; print('Backend compiles!')"

# Test frontend production build
cd src/frontend && npm run build
```
