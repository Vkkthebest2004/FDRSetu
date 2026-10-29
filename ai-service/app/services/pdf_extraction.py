import fitz  # PyMuPDF
import io
from typing import Tuple, List
from PIL import Image

class PDFExtractor:
    """
    Extracts digital text and page rasterizations from PDF documents using PyMuPDF.
    """

    @staticmethod
    def extract_text_and_images(pdf_bytes: bytes) -> Tuple[str, List[Image.Image]]:
        """
        Extracts digital text. If digital text is minimal (e.g. scanned document),
        renders page images at high resolution (300 DPI) for OCR.
        """
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = []
        page_images = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            if text and text.strip():
                full_text.append(text.strip())

            # Always render the first 3 pages as high-res images for OCR cross-verification
            if page_num < 3:
                # 300 DPI = matrix scale of 300/72 ≈ 4.166
                mat = fitz.Matrix(3.0, 3.0)
                pix = page.get_pixmap(matrix=mat)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                page_images.append(img)

        doc.close()
        combined_text = "\n\n".join(full_text)
        return combined_text, page_images

