import { NavLink, Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
export default function Nav() {
  const auth = getAuth();
  const [user] = useAuthState(auth); // You might need to install 'react-firebase-hooks'

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <nav className="nav">
      {/* Changed <a> to <Link> to prevent full page refresh */}
      <Link to="/" className="nav-brand">
        ECO<span>EDGE</span>
      </Link>

      <div style={{ flex: 1, display: 'flex', gap: 20 }}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/nodes"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Nodes
        </NavLink>
        <NavLink
          to="/alerts"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Alerts
        </NavLink>
        
        {/* This now leads to your AdminTerminal via the App.jsx route */}
        <NavLink
          to="/config"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Config
        </NavLink>
        {user && (
          <button 
            onClick={handleLogout}
            style={{
              background: 'transparent', border: 'none', color: '#f05050',
              fontFamily: "'Barlow Condensed'", cursor: 'pointer',
              fontSize: 14, letterSpacing: '0.1em', fontWeight: 600,
              marginLeft: 'auto', marginRight: 20
            }}
          >
            LOGOUT
          </button>
        )}
      </div>

      {/* Right side: connection indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div className="dot dot-online" />
        <span style={{
          fontFamily: "'IBM Plex Mono'",
          fontSize: 10,
          color: '#455060',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          FIREBASE·LIVE
        </span>
      </div>
    </nav>
  );
}