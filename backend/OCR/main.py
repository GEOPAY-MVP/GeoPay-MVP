from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import cv2
import pytesseract
import re
import json
import tempfile
import shutil
import os
import numpy as np
app = FastAPI(title="CNIC OCR Extractor")

def extract_cnic_data(image_path: str):
    # 1. --- Image Preprocessing (No changes needed) ---
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Image not found at: {image_path}")

    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    # 2. --- OCR Extraction (No changes needed) ---
    config = "--psm 6"
    raw_text = pytesseract.image_to_string(thresh, lang="eng", config=config)

    print("--- Raw Extracted Text ---")
    print(raw_text)
    print("--------------------------")

    # 3. --- Hybrid Extraction Logic ---
    data = {
        "Name": "Not found",
        "Father Name": "Not found",
        "Gender": "Not found",
        "CNIC": "Not found",
        "Date of Birth": "Not found",
        "Date of Issue": "Not found",
        "Date of Expiry": "Not found",
    }

    # --- Strategy 1 & 2 (Unchanged) ---
    clean_full_text = raw_text.replace('\n', ' ').replace('l', '1').replace('o', '0').replace('S', '5')
    cnic_pattern = r'\b(\d{5}[- ]?\d{7}[- ]?\d)\b'
    date_pattern = r'\b(\d{2}[./-]\d{2}[./-]\d{4})\b'

    cnic_match = re.search(cnic_pattern, clean_full_text)
    if cnic_match:
        # Clean the found CNIC number
        data["CNIC"] = cnic_match.group(0).replace(" ", "").replace("-", "")

    all_dates = re.findall(date_pattern, clean_full_text)
    if len(all_dates) >= 3:
        data["Date of Birth"], data["Date of Issue"], data["Date of Expiry"] = all_dates[0], all_dates[1], all_dates[2]
    
    if data["CNIC"] != "Not found":
        last_digit = int(data["CNIC"][-1])
        data["Gender"] = "F" if last_digit % 2 == 0 else "M"

    # --- Strategy 3: Positional Logic for Names (Revised) ---
    lines = raw_text.split('\n')
    lines = [line.strip() for line in lines if line.strip()]

    name_pattern = r'([A-Z][a-zA-Z]+(?:[ \.]+[A-Z][a-zA-Z]+)+)'
    
    name_found_at_index = -1

    # First Pass: Find the cardholder's name
    for i, line in enumerate(lines):
        if re.search(r'\bName\b', line, re.IGNORECASE) and not re.search(r'Father', line, re.IGNORECASE):
            if i + 1 < len(lines):
                name_match = re.search(name_pattern, lines[i+1])
                if name_match:
                    data["Name"] = name_match.group(1).strip()
                    name_found_at_index = i + 1
                    break 

    # --- THIS SECTION IS REVISED ---
    # Second Pass: Find Father's Name, excluding the keyword line itself
    if name_found_at_index != -1:
        for i in range(name_found_at_index + 1, len(lines)):
            line_to_check = lines[i]
            
            # Check if the line itself is the keyword label
            is_keyword_line = re.search(r'^\s*Father Name', line_to_check, re.IGNORECASE)
            
            # Check if the line contains a valid name
            father_name_match = re.search(name_pattern, line_to_check)
            
            # A valid Father's Name matches the pattern AND is NOT the keyword line.
            if father_name_match and not is_keyword_line:
                data["Father Name"] = father_name_match.group(1).strip()
                break # Stop searching once found

    return data

# ---------- API Endpoint ----------
@app.post("/extract-cnic/")
async def extract_cnic(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name

        # Extract CNIC Data
        data = extract_cnic_data(temp_path)

        # Save JSON
        output_path = os.path.join(os.getcwd(), "cnic_data.json")
        with open(output_path, "w") as f:
            json.dump(data, f, indent=4)

        return JSONResponse(content={"success": True, "data": data})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        file.file.close()
        if os.path.exists(temp_path):
            os.remove(temp_path)
