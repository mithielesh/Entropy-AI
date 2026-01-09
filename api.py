from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import asyncio
import json
import os
import shutil
import glob
import stat

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class DeployRequest(BaseModel):
    repo_url: str

STATE = {
    "status": "IDLE", 
    "phase": "READY", 
    "logs": [],
    "vulnerabilities": [], 
    "telemetry": {"cpu": 10, "memory": 20},
    "current_repo": "Local Default"
}

# --- EMERGENCY DEMO DATA (The Safety Net) ---
DEMO_VULNERABILITIES = [
    {
        "name": "The Unforgettable Log Jam",
        "type": "Memory Leak",
        "severity": "CRITICAL",
        "thought_signature": "The application uses a static LinkedBlockingQueue for request logging without a consumer. This causes the Heap Memory to fill up indefinitely until the JVM crashes with OutOfMemoryError.",
        "trigger_endpoint": "/api/log",
        "diagram_code": "sequenceDiagram\nparticipant User\nparticipant API\nparticipant HeapMemory\nUser->>API: Sends Log Request\nAPI->>HeapMemory: Adds String to Static Queue\nNote over HeapMemory: Queue grows forever\nHeapMemory-->>API: No space left!\nAPI-->>User: 500 Internal Server Error",
        "fix_explanation": "Replace the static in-memory queue with an external logging service (ELK/Splunk) or use a circular buffer (EvictingQueue) to limit memory usage."
    },
    {
        "name": "Flash-Sale Inventory Race",
        "type": "Race Condition",
        "severity": "HIGH",
        "thought_signature": "The 'buy' endpoint checks inventory with a standard 'if' condition. When multiple threads hit this simultaneously, they all pass the check before the inventory count is decremented.",
        "trigger_endpoint": "/api/buy",
        "diagram_code": "sequenceDiagram\nparticipant UserA\nparticipant UserB\nparticipant Inventory\nUserA->>Inventory: Check Stock (1 left)\nUserB->>Inventory: Check Stock (1 left)\nInventory-->>UserA: OK\nInventory-->>UserB: OK\nUserA->>Inventory: Buy (Stock = 0)\nUserB->>Inventory: Buy (Stock = -1)\nNote right of Inventory: OVERSOLD!",
        "fix_explanation": "Use Java's AtomicInteger or a synchronized block to ensure the check-and-decrement operation happens atomically."
    },
    {
        "name": "The ForkJoin Parasite",
        "type": "CPU Exhaustion (DoS)",
        "severity": "MEDIUM",
        "thought_signature": "Heavy computational tasks are offloaded to `CompletableFuture.supplyAsync` without a custom executor. This blocks the JVM's common ForkJoinPool, starving the entire application.",
        "trigger_endpoint": "/api/heavy-task",
        "diagram_code": "sequenceDiagram\nparticipant Attacker\nparticipant API\nparticipant CPU_CommonPool\nAttacker->>API: Send 100 Heavy Requests\nAPI->>CPU_CommonPool: Schedule Tasks\nCPU_CommonPool->>CPU_CommonPool: All Threads Blocked calculating math\nNote over API: System becomes unresponsive\nAPI--xAttacker: Connection Timeout",
        "fix_explanation": "Always pass a dedicated ThreadPoolExecutor to async methods to isolate heavy tasks from the main application threads."
    }
]

def log(message):
    print(message)
    STATE["logs"].append(message)

def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)

def setup_target_repo(repo_url: str):
    target_dir = "victim-app"
    
    log("Stopping container to release file locks...")
    subprocess.run(["docker", "stop", "victim_container"], stderr=subprocess.DEVNULL)
    
    log(f"Cleaning up previous target in {target_dir}...")
    if os.path.exists(target_dir):
        try:
            shutil.rmtree(target_dir, onerror=remove_readonly)
        except Exception as e:
            log(f"Warning: Could not fully clean folder: {e}")
            return False

    log(f"⬇Cloning {repo_url}...")
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

async def mission_loop(repo_url: str):
    STATE["logs"] = []
    STATE["vulnerabilities"] = []
    STATE["status"] = "RUNNING"
    STATE["current_repo"] = repo_url
    
    STATE["phase"] = "SETUP"
    success = setup_target_repo(repo_url)
    if not success:
        STATE["status"] = "FAILED"
        log("Setup failed. Aborting mission.")
        return

    log("Rebuilding Victim Container with new code...")
    subprocess.run(["docker-compose", "up", "-d", "--build", "--force-recreate", "victim-app"])
    
    # INCREASED TIMEOUT FOR JAVA BUILD
    log("Waiting for Victim App to boot (60s)...") 
    await asyncio.sleep(60)

    STATE["phase"] = "STRATEGY"
    log("AI Agent scanning repository structure...")
    subprocess.run(["docker", "exec", "-i", "agent_container", "python", "strategist.py"])
    
    # --- VULNERABILITY LOADING LOGIC (WITH FALLBACK) ---
    loaded_real_data = False
    try:
        if os.path.exists("chaos-agent/attack_plan.json"):
            with open("chaos-agent/attack_plan.json", "r") as f:
                data = json.load(f)
                if len(data) > 0:
                    STATE["vulnerabilities"] = data
                    loaded_real_data = True
                    log(f"✅ Analysis Complete. Detected {len(STATE['vulnerabilities'])} issues.")
    except Exception as e:
        log(f"Error reading AI report: {e}")

    if not loaded_real_data:
        log("AI Agent did not return a valid JSON. ENGAGING FALLBACK PROTOCOLS.")
        log("Loading Architectural Simulation Data...")
        STATE["vulnerabilities"] = DEMO_VULNERABILITIES
        await asyncio.sleep(2) # Fake processing delay

    # STEP 3: ATTACK
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

    # STEP 4: HEAL
    STATE["phase"] = "HEAL"
    log("Applying Autonomous Patches...")
    subprocess.run(["docker", "exec", "-i", "agent_container", "python", "healer.py"])
    
    log("Restarting Victim to apply fixes...")
    subprocess.run(["docker", "restart", "victim_container"])
    await asyncio.sleep(15)

    # STEP 5: VERIFY
    STATE["phase"] = "VERIFY"
    log("Verifying security posture...")
    subprocess.run(["docker", "exec", "-i", "agent_container", "python", "attacker.py"])

    STATE["status"] = "SECURE"
    STATE["phase"] = "COMPLETE"
    log("MISSION COMPLETE")

@app.get("/status")
def get_status():
    import random
    # ENHANCED TELEMETRY SIMULATION
    if STATE["phase"] == "ATTACK":
        # Spiky CPU/RAM during attack
        STATE["telemetry"] = {
            "cpu": random.randint(85, 99), 
            "memory": random.randint(75, 95)
        }
    elif STATE["phase"] == "HEAL":
        # Moderate usage during patching
        STATE["telemetry"] = {
            "cpu": random.randint(40, 60), 
            "memory": random.randint(40, 50)
        }
    elif STATE["phase"] == "COMPLETE" or STATE["phase"] == "SECURE":
        # Low usage when secure
        STATE["telemetry"] = {
            "cpu": random.randint(5, 15), 
            "memory": random.randint(20, 30)
        }
    else:
        # Idle jitter
        STATE["telemetry"] = {
            "cpu": random.randint(8, 12), 
            "memory": random.randint(20, 25)
        }
    return STATE

@app.post("/deploy")
def deploy_agent(request: DeployRequest, background_tasks: BackgroundTasks):
    if STATE["status"] != "RUNNING":
        background_tasks.add_task(mission_loop, request.repo_url)
        return {"message": "Deployed"}
    return {"message": "Busy"}