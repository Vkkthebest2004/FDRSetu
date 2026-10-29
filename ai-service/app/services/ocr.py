import os
import cv2
import numpy as np
import pytesseract
from PIL import Image
from typing import Tuple, Dict
from app.core.config import settings

# Configure tesseract executable path if defined
if os.path.exists(settings.TESSERACT_CMD):
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

class OCREngine:
    """
    Applies image preprocessing via OpenCV and runs Tesseract OCR.
    """

    @staticmethod
    def preprocess_image(pil_img: Image.Image) -> np.ndarray:
        """
        Preprocesses document scans: converts to grayscale, removes salt-and-pepper noise,
        and applies Otsu adaptive binarization for clear text contrast.
        """
        # Convert PIL to CV2 BGR format
        img_np = np.array(pil_img.convert("RGB"))
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

        # Noise reduction using Gaussian Blur
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)

        # Otsu thresholding for high-contrast black/white binary text
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        return thresh

    @classmethod
    def extract_text_from_image(cls, pil_img: Image.Image) -> Tuple[str, float]:
        """
        Runs OCR on a PIL image and calculates the average word confidence score.
        """
        try:
            preprocessed = cls.preprocess_image(pil_img)

            # Get OCR text
            text = pytesseract.image_to_string(preprocessed, config="--psm 6")

            # Get word-level confidence data
            data = pytesseract.image_to_data(preprocessed, output_type=pytesseract.Output.DICT)
            confs = [float(c) for c in data.get("conf", []) if str(c).strip() not in ["", "-1"]]

            avg_conf = (sum(confs) / len(confs) / 100.0) if confs else 0.85
            return text.strip(), round(avg_conf, 2)
        except Exception as e:
            # Fallback if tesseract encounters an error
            return "", 0.0

