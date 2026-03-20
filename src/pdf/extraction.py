import os
import json
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from google import genai  # <--- NEW SDK
from google.genai import types

app = FastAPI(title="Universal Insurance Extractor")

# Initialize the new Client
# Note: Ensure your API Key is set as an environment variable: GEMINI_API_KEY
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Universal extraction logic prompt
SYSTEM_PROMPT = """
Extract motor insurance data into a strict JSON format. 
Use this logic for Indian policies:
1. Divide Premium into Own Damage (OD), Liability (TP), and GST.
2. Identify IDV (Sum Insured).
3. Extract Vehicle Specs (Make, Model, CC, Year).

JSON Schema:
{
  "policy_details": {"no": str, "expiry": str},
  "vehicle": {"reg_no": str, "make": str, "model": str, "year": int, "idv": float},
  "premium": {"od": float, "tp": float, "gst": float, "total": float}
}
"""

@app.post("/extract")
async def extract_data(file: UploadFile = File(...)):
    # Basic file validation
    if file.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Invalid file type.")

    try:
        content_bytes = await file.read()
        
        # New SDK Syntax: client.models.generate_content
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                SYSTEM_PROMPT,
                types.Part.from_bytes(data=content_bytes, mime_type=file.content_type)
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        return json.loads(response.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
