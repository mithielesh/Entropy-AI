import os
import json
import glob
import requests
from dotenv import load_dotenv
from google import genai
from json import JSONDecodeError

# 1. SETUP: Load Environment Variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
user_id = os.getenv("USER_ID") 
dashboard_url = os.getenv("DASHBOARD_API_URL", "http://localhost:3000/api/upload")

if not api_key:
    print("[ERROR] GEMINI_API_KEY not found! Check your .env file or environment variables.")
    exit(1)

# Initialize Client
client = genai.Client(api_key=api_key)

# Configuration
TARGET_DIR = "../victim-app" 

def analyze_code():
    print("[INFO] Executing Strategist: Scanning for vulnerabilities...")

    # 2. AUTO-DISCOVERY
    # Priority: Find Controllers first (high value targets), then fallback to any Java file
    search_pattern = f"{TARGET_DIR}/**/*Controller.java"
    found_files = glob.glob(search_pattern, recursive=True)
    
    if not found_files:
        found_files = glob.glob(f"{TARGET_DIR}/**/*.java", recursive=True)
        
    if not found_files:
        print(f"[ERROR] No Java source files found in {TARGET_DIR}!")
        return

    target_file = found_files[0]
    # Use the parent folder name as the project name (e.g., "Payment_Gateway" instead of "PaymentController.java")
    project_name = os.path.basename(os.path.dirname(target_file))
    print(f"[INFO] Target Acquired: {target_file}")
    print(f"[INFO] Project Name Detected: {project_name}")

    # 3. READ FILE
    try:
        with open(target_file, "r") as f:
            code_content = f.read()
        print(f"[INFO] Read {len(code_content)} bytes of code.")
    except Exception as e:
        print(f"[ERROR] Failed to read file: {e}")
        return

    print("[INFO] Sending code to Gemini for strategic analysis...")

    # 4. THE PROMPT
    prompt = f"""
    You are a Senior Security Architect. Analyze this Java Spring Boot code.
    
    SOURCE CODE:
    {code_content}
    
    OUTPUT FORMAT:
    Return a STRICT JSON ARRAY containing objects. Do not use Markdown formatting.
    Each object must have:
    1. "name": Creative attack name.
    2. "type": Vulnerability type.
    3. "severity": "High" or "Critical".
    4. "thought_signature": 2-sentence explanation.
    5. "trigger_endpoint": Relative URL path.
    6. "diagram_code": Mermaid.js sequence diagram string.
    7. "fix_explanation": Single sentence fix.
    """

    try:
        # 5. EXECUTE GEMINI
        # Note: Using 'gemini-1.5-flash' as it is the current standard. 
        # If you have access to 'gemini-3-flash-preview', you can change it back.
        response = client.models.generate_content(
            model='gemini-3-flash-preview', 
            contents=prompt
        )

        # 6. CLEANUP & PARSE
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        
        try:
            analysis_results = json.loads(clean_json)
        except JSONDecodeError:
            print("[ERROR] Gemini returned invalid JSON. Saving raw response for debug.")
            with open("debug_response.txt", "w") as f:
                f.write(clean_json)
            return None

        # Always save locally (Lightning Mode / Backup)
        with open("attack_plan.json", "w") as f:
            json.dump(analysis_results, f, indent=2)
        print("[SUCCESS] Local backup 'attack_plan.json' saved.")

        # 7. DUAL-TRACK STORAGE LOGIC
        if user_id:
            print(f"[INFO] Authenticated User detected ({user_id}). Syncing to Cloud DB...")
            
            payload = {
                "userId": user_id,
                "projectName": project_name,
                "cards": analysis_results
            }
            
            try:
                res = requests.post(dashboard_url, json=payload, timeout=10)
                if res.status_code == 201:
                    print("[SUCCESS] Analysis successfully uploaded to Dashboard Database.")
                else:
                    print(f"[ERROR] Upload failed with Status {res.status_code}: {res.text}")
            except requests.exceptions.ConnectionError:
                print(f"[ERROR] Connection Failed. Could not reach {dashboard_url}. Is the Next.js server running?")
            except Exception as net_err:
                print(f"[ERROR] Network error during upload: {net_err}")
        else:
            print("[INFO] Lightning Mode: Guest user detected. Skipping Database upload.")

        return analysis_results

    except Exception as e:
        print(f"[ERROR] Analysis pipeline failed: {e}")
        return None

if __name__ == "__main__":
    analyze_code()