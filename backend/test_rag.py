
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os
from langchain.embeddings.base import Embeddings

# Add the directory to sys.path so we can import main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

class FakeEmbeddings(Embeddings):
    def embed_documents(self, texts):
        return [[0.1] * 768 for _ in texts]
    def embed_query(self, text):
        return [0.1] * 768

client = TestClient(app)

def test_rag_flow():
    with patch('main.extract_text_from_pdf') as mock_extract, \
         patch('main.GoogleGenerativeAIEmbeddings') as MockEmbeddings, \
         patch('main.model') as mock_model:
        
        mock_text = "Test text. "*100
        mock_extract.return_value = mock_text
        
        # Make the constructor return our fake embeddings instance
        MockEmbeddings.return_value = FakeEmbeddings()
        
        mock_response = MagicMock()
        mock_response.text = "Newton's second law is F=ma."
        mock_model.generate_content.return_value = mock_response

        # 1. Upload
        files = {'file': ('test.pdf', b'dummy content', 'application/pdf')}
        print("Uploading file...")
        try:
            response_upload = client.post("/upload", files=files)
        except Exception as e:
            print(f"Upload raised exception: {e}")
            raise

        if response_upload.status_code != 200:
            print(f"Upload failed: {response_upload.text}")
            return
            
        assert response_upload.status_code == 200
        data_upload = response_upload.json()
        session_id = data_upload.get("session_id")
        print(f"Upload successful. Session ID: {session_id}")
        
        # 2. Chat
        chat_request = {
            "session_id": session_id,
            "message": "What is Newton's second law?"
        }
        
        print("Sending chat request...")
        try:
            response_chat = client.post("/chat", json=chat_request)
        except Exception as e:
             print(f"Chat raised exception: {e}")
             raise
             
        if response_chat.status_code != 200:
             print(f"Chat failed: {response_chat.text}")
             return

        assert response_chat.status_code == 200
        data_chat = response_chat.json()
        print("Chat Response:", data_chat)
        print("Test passed!")

if __name__ == "__main__":
    test_rag_flow()
