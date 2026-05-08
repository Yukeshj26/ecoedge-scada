import pandas as pd
import requests
import time
import json
import random

# ─── CONFIGURATION ────────────────────────────────────────────────────────────
BASE_URL = "https://ecoedge-89673-default-rtdb.asia-southeast1.firebasedatabase.app"

# API Endpoints
NODE_PATH    = f"{BASE_URL}/devices/node_001.json"    
HISTORY_PATH = f"{BASE_URL}/telemetry/node_001.json"  
CSI_PATH     = f"{BASE_URL}/csi/node_001.json"        
ALERT_PATH   = f"{BASE_URL}/alerts/node_001.json"     

print("🔌 ECOEDGE·SCADA·ULTIMATE·MOCKER (AI SENTINEL ACTIVE)")
print("Streaming Live Telemetry + Time-Series + Analytical CSI + Predictive Alerts...")
print("─" * 60)

tick_counter = 0 # <-- NEW: Tracks time to trigger AI anomalies

# ─── MOCKING LOOP ─────────────────────────────────────────────────────────────
while True:
    tick_counter += 1
    current_ts = int(time.time() * 1000)

    # 1. GENERATE DYNAMIC SENSOR DATA (Baseline Reality)
    voltage_value = round(random.uniform(195.0, 265.0), 1)
    temp_value    = round(random.uniform(32.0, 48.0), 1)
    batt_value    = round(random.uniform(11.2, 14.2), 2)
    humid_value   = round(random.uniform(40.0, 90.0), 1)
    load_value    = round(random.uniform(2.0, 18.0), 2)
    
    # 2. AI PREDICTION LOGIC (The "Shadow Line")
    # Normally, the model tracks closely to reality
    predicted_voltage = voltage_value + random.uniform(-4.0, 4.0)

    # 🚨 INJECT ANOMALY: Every 15 ticks, the AI predicts a massive incoming spike
    if tick_counter % 15 == 0:
        print("\n⚠️ AI SENTINEL: Forecasting catastrophic surge...")
        predicted_voltage = 285.5 # AI sees a massive spike coming
        
        # Trigger the Pre-emptive Alert BEFORE reality hits
        ai_alert = {
            "type": "AI_PREDICTIVE_SHUTDOWN",
            "severity": "WARNING", # Use warning so it looks different from standard criticals
            "message": f"AI Sentinel: 98% probability of catastrophic overvoltage ({predicted_voltage}V) in 30s. Pre-emptive shedding recommended.",
            "timestamp": current_ts
        }
        requests.post(ALERT_PATH, json=ai_alert)

    # 3. CALCULATE CSI SCORES (Analytical Engine)
    tech_score_raw = max(0, 100 - (abs(230 - voltage_value) * 1.8))
    env_score_raw  = 100 if temp_value < 38 else max(0, 100 - (temp_value - 38) * 12)
    master_csi_decimal = ((tech_score_raw * 0.5) + (env_score_raw * 0.3) + (95.0 * 0.2)) / 100

    # 4. STANDARD AUTO-ALERT ENGINE (Reactive Reality)
    if voltage_value > 250 or voltage_value < 210:
        alert_payload = {
            "type": "OVERVOLTAGE" if voltage_value > 250 else "UNDERVOLTAGE",
            "severity": "CRITICAL",
            "message": f"Critical: AC voltage {voltage_value}V exceeds safety bounds.",
            "timestamp": current_ts
        }
        requests.post(ALERT_PATH, json=alert_payload)

    # 5. PREPARE PAYLOADS
    base_efficiency_gain = 15.0
    dynamic_efficiency = base_efficiency_gain + random.uniform(-0.4, 0.8)
    tele_payload = {
        "name": "ECOEDGE NODE 001",
        "location": "Microgrid Site 1",
        "type": "solar_hybrid",
        "status": "online",
        "voltage": voltage_value,
        "predictedVoltage": round(predicted_voltage, 1), # <-- NEW: Sent to the graph!
        "temperature": temp_value,
        "battery": batt_value,
        "humidity": humid_value,
        "loadCurrent": load_value,
        "timestamp": current_ts
    }

    csi_payload = {
        "composite": round(master_csi_decimal, 3),
        "technical": round(tech_score_raw, 1),
        "environmental": round(env_score_raw, 1),
        "economic": 95.0,
        "aiEfficiencyGain": round(dynamic_efficiency, 2),
        "label": "OPTIMAL" if master_csi_decimal > 0.75 else "DEGRADED" if master_csi_decimal > 0.45 else "CRITICAL"
    }

    # 6. EXECUTE SIMULTANEOUS PUSHES
    try:
        r_live = requests.patch(NODE_PATH, json=tele_payload)
        r_hist = requests.post(HISTORY_PATH, json=tele_payload)
        r_csi  = requests.patch(CSI_PATH, json=csi_payload)

        status = "NOMINAL" if master_csi_decimal > 0.75 else "ALERT"
        print(f"[{status}] V: {voltage_value}V | AI: {round(predicted_voltage, 1)}V | CSI: {round(master_csi_decimal*100, 1)}%")
    except Exception as e:
        print(f"🚨 Network Error: {e}")

    time.sleep(2)