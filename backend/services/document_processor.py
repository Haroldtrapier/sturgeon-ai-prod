"""
Document Upload Processing Service
Extract text from PDFs, DOCX, and images
"""
import os
import io
import uuid
from typing import Dict, Any, Optional
from pathlib import Path
import mimetypes

# PDF processing
try:
    import PyPDF2
    HAS_PDF = True
except ImportError:
    HAS_PDF = False

# DOCX processing
try:
    from docx import Document as DocxDocument
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

# OCR for images
try:
    from PIL import Image
    import pytesseract
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

from models.proposal import DocumentUpload
from database import SessionLocal


class DocumentProcessor:
    """Process uploaded documents and extract text"""
    
    SUPPORTED_TYPES = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/msword': 'doc',
        'image/png': 'image',
        'image/jpeg': 'image',
        'text/plain': 'text',
    }
    
    def __init__(self, storage_path: str = "/tmp/uploads"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
    
    def process_upload(
        self,
        file_data: bytes,
        filename: str,
        user_id: str,
        proposal_id: Optional[str] = None,
        db_session = None
    ) -> Dict[str, Any]:
        """
        Process an uploaded file and extract text
        
        Returns:
            Dictionary with processing results
        """
        # Determine file type
        mime_type, _ = mimetypes.guess_type(filename)
        file_type = self.SUPPORTED_TYPES.get(mime_type, 'unknown')
        
        if file_type == 'unknown':
            return {
                "success": False,
                "error": f"Unsupported file type: {mime_type}",
                "supported_types": list(self.SUPPORTED_TYPES.keys())
            }
        
        # Generate storage path
        file_id = str(uuid.uuid4())
        file_ext = Path(filename).suffix
        storage_filename = f"{file_id}{file_ext}"
        storage_full_path = self.storage_path / storage_filename
        
        # Save file
        with open(storage_full_path, 'wb') as f:
            f.write(file_data)
        
        # Extract text based on file type
        extracted_text = ""
        processing_error = None
        
        try:
            if file_type == 'pdf':
                extracted_text = self._extract_pdf(file_data)
            elif file_type == 'docx':
                extracted_text = self._extract_docx(file_data)
            elif file_type == 'image':
                extracted_text = self._extract_image_ocr(file_data)
            elif file_type == 'text':
                extracted_text = file_data.decode('utf-8', errors='ignore')
            
        except Exception as e:
            processing_error = str(e)
            print(f"[DocumentProcessor] Error extracting text: {e}")
        
        # Create database record
        should_close = db_session is None
        if db_session is None:
            db_session = SessionLocal()
        
        try:
            doc_upload = DocumentUpload(
                id=file_id,
                proposal_id=proposal_id,
                user_id=user_id,
                filename=filename,
                file_type=file_type,
                file_size=len(file_data),
                storage_path=str(storage_full_path),
                is_processed=processing_error is None,
                extracted_text=extracted_text if extracted_text else None,
                processing_error=processing_error
            )
            
            db_session.add(doc_upload)
            db_session.commit()
            db_session.refresh(doc_upload)
            
            return {
                "success": True,
                "document_id": doc_upload.id,
                "filename": filename,
                "file_type": file_type,
                "file_size": len(file_data),
                "text_length": len(extracted_text) if extracted_text else 0,
                "extracted_text": extracted_text[:1000] if extracted_text else None,  # First 1000 chars
                "storage_path": str(storage_full_path)
            }
            
        finally:
            if should_close:
                db_session.close()
    
    def _extract_pdf(self, file_data: bytes) -> str:
        """Extract text from PDF"""
        if not HAS_PDF:
            raise Exception("PyPDF2 not installed. Run: pip install PyPDF2")
        
        text_parts = []
        pdf_file = io.BytesIO(file_data)
        
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page in pdf_reader.pages:
                text_parts.append(page.extract_text())
        except Exception as e:
            raise Exception(f"PDF extraction failed: {e}")
        
        return "\n\n".join(text_parts)
    
    def _extract_docx(self, file_data: bytes) -> str:
        """Extract text from DOCX"""
        if not HAS_DOCX:
            raise Exception("python-docx not installed. Run: pip install python-docx")
        
        docx_file = io.BytesIO(file_data)
        
        try:
            document = DocxDocument(docx_file)
            text_parts = [para.text for para in document.paragraphs]
            return "\n".join(text_parts)
        except Exception as e:
            raise Exception(f"DOCX extraction failed: {e}")
    
    def _extract_image_ocr(self, file_data: bytes) -> str:
        """Extract text from image using OCR"""
        if not HAS_OCR:
            raise Exception("OCR libraries not installed. Run: pip install Pillow pytesseract")
        
        try:
            image = Image.open(io.BytesIO(file_data))
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            raise Exception(f"OCR extraction failed: {e}")
    
    def get_document(self, document_id: str, db_session = None) -> Optional[DocumentUpload]:
        """Retrieve document from database"""
        should_close = db_session is None
        if db_session is None:
            db_session = SessionLocal()
        
        try:
            doc = db_session.query(DocumentUpload).filter(
                DocumentUpload.id == document_id
            ).first()
            return doc
        finally:
            if should_close:
                db_session.close()
    
    def list_documents(
        self,
        user_id: Optional[str] = None,
        proposal_id: Optional[str] = None,
        db_session = None
    ) -> list:
        """List uploaded documents"""
        should_close = db_session is None
        if db_session is None:
            db_session = SessionLocal()
        
        try:
            query = db_session.query(DocumentUpload)
            
            if user_id:
                query = query.filter(DocumentUpload.user_id == user_id)
            if proposal_id:
                query = query.filter(DocumentUpload.proposal_id == proposal_id)
            
            return query.order_by(DocumentUpload.created_at.desc()).all()
        finally:
            if should_close:
                db_session.close()


# Global instance
document_processor = DocumentProcessor()
