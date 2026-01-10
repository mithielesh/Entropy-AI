from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional # Added for optional fields
import subprocess
import asyncio
import json
import os
import shutil
import stat

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# UPDATED REQUEST MODEL
class DeployRequest(BaseModel):
    repo_url: str
    user_id: Optional[str] = None  # If None -> Lightning Mode

STATE = {
    "status": "IDLE", 
    "phase": "READY", 
    "logs": [],
    "vulnerabilities": [], 
    "telemetry": {"cpu": 10, "memory": 20},
    "current_repo": "Local Default",
    "mode": "LIGHTNING" # Track current mode
}

def log(message):
    print(message)
    STATE["logs"].append(message)

def remove_readonly(func, path, exc):
    os.chmod(path, stat.S_IWRITE)
    func(path)

def setup_target_repo(repo_url: str):
    target_dir = "victim-app"
    # ... (Keep your existing setup_target_repo logic exactly as is) ...
    # For brevity in this snippet, assume standard cloning logic here
    # Use your original function code!
    log("Stopping container to release file locks...")
    subprocess.run(["docker", "stop", "victim_container"], stderr=subprocess.DEVNULL)
    
    log(f"Cleaning up previous target in {target_dir}...")
    if os.path.exists(target_dir):
        try:
            shutil.rmtree(target_dir, onexc=remove_readonly)
        except Exception as e:
            log(f"Warning: Could not fully clean folder: {e}")
            return False

    log(f"⬇ Cloning {repo_url}...")
    try:
        subprocess.run(["git", "clone", "--depth", "1", repo_url, target_dir], check=True)
    except subprocess.CalledProcessError:
        log("Git Clone Failed. Is the URL correct?")
        return False

    if not os.path.exists(f"{target_dir}/Dockerfile"):
        log("No Dockerfile found. Injecting 'Universal Spring Boot' template...")
        dockerfile_content = """
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY . .
RUN if [ -f "./mvnw" ]; then ./mvnw clean package -DskipTests; else apk add maven && mvn clean package -DskipTests; fi
CMD java -jar target/*.jar
        """
        with open(f"{target_dir}/Dockerfile", "w") as f:
            f.write(dockerfile_content)

    return True

async def mission_loop(repo_url: str, user_id: str = None):
    STATE["logs"] = []
    STATE["vulnerabilities"] = []
    STATE["status"] = "RUNNING"
    STATE["current_repo"] = repo_url
    
    # DETERMINE MODE
    mode = "DASHBOARD" if user_id else "LIGHTNING"
    STATE["mode"] = mode
    log(f"🚀 INITIALIZING ENTROPY AGENT in [{mode} MODE]...")

    # STEP 1: SETUP (Common to both)
    STATE["phase"] = "SETUP"
    success = setup_target_repo(repo_url)
    if not success:
        STATE["status"] = "FAILED"
        log("Setup failed. Aborting mission.")
        return

    log("Rebuilding Victim Container...")
    subprocess.run(["docker-compose", "up", "-d", "--build", "--force-recreate", "victim-app"])
    
    log("Waiting for Victim App to boot (45s)...") 
    await asyncio.sleep(45)

    # STEP 2: STRATEGY (Common to both)
    STATE["phase"] = "STRATEGY"
    log("AI Agent scanning repository structure...")
    
    # Pass user_id env var if it exists (Strategist uses this to decide on DB upload)
    env_vars = ["-e", f"USER_ID={user_id}"] if user_id else []
    
    subprocess.run(["docker", "exec", "-i"] + env_vars + ["agent_container", "python", "strategist.py"])
    
    # Load results for display
    try:
        if os.path.exists("chaos-agent/attack_plan.json"):
            with open("chaos-agent/attack_plan.json", "r") as f:
                STATE["vulnerabilities"] = json.load(f)
                log(f"Analysis Complete. Detected {len(STATE['vulnerabilities'])} issues.")
    except Exception as e:
        log(f"Error reading report: {e}")

    # STEP 3: ATTACK (Common to both)
    STATE["phase"] = "ATTACK"
    log("Launching Exploits...")
    proc = subprocess.Popen(
        ["docker", "exec", "-i", "agent_container", "python", "attacker.py"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )
    while True:
        line = proc.stdout.readline()
        if not line: break
        if line.strip(): log(line.strip())

    # --- BRANCHING POINT ---
    if mode == "LIGHTNING":
        STATE["status"] = "COMPLETE"
        STATE["phase"] = "COMPLETE"
        log("⚡ LIGHTNING RUN COMPLETE.")
        log("Sign up to enable Auto-Healing and Persistent Reports.")
        return

    # STEP 4: HEAL (Dashboard Only)
    STATE["phase"] = "HEAL"
    log("Applying Autonomous Patches (GenAI)...")
    subprocess.run(["docker", "exec", "-i", "agent_container", "python", "healer.py"])
    
    log("Restarting Victim to apply fixes...")
    subprocess.run(["docker", "restart", "victim_container"])
    await asyncio.sleep(15)

    # STEP 5: VERIFY (Dashboard Only)
    STATE["phase"] = "VERIFY"
    log("Verifying security posture...")
    subprocess.run(["docker", "exec", "-i", "agent_container", "python", "attacker.py"])

    STATE["status"] = "SECURE"
    STATE["phase"] = "COMPLETE"
    log("MISSION COMPLETE. System secured and report logged.")

@app.get("/status")
def get_status():
    # ... (Keep your existing telemetry logic) ...
    return STATE

@app.post("/deploy")
def deploy_agent(request: DeployRequest, background_tasks: BackgroundTasks):
    if STATE["status"] != "RUNNING":
        # Pass the user_id (can be None) to the loop
        background_tasks.add_task(mission_loop, request.repo_url, request.user_id)
        return {"message": "Deployed"}
    return {"message": "Busy"}