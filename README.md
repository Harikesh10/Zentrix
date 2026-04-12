#  Zentrix

Zentrix is a sophisticated, AI-driven learning platform designed to turn your documents into actionable knowledge. Whether you're a student mastering new concepts or a professional managing dense information, Zentrix acts as your personal digital companion, providing deep insights through retrieval-augmented intelligence.

---

##  Key Features

-  Intelligent RAG Assistant**: Upload your PDFs and engage in meaningful conversations with an AI that truly "understands" your content.
-  Dynamic Dashboard**: Visualize your learning journey with streak trackers, activity heatmaps, and progress charts.
-  Smart Flashcards**: Organize and review core concepts with an elegant, interactive flashcard system.
-  Persistence & Synced History**: Your chat history and learning progress are securely stored and synced across sessions thanks to Firebase integration.


---

##  Tech Stack

### Frontend
- **Charts**: React
- **Auth/Database**:Cloud Firestore

### Backend
- **Language**: Python 
- **Framework**: FastAPI
- **Orchestration**: LangChain 
- **Vector Database**: FAISS 

---

##  Getting Started

Follow these steps to get Zentrix running locally on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/Harikesh10/Zentrix.git
cd Zentrix
```

### 2. Backend Setup
Create a virtual environment and install the necessary Python packages.
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```
> [!IMPORTANT]
> Create a `.env` file in the `backend` directory and add your `GOOGLE_API_KEY`.

### 3. Frontend Setup
Install dependencies and start the development server.
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Configuration
Ensure your Firebase configuration is correctly set up in the frontend environment variables to enable authentication and data persistence.

---

##  Project Structure

```text
Zentrix/
├── backend/           # FastAPI application & RAG service
├── frontend/          # React application (Vite + Tailwind)
└── README.md          # Project documentation
```

---

