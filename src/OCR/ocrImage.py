import pytesseract
import cv2

img = cv2.imread('./image.png', cv2.IMREAD_GRAYSCALE)
pytesseract.pytesseract.tesseract_cmd = R'C:\Program Files\Tesseract-OCR\tesseract.exe'

print(pytesseract.image_to_string(img, lang='none'))