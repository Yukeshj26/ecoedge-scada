import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/config'); // Send to Admin Terminal on success
    } catch (err) {
      setError("AUTHENTICATION REFUSED: INVALID CREDENTIALS");
    }
  };

  return (
    <div style={{
      height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Barlow Condensed'", background: '#090c0f'
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#111418', padding: 40, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)',
        width: 350, boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ color: '#4da6ff', letterSpacing: '0.1em', marginBottom: 30, textAlign: 'center' }}>
          ADMIN ACCESS REQUIRED
        </h2>
        
        {error && <div style={{ color: '#f05050', fontSize: 12, marginBottom: 20, textAlign: 'center' }}>{error}</div>}

        <input 
          type="email" placeholder="ADMIN EMAIL" 
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle} 
        />
        <input 
          type="password" placeholder="SECURITY KEY" 
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle} 
        />
        
        <button type="submit" style={buttonStyle}>AUTHORIZE</button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%', background: '#090c0f', border: '1px solid #1c2229',
  color: '#eaf0f6', padding: '12px', marginBottom: 20, borderRadius: 4,
  outline: 'none', fontFamily: "'IBM Plex Mono'", boxSizing: 'border-box'
};

const buttonStyle = {
  width: '100%', background: '#4da6ff22', border: '1px solid #4da6ff',
  color: '#4da6ff', padding: '12px', borderRadius: 4, cursor: 'pointer',
  fontWeight: 700, letterSpacing: '0.1em'
};