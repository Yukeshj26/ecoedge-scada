import React, { useState } from 'react';
import { useDevices } from '../hooks/useFirebase';
import { registerNode, decommissionNode } from '../hooks/useFirebase';
import AddNode from '../components/AddNode';

const T = {
  bgDeep: "#090c0f",
  bgInner: "#111418",
  border: "rgba(255,255,255,0.05)",
  crit: "#f05050",
  blue: "#4da6ff",
  textHi: "#eaf0f6",
  muted: "#6b7a8a",
  fontHead: "'Barlow Condensed', sans-serif",
  fontMono: "'IBM Plex Mono', monospace",
};

export default function AdminTerminal() {
  const { devices } = useDevices();
  const [activeAction, setActiveAction] = useState(null); // 'add' or 'remove'

  const handleDecommission = async (id) => {
    const confirm = window.confirm(`WARNING: This will permanently wipe ${id} from the registry. Continue?`);
    if (confirm) {
      await decommissionNode(id);
    }
  };

  return (
    <div className="page" style={{ padding: 40, minHeight: '100vh', background: T.bgDeep }}>
      {/* Header */}
      <div style={{ marginBottom: 40, borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
        <h1 style={{ fontFamily: T.fontHead, fontSize: 28, color: T.crit, letterSpacing: '0.1em' }}>
          SECURE ADMIN TERMINAL
        </h1>
        <p style={{ fontFamily: T.fontMono, fontSize: 12, color: T.muted }}>
          HARDWARE REGISTRY & ACCESS CONTROL UNIT
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        
        {/* Left Column: Provisioning */}
        <section>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 18, background: T.blue }} />
            <h2 style={{ fontFamily: T.fontHead, color: T.textHi, fontSize: 20 }}>PROVISIONING BAY</h2>
          </div>
          <AddNode 
            onRegister={(id, data) => registerNode(id, data)} 
            onCancel={() => {}} 
          />
        </section>

        {/* Right Column: Fleet Management */}
        <section>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 18, background: T.crit }} />
            <h2 style={{ fontFamily: T.fontHead, color: T.textHi, fontSize: 20 }}>ACTIVE REGISTRY</h2>
          </div>
          
          <div style={{ background: T.bgInner, borderRadius: 6, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            {Object.entries(devices).map(([id, meta]) => (
              <div key={id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
                fontFamily: T.fontMono
              }}>
                <div>
                  <div style={{ color: T.textHi, fontSize: 14 }}>{id}</div>
                  <div style={{ color: T.muted, fontSize: 11 }}>{meta.name} • {meta.location}</div>
                </div>
                <button 
                  onClick={() => handleDecommission(id)}
                  style={{
                    background: 'transparent', border: `1px solid ${T.crit}`, color: T.crit,
                    padding: '4px 12px', borderRadius: 4, fontSize: 10, cursor: 'pointer',
                    fontFamily: T.fontHead, fontWeight: 700
                  }}
                >
                  REVOKE
                </button>
              </div>
            ))}
            {Object.keys(devices).length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: T.muted, fontFamily: T.fontMono }}>
                NO HARDWARE REGISTERED
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}