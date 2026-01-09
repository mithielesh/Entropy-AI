import subprocess
import time
import sys

# CONFIGURATION
AGENT_CONTAINER = "agent_container"
VICTIM_CONTAINER = "victim_container"

def run_docker_command(container, script_name):
    """Runs a Python script inside the agent container."""
    print(f"\nExecuting {script_name} inside {container}...")
    cmd = ["docker", "exec", "-i", container, "python", script_name]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # Print output in real-time-ish
    print(result.stdout)
    
    if result.returncode != 0:
        print(f"Error running {script_name}:")
        print(result.stderr)
        return False
    return True

def restart_victim():
    """Restarts the Victim App to apply patches."""
    print(f"\nRestarting {VICTIM_CONTAINER} to apply patches...")
    subprocess.run(["docker", "restart", VICTIM_CONTAINER], check=True)
    
    print("Waiting for Spring Boot to initialize (15s)...")
    time.sleep(15) # Give Java time to boot
    print("Victim is back online.")

def main_loop():
    print("==================================================")
    print("   ENTROPY: AUTONOMOUS SECURITY AGENT (STARTING)  ")
    print("==================================================")

    # STEP 1: STRATEGY
    print("\n--- PHASE 1: STRATEGIC ANALYSIS ---")
    if not run_docker_command(AGENT_CONTAINER, "strategist.py"):
        print("Strategy failed. Aborting.")
        sys.exit(1)

    # STEP 2: ATTACK (The Initial Break)
    print("\n--- PHASE 2: ACTIVE ATTACK (BASELINE) ---")
    run_docker_command(AGENT_CONTAINER, "attacker.py")
    # We expect this to SUCCEED in crashing/exploiting the app

    # STEP 3: HEALING
    print("\n--- PHASE 3: AUTONOMOUS HEALING ---")
    if not run_docker_command(AGENT_CONTAINER, "healer.py"):
        print("Healing failed. Aborting.")
        sys.exit(1)

    # STEP 4: RESTART
    restart_victim()

    # STEP 5: VERIFICATION (The Final Test)
    print("\n--- PHASE 4: VERIFICATION ATTACK ---")
    print("(Running the exact same attack tools again to prove resilience...)")
    run_docker_command(AGENT_CONTAINER, "attacker.py")

    print("\n==================================================")
    print("      MISSION COMPLETE: SYSTEM HARDENED           ")
    print("==================================================")

if __name__ == "__main__":
    main_loop()