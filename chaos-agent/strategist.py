import os
from google import genai
import json
import glob

# 1. SETUP: Get the key
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found! Check your .env or docker-compose.yml")
    exit(1)

# Initialize the Client
client = genai.Client(api_key=api_key)

# The base directory where the victim code is mounted
TARGET_DIR = "/target-code"

def analyze_code():
    print("Executing strategist.py inside agent_container...")

    # 2. AUTO-DISCOVERY: Find the target Java file
    # First, try to find a Controller (usually where the endpoints are)
    print(f"Scanning {TARGET_DIR} for Java files...")
    search_pattern = f"{TARGET_DIR}/**/*Controller.java"
    found_files = glob.glob(search_pattern, recursive=True)
    
    # Fallback: If no Controller found, grab any Java file
    if not found_files:
        found_files = glob.glob(f"{TARGET_DIR}/**/*.java", recursive=True)
        
    if not found_files:
        print(f"Error: No Java source files found in {TARGET_DIR}!")
        return

    # Pick the first one found (For this demo, we assume a single-file vulnerability)
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

    # 4. THE PROMPT (Updated for Level 5 UI)
    prompt = f"""
    You are a Senior Security Architect and Educator. 
    Analyze the following Java Spring Boot code for security vulnerabilities.
    
    SOURCE CODE:
    {code_content}
    
    OUTPUT FORMAT:
    Return a STRICT JSON ARRAY containing objects. Do not use Markdown formatting (no ```json).
    Each object must have these fields:
    
    1. "name": A creative, memorable name for the attack (e.g., "The Double-Spend Mirage").
    2. "type": The technical vulnerability category (e.g., "Race Condition", "Memory Leak", "DoS").
    3. "severity": "High" or "Critical".
    4. "thought_signature": A 2-sentence explanation suitable for a computer science student. Explain WHY it breaks.
    5. "trigger_endpoint": The relative URL path (e.g., "/api/buy"). Do NOT include HTTP verbs.
    6. "diagram_code": A Mermaid.js SEQUENCE DIAGRAM string that visually explains the flow of the attack.
       - Use 'sequenceDiagram'
       - Use simple participants like 'Attacker', 'API', 'Database' or 'System'.
       - Example: "sequenceDiagram\\nAttacker->>API: Spams requests\\nAPI->>Memory: Adds to List...\\nMemory-->>API: OutOfMemoryError"
    7. "fix_explanation": A single "Pro Tip" sentence explaining the architectural fix (e.g., "Use AtomicInteger to ensure thread-safety during concurrent writes.").
    """

    try:
        # 5. EXECUTE: Call Gemini
        # using gemini-1.5-flash for speed
        response = client.models.generate_content(
            model='gemini-1.5-flash', 
            contents=prompt
        )

        print("\n--------- GEMINI ATTACK PLAN ---------")
        print(response.text)
        
        # 6. CLEANUP & SAVE
        # Robust cleaning to handle if Gemini adds markdown backticks
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        
        with open("attack_plan.json", "w") as f:
            f.write(clean_json)
            
        print("Strategy saved to attack_plan.json")

    except Exception as e:
        print(f"\nError calling Gemini: {e}")

if __name__ == "__main__":
    analyze_code()