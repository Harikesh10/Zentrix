
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

def test_chat_history_flow():
    with patch('main.extract_text_from_pdf') as mock_extract, \
         patch('main.GoogleGenerativeAIEmbeddings') as MockEmbeddings, \
         patch('main.model') as mock_model:
        
        # Setup mocks
        mock_extract.return_value = "This PDF talks about Newton's Laws only."
        # We need the global embeddings to be our fake one
        # But global var is restricted. We can mock the class instantiation in main.py
        # Since it's already instantiated, we might need to rely on the fact that existing logic uses 'embeddings'
        # Ideally we patch the method calls on 'model'.
        
        mock_resp1 = MagicMock()
        mock_resp1.text = "The answer is not present. Would you like external knowledge?"
        
        mock_resp2 = MagicMock()
        mock_resp2.text = "External Knowledge Answer: The capital of France is Paris."
        
        mock_model.generate_content.side_effect = [mock_resp1, mock_resp2]

        print("1. Uploading PDF...")
        files = {'file': ('test.pdf', b'content', 'application/pdf')}
        resp = client.post("/upload", files=files)
        session_id = resp.json().get("session_id")
        print(f"   Session ID: {session_id}")

        # 2. Ask Out of Context Question
        print("2. Asking out of context Question...")
        q1 = "What is the capital of France?"
        resp_chat1 = client.post("/chat", json={"session_id": session_id, "message": q1})
        ans1 = resp_chat1.json()["answer"]
        print(f"   Bot: {ans1}")
        assert "not present" in ans1 or "external knowledge" in ans1

        # Check history
        hist = session_store[session_id]['history']
        assert len(hist) == 2
        assert hist[0]['content'] == q1
        
        # 3. Give Permission
        print("3. Giving permission...")
        q2 = "Yes, please."
        resp_chat2 = client.post("/chat", json={"session_id": session_id, "message": q2})
        ans2 = resp_chat2.json()["answer"]
        print(f"   Bot: {ans2}")
        
        # In a real scenario, the LLM would see q1 in history and answer it. 
        # Here we mocked the response, but we verify that the code didn't crash and history is updated.
        hist = session_store[session_id]['history']
        assert len(hist) == 4
        assert hist[2]['content'] == q2
        assert hist[3]['content'] == ans2
        
        print("Test passed! History is being maintained.")

if __name__ == "__main__":
    test_chat_history_flow()
