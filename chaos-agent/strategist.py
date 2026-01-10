import os
import json
import glob
import requests
from dotenv import load_dotenv
from google import genai

# 1. SETUP: Load Environment Variables
# Load from .env file for local development
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
user_id = os.getenv("USER_ID") # Needed to link analysis to your account

if not api_key:
    print("Error: GEMINI_API_KEY not found! Check your .env or environment variables.")
    exit(1)

# Initialize the Client
client = genai.Client(api_key=api_key)

# Configuration for Integration
TARGET_DIR = "/target-code"
# Use the internal Docker network name if running in container, or localhost for local testing
API_URL = os.getenv("DASHBOARD_API_URL", "http://localhost:3000/api/upload")

def analyze_code():
    print("Executing strategist.py inside agent_container...")

    # 2. AUTO-DISCOVERY: Find the target Java file
    print(f"Scanning {TARGET_DIR} for Java files...")
    search_pattern = f"{TARGET_DIR}/**/*Controller.java"
    found_files = glob.glob(search_pattern, recursive=True)
    
    if not found_files:
        found_files = glob.glob(f"{TARGET_DIR}/**/*.java", recursive=True)
        
    if not found_files:
        print(f"Error: No Java source files found in {TARGET_DIR}!")
        return

    target_file = found_files[0]
    print(f"Target Acquired: {target_file}")

    # 3. READ THE FILE
    try:
        with open(target_file, "r") as f:
            code_content = f.read()
        print(f"Successfully read {len(code_content)} bytes of Java code.")
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    print("Sending to Gemini for Strategic Analysis...")

    # 4. THE PROMPT
    prompt = f"""
    You are a Senior Security Architect and Educator. 
    Analyze the following Java Spring Boot code for security vulnerabilities.
    
    SOURCE CODE:
    {code_content}
    
    OUTPUT FORMAT:
    Return a STRICT JSON ARRAY containing objects. Do not use Markdown formatting (no ```json).
    Each object must have these fields:
    
    1. "name": A creative name for the attack.
    2. "type": The vulnerability category.
    3. "severity": "High" or "Critical".
    4. "thought_signature": A 2-sentence explanation of why it breaks.
    5. "trigger_endpoint": The relative URL path.
    6. "diagram_code": A Mermaid.js SEQUENCE DIAGRAM string.
    7. "fix_explanation": A single "Pro Tip" sentence explaining the fix.
    """

    try:
        # 5. EXECUTE: Call Gemini
        response = client.models.generate_content(
            model='gemini-3-flash-preview', 
            contents=prompt
        )

        # 6. CLEANUP & PARSE
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        analysis_results = json.loads(clean_json)

        # Save locally as backup
        with open("attack_plan.json", "w") as f:
            json.dump(analysis_results, f, indent=2)
            
        print("Strategy saved to attack_plan.json")

        # 7. INTEGRATION: Upload to Dashboard
        if user_id:
            payload = {
                "userId": user_id,
                "projectName": os.path.basename(target_file),
                "cards": analysis_results
            }
            print(f"Uploading analysis to {API_URL}...")
            try:
                res = requests.post(API_URL, json=payload, timeout=10)
                if res.status_code == 201:
                    print("Analysis successfully synced to Dashboard Database.")
                else:
                    print(f"Upload failed ({res.status_code}): {res.text}")
            except Exception as upload_err:
                print(f"Could not connect to Dashboard API: {upload_err}")
        else:
            print("ℹSkipping database upload: USER_ID not found in environment.")

        return analysis_results

    except Exception as e:
        print(f"\nError in analysis pipeline: {e}")
        return None

if __name__ == "__main__":
    analyze_code()