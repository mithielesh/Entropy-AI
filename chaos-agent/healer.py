import os
from google import genai
import json
import time

# CONFIGURATION
API_KEY = os.environ.get("GEMINI_API_KEY")
CLIENT = genai.Client(api_key=API_KEY)
TARGET_FILE = "/target-code/src/main/java/com/entropy/victim/VulnerableController.java"
PLAN_FILE = "attack_plan.json"

def read_file(path):
    with open(path, "r") as f:
        return f.read()

def write_file(path, content):
    with open(path, "w") as f:
        f.write(content)

def heal_code():
    print("STARTING HEALING PROTOCOL...")
    
    if not os.path.exists(PLAN_FILE):
        print("No attack plan found. Nothing to fix.")
        return

    # 1. Load the Context
    java_code = read_file(TARGET_FILE)
    attack_plan = read_file(PLAN_FILE)

    print("Sending Code + Vulnerabilities to Gemini 3...")

    # 2. The "Senior Engineer" Prompt
    prompt = f"""
    You are a Lead Software Architect.
    I have a Java Spring Boot file that has specific vulnerabilities detected by our Red Team.
    
    VULNERABILITY REPORT:
    {attack_plan}
    
    SOURCE CODE:
    {java_code}
    
    TASK:
    Rewrite the ENTIRE 'VulnerableController.java' file to fix all 3 detected issues.
    1. Fix the Memory Leak (Use a limited collection or remove the log).
    2. Fix the Race Condition (Use AtomicInteger or synchronized blocks).
    3. Fix the DoS/CPU issue (Add input validation for 'iterations').
    
    OUTPUT:
    Return ONLY the Java code. No markdown formatting, no explanations. 
    Just the raw code ready to compile.
    """

    # 3. Call Gemini (Using Flash for speed)
    response = CLIENT.models.generate_content(
        model='gemini-3-flash-preview',
        contents=prompt
    )
    
    # 4. Clean the output (Remove ```java if Gemini adds it)
    fixed_code = response.text.replace("```java", "").replace("```", "").strip()

    # 5. Apply the Patch
    print("Patch received. Applying to file system...")
    write_file(TARGET_FILE, fixed_code)
    
    print("FILE PATCHED SUCCESSFULLY!")
    print("The Victim App needs to be restarted to load the new byte-code.")

if __name__ == "__main__":
    heal_code()