"""
Procesadores Multimodales
Maneja imagen, PDF, audio
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import io
from PIL import Image
import pytesseract
from PyPDF2 import PdfReader
import pdfplumber
from loguru import logger

from app.config import settings


class MultimodalProcessor(ABC):
    """Clase base para procesadores multimodales"""
    
    @abstractmethod
    async def process(self, data: bytes, **kwargs) -> Dict[str, Any]:
        """Procesa el contenido y retorna datos estructurados"""
        pass


class ImageProcessor(MultimodalProcessor):
    """
    Procesador de imágenes con OCR.
    Extrae texto de imágenes usando Tesseract.
    """
    
    def __init__(self):
        # Configurar Tesseract
        if settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    
    async def process(self, data: bytes, **kwargs) -> Dict[str, Any]:
        """
        Procesa una imagen y extrae texto (OCR).
        
        Args:
            data: Bytes de la imagen
            
        Returns:
            {
                "type": "image",
                "text": "texto extraído",
                "width": int,
                "height": int,
                "format": "JPEG|PNG|...",
                "confidence": float (opcional)
            }
        """
        try:
            # Abrir imagen
            image = Image.open(io.BytesIO(data))
            
            # Metadatos de la imagen
            width, height = image.size
            image_format = image.format
            
            logger.info(f" Procesando imagen: {width}x{height}, formato={image_format}")
            
            # Extraer texto con OCR
            text = ""
            if settings.OCR_ENGINE == "tesseract":
                text = pytesseract.image_to_string(image, lang='spa+eng')
            # elif settings.OCR_ENGINE == "google_vision":
            #     text = await self._ocr_google_vision(data)
            
            result = {
                "type": "image",
                "text": text.strip(),
                "width": width,
                "height": height,
                "format": image_format,
                "has_text": bool(text.strip())
            }
            
            logger.info(f"[SUCCESS]  OCR completado: {len(text)} caracteres extraídos")
            
            return result
            
        except Exception as e:
            logger.error(f"Error procesando imagen: {e}")
            raise Exception(f"Error en OCR: {str(e)}")
    
    # async def _ocr_google_vision(self, image_data: bytes) -> str:
    #     """OCR usando Google Cloud Vision API (opcional)"""
    #     from google.cloud import vision
    #     
    #     client = vision.ImageAnnotatorClient()
    #     image = vision.Image(content=image_data)
    #     response = client.text_detection(image=image)
    #     texts = response.text_annotations
    #     
    #     if texts:
    #         return texts[0].description
    #     return ""


class PDFProcessor(MultimodalProcessor):
    """
    Procesador de PDFs.
    Extrae texto, tablas y metadatos.
    """
    
    async def process(self, data: bytes, **kwargs) -> Dict[str, Any]:
        """
        Procesa un PDF y extrae contenido.
        
        Args:
            data: Bytes del PDF
            
        Returns:
            {
                "type": "pdf",
                "text": "texto completo",
                "pages": int,
                "tables": [...] (opcional),
                "metadata": {...}
            }
        """
        try:
            pdf_file = io.BytesIO(data)
            
            # Usar PyPDF2 para texto básico y metadata
            pdf_reader = PdfReader(pdf_file)
            num_pages = len(pdf_reader.pages)
            
            # Metadatos
            metadata = pdf_reader.metadata
            meta_dict = {
                "title": metadata.get("/Title", ""),
                "author": metadata.get("/Author", ""),
                "subject": metadata.get("/Subject", ""),
                "creator": metadata.get("/Creator", "")
            } if metadata else {}
            
            logger.info(f"[DOC]  Procesando PDF: {num_pages} páginas")
            
            # Extraer texto de todas las páginas
            text_content = []
            for page_num, page in enumerate(pdf_reader.pages, 1):
                text = page.extract_text()
                if text:
                    text_content.append(f"--- Página {page_num} ---\n{text}")
            
            full_text = "\n\n".join(text_content)
            
            result = {
                "type": "pdf",
                "text": full_text.strip(),
                "pages": num_pages,
                "metadata": meta_dict,
                "total_characters": len(full_text)
            }
            
            # Opcional: Extraer tablas con pdfplumber (más pesado)
            if kwargs.get("extract_tables", False):
                result["tables"] = await self._extract_tables(data)
            
            logger.info(f"[SUCCESS]  PDF procesado: {num_pages} páginas, {len(full_text)} caracteres")
            
            return result
            
        except Exception as e:
            logger.error(f"Error procesando PDF: {e}")
            raise Exception(f"Error en PDF: {str(e)}")
    
    async def _extract_tables(self, data: bytes) -> list:
        """Extrae tablas del PDF usando pdfplumber"""
        tables = []
        
        try:
            pdf_file = io.BytesIO(data)
            with pdfplumber.open(pdf_file) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    page_tables = page.extract_tables()
                    if page_tables:
                        for table in page_tables:
                            tables.append({
                                "page": page_num,
                                "rows": table
                            })
        except Exception as e:
            logger.warning(f"Error extrayendo tablas: {e}")
        
        return tables


class AudioProcessor(MultimodalProcessor):
    """
    Procesador de audio (BONUS).
    Transcribe audio a texto.
    """
    
    async def process(self, data: bytes, **kwargs) -> Dict[str, Any]:
        """
        Transcribe audio a texto.
        
        NOTA: Requiere Whisper de OpenAI o alternativa.
        Por ahora retorna placeholder.
        """
        # TODO: Implementar con OpenAI Whisper o Speech Recognition
        logger.warning("[WARN]   Audio processing no implementado aún")
        
        return {
            "type": "audio",
            "text": "[Transcripción de audio no disponible]",
            "duration_seconds": 0,
            "error": "Audio processing no implementado"
        }


class MultimodalProcessorFactory:
    """Factory para crear procesadores según tipo de archivo"""
    
    @staticmethod
    def get_processor(content_type: str) -> Optional[MultimodalProcessor]:
        """
        Retorna el procesador según content type.
        
        Args:
            content_type: "image/jpeg", "application/pdf", etc.
            
        Returns:
            MultimodalProcessor o None
        """
        if content_type.startswith("image/"):
            return ImageProcessor()
        elif content_type == "application/pdf":
            return PDFProcessor()
        elif content_type.startswith("audio/"):
            return AudioProcessor()
        else:
            logger.warning(f"[WARN]   Tipo de archivo no soportado: {content_type}")
            return None
    
    @staticmethod
    def is_supported(content_type: str) -> bool:
        """Verifica si el tipo de archivo es soportado"""
        supported = [
            "image/jpeg", "image/jpg", "image/png", "image/webp",
            "application/pdf",
            # "audio/mpeg", "audio/wav", "audio/ogg"  # BONUS
        ]
        return content_type in supported or content_type.startswith("image/")
