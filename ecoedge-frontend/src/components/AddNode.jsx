import React, { useState } from 'react';

// ─── Design Tokens (Matching Phase 4) ─────────────────────────────────────────
const T = {
  bgInner:   "#111418",
  bgDeep:    "#090c0f",
  border:    "rgba(255,255,255,0.05)",
  borderHi:  "rgba(255,255,255,0.15)",
  blue:      "#4da6ff",
  good:      "#4ade80",
  muted:     "#6b7a8a",
  textHi:    "#eaf0f6",
  fontHead:  "'Barlow Condensed', sans-serif",
  fontMono:  "'IBM Plex Mono', monospace",
};

export default function AddNode({ onRegister, onCancel }) {
  const [formData, setFormData] = useState({
    id: 'node_004',
    name: 'Node Delta',
    location: 'South Cluster',
    type: 'solar_hybrid'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    // Call the Firebase function passed down from the parent
    if (onRegister) {
      const result = await onRegister(formData.id, {
        name: formData.name,
        location: formData.location,
        type: formData.type
      });
      if (result?.success) {
        setStatus('success');
        setTimeout(() => onCancel(), 2000); // Auto-close after success
      } else {
        setStatus('error');
      }
    }
    setIsSubmitting(false);
  };

  const inputStyle = {
    width: '100%', background: T.bgDeep, border: `1px solid ${T.borderHi}`,
    color: T.textHi, padding: '10px 14px', borderRadius: 4,
    fontFamily: T.fontMono, fontSize: 13, outline: 'none',
    boxSizing: 'border-box', marginBottom: 16,
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block', fontFamily: T.fontHead, fontSize: 11,
    letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase',
    marginBottom: 6, fontWeight: 600,
  };

  return (
    <div style={{
      background: T.bgInner, border: `1px solid ${T.border}`,
      borderRadius: 6, padding: '24px 32px', maxWidth: 450,
      boxShadow: "0 24px 80px rgba(0,0,0,0.8)", position: "relative",
      overflow: "hidden"
    }}>
      {/* Scanline Texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 4, height: 18, background: T.blue }} />
          <h2 style={{
            fontFamily: T.fontHead, fontSize: 18, color: T.textHi,
            letterSpacing: '0.08em', margin: 0, textTransform: 'uppercase'
          }}>
            Hardware Provisioning
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Hardware ID (MAC / UUID)</label>
          <input 
            type="text" name="id" value={formData.id} 
            onChange={handleChange} style={inputStyle} required 
            onFocus={(e) => e.target.style.borderColor = T.blue}
            onBlur={(e) => e.target.style.borderColor = T.borderHi}
          />

          <label style={labelStyle}>Assigned Name</label>
          <input 
            type="text" name="name" value={formData.name} 
            onChange={handleChange} style={inputStyle} required 
            onFocus={(e) => e.target.style.borderColor = T.blue}
            onBlur={(e) => e.target.style.borderColor = T.borderHi}
          />

          <label style={labelStyle}>Physical Location (Cluster)</label>
          <input 
            type="text" name="location" value={formData.location} 
            onChange={handleChange} style={inputStyle} required 
            onFocus={(e) => e.target.style.borderColor = T.blue}
            onBlur={(e) => e.target.style.borderColor = T.borderHi}
          />

          <label style={labelStyle}>Microgrid Type</label>
          <select 
            name="type" value={formData.type} 
            onChange={handleChange} style={{...inputStyle, cursor: 'pointer'}}
          >
            <option value="solar_hybrid">Solar Hybrid (PV + Grid)</option>
            <option value="solar_only">Solar Island (PV + Battery)</option>
            <option value="wind_solar">Wind / Solar Hybrid</option>
          </select>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="button" onClick={onCancel} style={{
              flex: 1, background: 'transparent', border: `1px solid ${T.borderHi}`,
              color: T.muted, padding: '10px', borderRadius: 4,
              fontFamily: T.fontHead, letterSpacing: '0.1em', cursor: 'pointer',
              textTransform: 'uppercase', transition: 'all 0.2s'
            }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} style={{
              flex: 2, background: isSubmitting ? T.bgDeep : `${T.blue}22`, 
              border: `1px solid ${T.blue}`, color: T.blue, 
              padding: '10px', borderRadius: 4, fontFamily: T.fontHead, 
              letterSpacing: '0.1em', cursor: isSubmitting ? 'wait' : 'pointer',
              textTransform: 'uppercase', fontWeight: 600, transition: 'all 0.2s',
              boxShadow: isSubmitting ? 'none' : `0 0 12px ${T.blue}44`
            }}>
              {isSubmitting ? 'Provisioning...' : 'Register Node'}
            </button>
          </div>

          {status === 'success' && (
            <div style={{ 
              marginTop: 16, color: T.good, fontFamily: T.fontMono, 
              fontSize: 11, textAlign: 'center' 
            }}>
              ✔ Node provisioned successfully. Awaiting telemetry handshake.
            </div>
          )}
          {status === 'error' && (
            <div style={{ 
              marginTop: 16, color: T.crit, fontFamily: T.fontMono, 
              fontSize: 11, textAlign: 'center', background: 'rgba(240,80,80,0.1)',
              padding: '8px', border: `1px solid ${T.crit}`, borderRadius: 4
            }}>
              ✖ Provisioning Failed. Check DevTools Console for details.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}