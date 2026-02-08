import io
from pypdf import PdfReader

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extracts text from a PDF file content (bytes).
    """
    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""
