import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Landingpage() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center h-100 w-100 overflow-auto" style={{ backgroundColor: '#fdf2f8' }}>
      <div className="w-100 px-4 py-5 d-flex flex-column flex-grow-1 align-items-center justify-content-between" style={{ maxWidth: '480px' }}>
        
        <div className="d-flex flex-column align-items-center mt-4 text-center">
          <div className="mb-2" style={{ color: '#7c3aed' }}>
            <Heart size={44} fill="currentColor" />
          </div>
          <h1 className="display-5 fw-bold mb-3" style={{ color: '#4c1d95', letterSpacing: '-1px' }}>GestUp</h1>
          <p className="text-muted fw-medium" style={{ maxWidth: '240px', lineHeight: '1.4' }}>
            Toda fase importa. E você não está sozinha.
          </p>
        </div>

        <div className="flex-grow-1 w-100 d-flex align-items-center justify-content-center position-relative my-4">
          <div className="position-absolute rounded-circle shadow-sm" style={{ width: '240px', height: '240px', backgroundColor: '#fce7f3', zIndex: 0 }}></div>
          <span style={{ fontSize: '9rem', zIndex: 1, filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.04))' }}>🤰🏽</span>
        </div>

        <div className="w-100 mt-2 mb-3">
          <button 
            onClick={() => navigate('/login')}
            className="btn w-100 py-3 fw-bold shadow-sm mb-4 text-white"
            style={{ backgroundColor: '#8b5cf6', borderRadius: '50px', fontSize: '1.1rem' }}
          >
            Entrar
          </button>
          <p className="text-center text-muted small fw-medium">
            Não tem uma conta? conta?{' '}
            <button 
              onClick={() => navigate('/cadastro')} 
              className="btn btn-link p-0 fw-bold text-decoration-none ms-1"
              style={{ color: '#7c3aed' }}
            >
              Criar conta
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}