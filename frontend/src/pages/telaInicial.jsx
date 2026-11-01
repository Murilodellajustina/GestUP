import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, HeartPulse, Book } from 'lucide-react';
import TopBar from '../components/TopBar';
import { buscarPerfilUsuario } from '../Services/Api';

export default function TelaInicial() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("Carregando...");
  const [semanasGestacao, setSemanasGestacao] = useState(0);
  const [trimestre, setTrimestre] = useState(1);
  const [progresso, setProgresso] = useState(0);  

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await buscarPerfilUsuario();
        
        const primeiroNome = dados.nome.split(" ")[0];
        setNome(primeiroNome);

        if (dados.idadeGestacional) {
          calcularGestacao(dados.idadeGestacional);
        }

      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    }

    carregarDados();
  }, []);

 const calcularGestacao = (dataInicio) => {
    const [ano, mes, dia] = dataInicio.split('-');
    const dataInicial = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    
    const diffTempo = hoje.getTime() - dataInicial.getTime();
    const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(diffDias / 7);
    
    const semanasFinais = semanas > 0 ? semanas : 0;
    setSemanasGestacao(semanasFinais);

    if (semanasFinais <= 13) setTrimestre(1);
    else if (semanasFinais <= 27) setTrimestre(2);
    else setTrimestre(3);

    const porcentagem = Math.min(Math.round((semanasFinais / 40) * 100), 100);
    setProgresso(porcentagem > 0 ? porcentagem : 0);
  };

  return (
    <div className="d-flex flex-column h-100 bg-light">
      <TopBar titulo={
        <>Olá, <strong>{nome}!</strong><p className="mb-0 text-muted" style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>Que bom ter você por aqui! 💜</p></>
      } />
      
      <div className="px-4 py-4 overflow-auto">
        <div className="p-3 mb-4 d-flex align-items-center shadow-sm" style={{ backgroundColor: '#f5f3ff', borderRadius: '24px', border: '1px solid #ede9fe' }}>
          <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0 me-3" style={{ width: '70px', height: '70px' }}>
            <span style={{ fontSize: '2rem' }}>👶</span>
          </div>
          <div className="flex-grow-1">
            <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>Você está na</p>
            <h2 className="fw-bold mb-0" style={{ color: '#4c1d95', fontSize: '1.5rem' }}>{semanasGestacao}ª semana</h2>
            <p className="mb-2 fw-medium" style={{ color: '#7c3aed', fontSize: '0.8rem' }}>{trimestre}º trimestre</p>
            <div className="progress bg-white" style={{ height: '8px' }}>
              <div className="progress-bar" role="progressbar" style={{ width: `${progresso}%`, backgroundColor: '#8b5cf6' }}></div>
            </div>
            <p className="text-end text-muted mt-1 mb-0" style={{ fontSize: '0.7rem' }}>{progresso}%</p>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-6">
            <button onClick={() => navigate('/gestacao')} className="btn btn-white w-100 p-3 text-start shadow-sm border-0 h-100" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px', backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                <Calendar size={20} />
              </div>
              <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>Minha gestação</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Acompanhe o seu desenvolvimento</p>
            </button>
          </div>

          <div className="col-6">
            <button onClick={() => navigate('/sintomas')} className="btn btn-white w-100 p-3 text-start shadow-sm border-0 h-100" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px', backgroundColor: '#fce7f3', color: '#ec4899' }}>
                <HeartPulse size={20} />
              </div>
              <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>Sintomas</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Entenda o que merece atenção</p>
            </button>
          </div>

          <div className="col-6">
            <button onClick={() => navigate('/consultas')} className="btn btn-white w-100 p-3 text-start shadow-sm border-0 h-100" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px', backgroundColor: '#dbeafe', color: '#3b82f6' }}>
                <Calendar size={20} />
              </div>
              <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>Consultas e exames</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Veja o que já fez e o que vem pela frente</p>
            </button>
          </div>

          <div className="col-6">
            <button onClick={() => navigate('/conteudos')} className="btn btn-white w-100 p-3 text-start shadow-sm border-0 h-100" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px', backgroundColor: '#ffedd5', color: '#f97316' }}>
                <Book size={20} />
              </div>
              <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>Conteúdos</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Dicas, vídeos e informações confiáveis</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}