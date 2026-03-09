import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

# Import our utility
from pdf_utils import extract_text_from_pdf
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from rag_service import generate_answer

load_dotenv()

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Warning: GOOGLE_API_KEY not found in environment variables.")

client = genai.Client(api_key=api_key)
MODEL_NAME = "gemini-2.5-flash"
# Initialize Embeddings globally
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)

# In-memory storage for simplicity (not suitable for production)
# Session ID -> Text Content
# In a real app, use Redis or a database.
session_store = {}

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.get("/")
def read_root():
    return {"message": "Zentrix API is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), session_id: str = Form(None)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_text(text)
        
        # Create embeddings
        # Create embeddings (use global instance)
        # embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)
        
        # Check if session exists and append, or create new
        if session_id and session_id in session_store:
            session_data = session_store[session_id]
            if session_data['vector_store'] is None:
                 session_data['vector_store'] = FAISS.from_texts(chunks, embedding=embeddings)
            else:
                 session_data['vector_store'].add_texts(chunks)
            message = "PDF added to existing session successfully"
        else:
            vector_store = FAISS.from_texts(chunks, embedding=embeddings)
            import uuid
            session_id = str(uuid.uuid4())
            session_store[session_id] = {
                'vector_store': vector_store,
                'history': []
            }
            message = "PDF processed and new session started"
        
        return {"session_id": session_id, "message": message, "chunks_count": len(chunks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    session_id = request.session_id
    user_message = request.message
    
    if session_id not in session_store:
        session_store[session_id] = {
            'vector_store': None,
            'history': []
        }
    
    session_data = session_store[session_id]
    vector_store = session_data['vector_store']
    history = session_data['history']
    
    # Use the extracted service
    try:
        answer = generate_answer(vector_store, user_message, client, MODEL_NAME, history)
        
        # Update history
        history.append({'role': 'user', 'content': user_message})
        history.append({'role': 'assistant', 'content': answer})
        
        return {"answer": answer}
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Check for specific Google API errors if possible
        if "400" in str(e):
             raise HTTPException(status_code=400, detail=f"API Error: {str(e)}. Check your API key or quota.")
        raise HTTPException(status_code=500, detail=f"Internal Error: {str(e)}")

@app.get("/stats/{session_id}")
async def get_stats(session_id: str):
    if session_id not in session_store:
        return {"question_count": 0}
    
    history = session_store[session_id]['history']
    # Count messages where role is 'user'
    question_count = sum(1 for msg in history if msg['role'] == 'user')
    return {"question_count": question_count}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
