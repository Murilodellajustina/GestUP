import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, Settings } from 'lucide-react';
import { buscarNotificacoesBackend } from '../Services/Api';

export default function TopBar({ titulo, showBack = false, icone }) {
  const navigate = useNavigate();
  const [temNotificacao, setTemNotificacao] = useState(false);

  useEffect(() => {
    const checarNotificacoes = () => {
      if (icone !== 'settings') {
        buscarNotificacoesBackend().then(dados => {
          setTemNotificacao(dados && dados.length > 0);
        }).catch(console.error);
      }
    };

    checarNotificacoes();

    window.addEventListener("notificacoesAtualizadas", checarNotificacoes);
    return () => window.removeEventListener("notificacoesAtualizadas", checarNotificacoes);
  }, [icone]);

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
      <button 
        onClick={() => icone === 'settings' ? navigate('/configuracoes') : navigate('/notificacoes')}
        className="btn rounded-circle p-2 border-0 d-flex align-items-center justify-content-center position-relative" 
        style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', width: '40px', height: '40px' }}
      >
        {icone === 'settings' ? <Settings size={22} /> : (
          <>
            <Bell size={22} />
            {temNotificacao && (
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-2 border-white rounded-circle" style={{ marginTop: '10px', marginLeft: '-12px' }}>
                <span className="visually-hidden">Novas notificações</span>
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
