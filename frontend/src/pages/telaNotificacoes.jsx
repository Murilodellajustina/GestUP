import React, { useState, useEffect } from 'react';
import { BellRing, CalendarClock, AlertCircle, Inbox } from 'lucide-react';
import TopBar from '../components/TopBar';
import { buscarNotificacoesBackend, marcarNotificacoesComoLidas } from '../Services/Api';

export default function TelaNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarNotificacoesBackend()
      .then(data => {
        setNotificacoes(data);
        setCarregando(false);
      })
      .catch(err => {
        console.error("Erro ao carregar notificações:", err);
        setCarregando(false);
      });
  }, []);

  const handleMarcarLidas = () => {
    if (notificacoes.length > 0) {
      marcarNotificacoesComoLidas(notificacoes); 
      setNotificacoes([]); 
    }
  };

  const obterEstiloNotificacao = (tipo) => {
    switch (tipo) {
      case 'hoje':
        return { icone: BellRing, corIcone: '#ef4444', fundoIcone: '#fee2e2' };
      case 'amanha':
        return { icone: AlertCircle, corIcone: '#f97316', fundoIcone: '#ffedd5' };
      case 'semana':
        return { icone: CalendarClock, corIcone: '#8b5cf6', fundoIcone: '#ede9fe' };
      default:
        return { icone: BellRing, corIcone: '#3b82f6', fundoIcone: '#dbeafe' };
    }
  };

  return (
    <div className="d-flex flex-column h-100 bg-light">
      <TopBar titulo="Notificações" showBack />
      
      <div className="px-4 py-3 flex-grow-1 overflow-auto">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span className="fw-bold text-dark">Recentes</span>
          {notificacoes.length > 0 && (
            <button 
              onClick={handleMarcarLidas}
              className="btn btn-link text-decoration-none p-0 fw-medium" 
              style={{ color: '#7c3aed', fontSize: '0.85rem' }}
            >
              Marcar como lidas
            </button>
          )}
        </div>

        {carregando ? (
          <p className="text-center text-muted mt-5">Verificando agenda...</p>
        ) : notificacoes.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center mt-5 opacity-75">
            <Inbox size={48} className="text-muted mb-3" />
            <p className="text-muted fw-medium text-center px-3">Você não possui notificações de consultas ou exames para os próximos dias.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 pb-5">
            {notificacoes.map((notif, i) => {
              const estilo = obterEstiloNotificacao(notif.tipo);
              const Icone = estilo.icone;
              
              return (
                <div key={i} className="bg-white p-3 shadow-sm d-flex align-items-start gap-3" style={{ borderRadius: '20px', border: '1px solid #f3f4f6' }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1" style={{ width: '45px', height: '45px', backgroundColor: estilo.fundoIcone, color: estilo.corIcone }}>
                    <Icone size={22} />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>{notif.titulo}</h6>
                    <p className="text-muted mb-1 pe-2" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{notif.mensagem}</p>
                    <span className="fw-medium" style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{notif.tempo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}