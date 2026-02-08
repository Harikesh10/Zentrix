
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os
from langchain.embeddings.base import Embeddings

# Add the directory to sys.path so we can import main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app, session_store

class FakeEmbeddings(Embeddings):
    def embed_documents(self, texts):
        return [[0.1] * 768 for _ in texts]
    def embed_query(self, text):
        return [0.1] * 768

client = TestClient(app)

def test_incremental_ingestion():
    with patch('main.extract_text_from_pdf') as mock_extract, \
         patch('main.GoogleGenerativeAIEmbeddings') as MockEmbeddings, \
         patch('main.model') as mock_model:
        
        # Setup mocks
        mock_extract.side_effect = ["Content of PDF 1", "Content of PDF 2"]
        MockEmbeddings.return_value = FakeEmbeddings()
        mock_response = MagicMock()
        mock_response.text = "Answer"
        mock_model.generate_content.return_value = mock_response

        # 1. Upload first PDF
        print("1. Uploading PDF 1...")
        files1 = {'file': ('test1.pdf', b'pdf1 content', 'application/pdf')}
        resp1 = client.post("/upload", files=files1)
        assert resp1.status_code == 200, f"Upload 1 failed: {resp1.text}"
        data1 = resp1.json()
        session_id = data1.get("session_id")
        print(f"   Success. Session ID: {session_id}")
        assert "indexed successfully" in data1["message"] or "new session" in data1["message"]

        # Verify session store has 1 item (logic depends on chunking, likely 1 chunk for short text)
        print(f"   Session store keys: {list(session_store.keys())}")
        assert session_id in session_store

        # 2. Upload second PDF with SAME session_id
        print("2. Uploading PDF 2 with same session_id...")
        files2 = {'file': ('test2.pdf', b'pdf2 content', 'application/pdf')}
        # session_id passed as form data
        resp2 = client.post("/upload", files=files2, data={"session_id": session_id})
        assert resp2.status_code == 200, f"Upload 2 failed: {resp2.text}"
        data2 = resp2.json()
        print(f"   Response: {data2}")
        
        # Checks
        assert data2.get("session_id") == session_id, "Session ID should remain the same"
        assert "added to existing session" in data2["message"], "Message should indicate appending"
        
        print("Test passed! Incremental ingestion verified.")

if __name__ == "__main__":
    test_incremental_ingestion()
