import { useState, useEffect, useRef } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../firebase';
import { useDevices } from '../hooks/useFirebase';
import { usePredictor } from '../hooks/usePredictor';

// UI Components
import NodeCard from '../components/NodeCard';
import AlertFeed from '../components/AlertFeed';
import SystemStatus from '../components/SystemStatus';
import NodeDetail from '../components/NodeDetail';

export default function Dashboard() {
  // --- STATE & HOOKS ---
  const { devices, loading } = useDevices();
  const { isReady, predictNext } = usePredictor();
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [tick, setTick] = useState(0);
  
  // THE MEMORY BUFFER: Stores the last 10 voltage readings per node in RAM
  const voltageHistory = useRef({});

  // 1. UI HEARTBEAT: Keeps global metrics and timers fresh
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  // 2. THE INTELLIGENCE ENGINE: Background AI + Reactive Safety
  useEffect(() => {
    if (loading || !devices) return;

    Object.entries(devices).forEach(([id, data]) => {
      
      // --- LAYER 1: PREDICTIVE AI LOGIC ---
      if (isReady && data.voltage) {
        // Initialize buffer if empty
        if (!voltageHistory.current[id]) voltageHistory.current[id] = [];
        
        // Add newest reading
        voltageHistory.current[id].push(data.voltage);
        
        // Maintain the Sliding Window (Keep only last 10)
        if (voltageHistory.current[id].length > 10) {
          voltageHistory.current[id].shift(); 
        }

        // Run Inference when we have a full sequence
        if (voltageHistory.current[id].length === 10) {
          const predictedVoltage = predictNext(voltageHistory.current[id]);
          
          // Pre-Emptive Alert Check
          if (predictedVoltage > 250) {
            console.warn(`[AI SENTINEL] Predicted Overvoltage on ${id}: ${predictedVoltage}V`);
            
            const alertRef = ref(db, `alerts/${id}`);
            push(alertRef, {
              type: "AI_WARNING_OVERVOLTAGE",
              value: predictedVoltage,
              timestamp: Date.now(),
              message: `AI PREDICTION: Voltage spike to ${predictedVoltage}V expected shortly.`
            });
            
            // Clear half the buffer to prevent alert spamming
            voltageHistory.current[id].splice(0, 5); 
          }
        }
      }

      // --- LAYER 2: REACTIVE HARDWARE LOGIC ---
      // Overvoltage Protection (Instant drop)
      if (data.voltage > 250) {
        const alertRef = ref(db, `alerts/${id}`);
        push(alertRef, {
          type: "OVERVOLTAGE",
          value: data.voltage,
          timestamp: Date.now(),
          message: `CRITICAL: AC voltage ${data.voltage}V exceeds 250V safety limit.`
        });
      }

      // Thermal Monitoring
      if (data.temperature > 48) {
        const alertRef = ref(db, `alerts/${id}`);
        push(alertRef, {
          type: "THERMAL_ALARM",
          value: data.temperature,
          timestamp: Date.now(),
          message: `High ambient temp on edge node: ${data.temperature}°C`
        });
      }
    });
  }, [devices, loading, isReady]);

  // Extract node IDs safely
  const nodeIds = Object.keys(devices || {});

  // --- UI RENDER ---
  return (
    <>
<SystemStatus nodes={nodeIds} telemetryMap={devices} key={tick} />

      <div className="page" style={{ position: 'relative', padding: '24px' }}>
        
        {/* Dashboard Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "'Barlow Condensed'", fontSize: 24, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e8edf2',
            margin: 0
          }}>
            Fleet Overview
          </h1>
          <p style={{
            fontFamily: "'IBM Plex Mono'", fontSize: 11, color: '#455060', marginTop: 4,
          }}>
            {loading ? "SYNCHRONIZING..." : `${nodeIds.length} ACTIVE NODES · REAL-TIME RTDB STREAM`}
          </p>
        </div>

        {/* Main Interface: Grid + Sidebar */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          
          {/* Node Grid */}
          <div style={{
            flex: 1, display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20, alignItems: 'start',
          }}>
            {loading ? (
              <div style={{ color: '#4da6ff', fontFamily: "'IBM Plex Mono'", fontSize: 12 }}>
                ESTABLISHING SECURE CONNECTION TO EDGE...
              </div>
            ) : nodeIds.map((nodeId) => (
              <NodeCard
                key={nodeId}
                nodeId={nodeId}
                deviceMeta={devices[nodeId]}
                selected={selectedNode === nodeId}
                onSelect={setSelectedNode}
              />
            ))}
          </div>

          {/* Right Sidebar: Automated Alert Feed */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <AlertFeed maxItems={30} />
          </div>
        </div>

        {/* Detailed Analytics Overlay (Telemetry History) */}
        {selectedNode && (
          <div style={{ marginTop: 32 }}>
            <NodeDetail 
              nodeId={selectedNode} 
              onClose={() => setSelectedNode(null)} 
              limit={60}
            />
          </div>
        )}

        {/* System Footer */}
        <div style={{
          marginTop: 48, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)',
          fontFamily: "'IBM Plex Mono'", fontSize: 10, color: '#2a3540',
          letterSpacing: '0.08em', display: 'flex', justifyContent: 'space-between',
        }}>
          <span>ECOEDGE SOCIAL SCADA · PHASE 5 · MALAYAMBAKKAM GATEWAY</span>
          <span>SENTINEL ENGINE: ACTIVE · AI FORECASTING: {isReady ? "ONLINE" : "INITIALIZING"}</span>
        </div>
      </div>
    </>
  );
}