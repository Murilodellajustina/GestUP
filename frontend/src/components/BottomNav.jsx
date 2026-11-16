import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Baby, CalendarDays, BookOpen, User, MessageCircle } from 'lucide-react';
import logo from '../imgs/Logo.png';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { id: '/home', icon: Home, label: 'Início' },
    { id: '/gestacao', icon: Baby, label: 'Gestação' },
    { id: '/consultas', icon: CalendarDays, label: 'Calendário' },
    { id: '/conteudos', icon: BookOpen, label: 'Conteúdos' },
    { id: '/perfil', icon: User, label: 'Perfil' },
    { id: '/comunidade', icon: MessageCircle, label: 'GesBlog' },
  ];

  return (
    <>
      <div className="d-md-none position-fixed bottom-0 start-0 w-100 bg-body border-top px-3 py-2 d-flex justify-content-between align-items-center shadow-lg" style={{ zIndex: 1000 }}>
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = currentPath.includes(id);
          return (
            <button
              key={`mobile-${id}`}
              onClick={() => navigate(id)}
              className="btn btn-link text-decoration-none d-flex flex-column align-items-center p-1 border-0"
              style={{ minWidth: '48px', color: isActive ? '#7c3aed' : '#9ca3af' }}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="fw-medium mt-1" style={{ fontSize: '10px' }}>{label}</span>
            </button>
          );
        })}
      </div>

      <div className="d-none d-md-flex flex-column bg-body border-end h-100 py-4 shadow-sm" style={{ width: '260px', zIndex: 1000 }}>
        <div className="d-flex align-items-center gap-2 mb-5 px-4" style={{ color: '#ed3ac3' }}>
          <img
              src={logo}
              alt="Logo"
              style={{ width: "50px" }}
            />
          <h2 className="fs-4 fw-bold mb-0">GestUp</h2>
        </div>
        
        <div className="d-flex flex-column gap-2 px-3">
          {navItems.map(({ id, icon: Icon, label }) => {
            const isActive = currentPath.includes(id);
            return (
              <button
                key={`desktop-${id}`}
                onClick={() => navigate(id)}
                className="btn d-flex align-items-center gap-3 px-4 py-3 border-0 text-start"
                style={{ 
                  borderRadius: '16px',
                  backgroundColor: isActive ? '#f5f3ff' : 'transparent',
                  color: isActive ? '#7c3aed' : '#6b7280',
                  fontWeight: isActive ? 'bold' : '500',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: '1rem' }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
