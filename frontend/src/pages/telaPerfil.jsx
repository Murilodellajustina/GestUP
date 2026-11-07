import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar as CalendarIcon, Bell, HelpCircle, Info, ChevronRight } from 'lucide-react';
import TopBar from '../components/TopBar';
import { buscarPerfilUsuario } from '../Services/Api';

export default function TelaPerfil() {
    const navigate = useNavigate();

    const [nome, setNome] = useState("Carregando...");
    const [email, setEmail] = useState("Carregando...");
  
    useEffect(() => {
      async function carregarDados() {
        try {
          const dados = await buscarPerfilUsuario();
          
          const primeiroNome = dados.nome.split(" ")[0];
          setNome(primeiroNome);
          setEmail(dados.email);
         
  
        } catch (error) {
          console.error("Erro ao carregar perfil:", error);
        }
      }
  
      carregarDados();
    }, []);

  return (
    <div className="d-flex flex-column h-100 bg-light">
      <TopBar titulo="Perfil" icone="settings" />
      
      <div className="px-4 py-4 d-flex flex-column align-items-center bg-white border-bottom">
        <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '90px', height: '90px', backgroundColor: '#ede9fe', color: '#a78bfa' }}>
          <User size={40} />
        </div>
        <h4 className="fw-bold text-dark mb-0">{nome}</h4>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>{email}</p>
      </div>

      <div className="mt-4 px-3">
        <div className="bg-white shadow-sm overflow-hidden" style={{ borderRadius: '24px', border: '1px solid #f3f4f6' }}>
          <button onClick={() => navigate('/meus-dados')} className="btn btn-white w-100 d-flex align-items-center justify-content-between p-3 border-0 border-bottom" style={{ borderRadius: 0 }}>
            <div className="d-flex align-items-center gap-3">
              <User size={20} className="text-muted" />
              <span className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>Meus dados</span>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
          
          <button onClick={() => navigate('/consultas')} className="btn btn-white w-100 d-flex align-items-center justify-content-between p-3 border-0 border-bottom" style={{ borderRadius: 0 }}>
            <div className="d-flex align-items-center gap-3">
              <CalendarIcon size={20} className="text-muted" />
              <span className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>Minhas consultas e exames</span>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>

          <button onClick={() => navigate('/notificacoes')} className="btn btn-white w-100 d-flex align-items-center justify-content-between p-3 border-0 border-bottom" style={{ borderRadius: 0 }}>
            <div className="d-flex align-items-center gap-3">
              <Bell size={20} className="text-muted" />
              <span className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>Notificações</span>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>

          <button onClick={() => navigate('/feedback')} className="btn btn-white w-100 d-flex align-items-center justify-content-between p-3 border-0 border-bottom" style={{ borderRadius: 0 }}>
            <div className="d-flex align-items-center gap-3">
              <HelpCircle size={20} className="text-muted" />
              <span className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>Feedback</span>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>

          <button onClick={() => navigate('/sobre')} className="btn btn-white w-100 d-flex align-items-center justify-content-between p-3 border-0" style={{ borderRadius: 0 }}>
            <div className="d-flex align-items-center gap-3">
              <Info size={20} className="text-muted" />
              <span className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>Sobre o GestUp</span>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        </div>
      </div>

      <div className="px-3 mt-4 mb-4">
        <button 
          onClick={() => navigate('/')} 
          className="btn bg-white w-100 py-3 fw-bold text-secondary shadow-sm" 
          style={{ border: '1px solid #e5e7eb', borderRadius: '50px' }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}