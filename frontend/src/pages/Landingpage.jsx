import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Calendar, BookOpen, Activity } from 'lucide-react';

export default function Landingpage() {
  const navigate = useNavigate();

  return (
    <div 
      className="d-flex flex-column h-100 w-100 overflow-auto text-white position-relative" 
      style={{ 
        backgroundImage: 'linear-gradient(rgba(76, 29, 149, 0.85), rgba(76, 29, 149, 0.95))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="w-100 px-4 py-5 d-flex flex-column flex-grow-1 align-items-center justify-content-between mx-auto" style={{ maxWidth: '480px' }}>
        
        <div className="d-flex flex-column align-items-center mt-3 text-center w-100">
          <div className="mb-3 p-3 rounded-circle shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
            <Heart size={44} color="#ffffff" fill="currentColor" />
          </div>
          <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-1px' }}>GestUp</h1>
          <p className="fw-medium px-2" style={{ fontSize: '1.1rem', lineHeight: '1.5', opacity: 0.9 }}>
            Acompanhamento, informação e cuidado em cada etapa da sua gravidez.
          </p>
        </div>

        <div className="w-100 my-4 d-flex flex-column gap-3">
          
          <div className="d-flex align-items-center gap-3 p-3 rounded-4 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            <Calendar className="flex-shrink-0" size={26} color="#fbcfe8" />
            <div>
              <h6 className="fw-bold mb-1">Evolução do Bebê</h6>
              <p className="mb-0 small" style={{ opacity: 0.85 }}>Acompanhe o desenvolvimento semana a semana.</p>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3 p-3 rounded-4 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            <Activity className="flex-shrink-0" size={26} color="#fbcfe8" />
            <div>
              <h6 className="fw-bold mb-1">Sintomas e Exames</h6>
              <p className="mb-0 small" style={{ opacity: 0.85 }}>Controle de consultas e alertas de saúde.</p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 p-3 rounded-4 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            <BookOpen className="flex-shrink-0" size={26} color="#fbcfe8" />
            <div>
              <h6 className="fw-bold mb-1">Conteúdos Confiáveis</h6>
              <p className="mb-0 small" style={{ opacity: 0.85 }}>Materiais revisados por profissionais.</p>
            </div>
          </div>

        </div>

        <div className="w-100 mt-3 mb-3">
          <button 
            onClick={() => navigate('/cadastro')}
            className="btn w-100 py-3 fw-bold shadow mb-3"
            style={{ backgroundColor: '#ffffff', color: '#4c1d95', borderRadius: '50px', fontSize: '1.1rem' }}
          >
            Criar minha conta
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="btn w-100 py-3 fw-bold shadow-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '50px', fontSize: '1.1rem' }}
          >
            Já tenho conta
          </button>
        </div>

      </div>
    </div>
  );
}