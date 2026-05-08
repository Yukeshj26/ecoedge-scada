import { useState, useEffect } from 'react';
import { ref, set, onValue, query, limitToLast, orderByKey, remove } from 'firebase/database';
import { db } from '../firebase';

// Hook: latest telemetry snapshot for one node
export function useTelemetry(nodeId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nodeId) return;
    const q = query(
      ref(db, `telemetry/${nodeId}`),
      orderByKey(),
      limitToLast(1)
    );
    const unsub = onValue(q, (snap) => {
      if (snap.exists()) {
        const entries = snap.val();
        const latest = Object.values(entries)[0];
        setData(latest);
      } else {
        setData(null); // Reset if data vanishes
      }
      setLoading(false);
    });
    return unsub;
  }, [nodeId]);

  return { data, loading };
}

// Hook: telemetry history (last N readings)
export function useTelemetryHistory(nodeId, limit = 20) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!nodeId) return;
    const q = query(
      ref(db, `telemetry/${nodeId}`),
      orderByKey(),
      limitToLast(limit)
    );
    const unsub = onValue(q, (snap) => {
      if (snap.exists()) {
        setHistory(Object.values(snap.val()));
      } else {
        setHistory([]);
      }
    });
    return unsub;
  }, [nodeId, limit]);

  return history;
}

// Hook: CSI snapshot
export function useCSI(nodeId) {
  const [csi, setCSI] = useState(null);

  useEffect(() => {
    if (!nodeId) return;
    const unsub = onValue(ref(db, `csi/${nodeId}`), (snap) => {
      setCSI(snap.exists() ? snap.val() : null);
    });
    return unsub;
  }, [nodeId]);

  return csi;
}

// Hook: recent alerts
export function useAlerts(limit = 50) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const q = query(ref(db, 'alerts'), orderByKey(), limitToLast(limit));
    const unsub = onValue(q, (snap) => {
      if (snap.exists()) {
        const raw = snap.val();
        const list = Object.entries(raw)
          .flatMap(([nodeId, nodeAlerts]) =>
            Object.entries(nodeAlerts || {}).map(([id, alert]) => ({
              id,
              nodeId,
              ...alert,
            }))
          )
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        setAlerts(list);
      } else {
        setAlerts([]);
      }
    });
    return unsub;
  }, [limit]);

  return alerts;
}

// Hook: all device metadata (CRITICAL FIX HERE)
export function useDevices() {
  const [devices, setDevices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onValue(ref(db, 'devices'), (snap) => {
      // If snap doesn't exist, we must explicitly set empty object 
      // to stop the "Loading" state and clear the dashboard.
      setDevices(snap.exists() ? snap.val() : {});
      setLoading(false);
    });
    return unsub;
  }, []);

  return { devices, loading };
}

// --- ADMIN FUNCTIONS ---

export const registerNode = async (nodeId, nodeData) => {
  try {
    const deviceRef = ref(db, `devices/${nodeId}`); 
    await set(deviceRef, {
      ...nodeData,
      status: "pending_handshake",
      registeredAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    console.error("Provisioning Error:", error);
    return { success: false, error };
  }
};

export const decommissionNode = async (nodeId) => {
  try {
    const writes = [
      remove(ref(db, `devices/${nodeId}`)),
      remove(ref(db, `telemetry/${nodeId}`)),
      remove(ref(db, `csi/${nodeId}`)),
      remove(ref(db, `alerts/${nodeId}`)) // Clean up alerts too
    ];
    await Promise.all(writes);
    return { success: true };
  } catch (error) {
    console.error("Decommissioning Error:", error);
    return { success: false, error };
  }
};