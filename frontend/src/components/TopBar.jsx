import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, Settings } from 'lucide-react';

export default function TopBar({ titulo, showBack = false, icone }) {
  const navigate = useNavigate();

  return (
    <div className="d-flex align-items-center justify-content-between px-4 py-3 bg-white sticky-top" style={{ zIndex: 10 }}>
      <div className="d-flex align-items-center gap-2">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border-0"
            style={{ color: '#4b5563', width: '40px', height: '40px' }}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="h5 fw-bold mb-0" style={{ color: '#1f2937' }}>{titulo}</h1>
      </div>
      <button className="btn rounded-circle p-2 border-0 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
        {icone === 'settings' ? <Settings size={22} /> : <Bell size={22} />}
      </button>
    </div>
  );
}
