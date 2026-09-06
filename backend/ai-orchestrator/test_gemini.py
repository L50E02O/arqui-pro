import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key: {api_key[:20]}...")

genai.configure(api_key=api_key)

print("\n[LIST]  Modelos disponibles:")
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"  [SUCCESS]  {model.name}")
