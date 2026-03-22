import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, BrainCircuit } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar container">
      <Link to="/" className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BrainCircuit size={28} color="#8b5cf6" />
        CareerAI
      </Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        <Link to="/add" className={`nav-link ${location.pathname === '/add' ? 'active' : ''}`}>
          <PlusCircle size={18} />
          Add Application
        </Link>
      </div>
    </nav>
  );
}
