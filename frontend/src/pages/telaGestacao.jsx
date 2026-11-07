import React, { useEffect, useState } from 'react';
import { Baby, CalendarDays, ChevronDown, ChevronUp, HeartHandshake } from 'lucide-react';
import TopBar from '../components/TopBar';
import { buscarPerfilUsuario } from '../Services/Api';
import informacoesSemanais from '../components/semanasGestacao';

const CORES_TRIMESTRE = {
  1: { principal: '#db2777', clara: '#fce7f3', nome: 'rosa' },
  2: { principal: '#7c3aed', clara: '#ede9fe', nome: 'roxo' },
  3: { principal: '#0284c7', clara: '#e0f2fe', nome: 'azul' }
};

function dataLocal(data) {
  if (!data) return null;
  const partes = String(data).slice(0, 10).split('-').map(Number);
  if (partes.length !== 3 || partes.some(Number.isNaN)) return null;
  const resultado = new Date(Date.UTC(partes[0], partes[1] - 1, partes[2]));
  return Number.isNaN(resultado.getTime()) ? null : resultado;
}

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(data);
}

export default function TelaGestacao() {
  const [dataInicial, setDataInicial] = useState(null);
  const [hoje, setHoje] = useState(() => new Date());
  const [expandido, setExpandido] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    buscarPerfilUsuario()
      .then((dados) => {
        if (ativo && dados.idadeGestacional) {
          const [ano, mes, dia] = dados.idadeGestacional.split('-');
          setDataInicial(new Date(ano, mes - 1, dia));
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar perfil:', error);
        if (ativo) setErro('Não foi possível carregar a data da última menstruação.');
      })
      .finally(() => { if (ativo) setCarregando(false); });
      
    const intervalo = window.setInterval(() => setHoje(new Date()), 60 * 60 * 1000);
    return () => { ativo = false; window.clearInterval(intervalo); };
  }, []);

  const diffTempo = dataInicial ? hoje.getTime() - dataInicial.getTime() : 0;
  const diasDecorridos = dataInicial ? Math.floor(diffTempo / (1000 * 60 * 60 * 24)) : 0;
  
  const dataValida = dataInicial && diasDecorridos >= 0;
  const semanas = dataValida ? Math.floor(diasDecorridos / 7) : 0;
  
  const semanaExibida = semanas > 0 ? Math.min(semanas, 40) : 0;
  const diasNaSemana = dataValida ? diasDecorridos % 7 : 0;
  
  let trimestre = 1;
  if (semanaExibida <= 13) trimestre = 1;
  else if (semanaExibida <= 27) trimestre = 2;
  else trimestre = 3;

  const cor = CORES_TRIMESTRE[trimestre];
  
  const porcentagem = Math.min(Math.round((semanaExibida / 40) * 100), 100);
  const progresso = porcentagem > 0 ? porcentagem : 0;
  
  const parto = dataInicial ? new Date(dataInicial.getTime() + 280 * (1000 * 60 * 60 * 24)) : null;
  
  const indiceSemana = Math.max(1, semanaExibida);
  const dadosSemana = informacoesSemanais[indiceSemana] || { titulo: '', descricao: '', desenvolvimento: [], cuidados: '' };

  return (
    <div className="d-flex flex-column h-100 bg-light">
      <TopBar titulo="Minha gestação" showBack />
      <main className="px-4 py-4" style={{ overflowY: 'auto' }}>
        {carregando ? <div className="text-center text-muted py-5" role="status">Carregando seu acompanhamento…</div> : (
          <>
            {erro && <div className="alert alert-warning rounded-4" role="alert">{erro}</div>}
            {!dataInicial && !erro && <div className="alert alert-info rounded-4" role="status">Adicione a data da última menstruação ao seu perfil para acompanhar a gestação.</div>}
            {dataInicial && !dataValida && <div className="alert alert-warning rounded-4" role="alert">A data da última menstruação está no futuro. Confira a data cadastrada no seu perfil.</div>}

            <section className="bg-white p-4 shadow-sm mb-4" style={{ borderRadius: 24 }} aria-label="Progresso da gestação">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="small text-muted mb-1">Acompanhamento da gestação</p>
                  <h2 className="fw-bold mb-1" style={{ color: cor.principal, fontSize: '1.55rem' }}>
                    {dataValida ? `${semanaExibida}ª semana` : 'Sua jornada começa aqui'}
                  </h2>
                  {dataValida && <p className="mb-0 text-muted small">{diasNaSemana} {diasNaSemana === 1 ? 'dia' : 'dias'} completos nesta semana · {trimestre}º trimestre</p>}
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: cor.clara, color: cor.principal }}><Baby size={26} /></div>
              </div>
              <div className="progress mb-2" role="progressbar" aria-label="Progresso até a semana 40" aria-valuenow={progresso} aria-valuemin="0" aria-valuemax="100" style={{ height: 10, borderRadius: 10, backgroundColor: '#f3f4f6' }}>
                <div className="progress-bar" style={{ width: `${progresso}%`, backgroundColor: cor.principal, borderRadius: 10, transition: 'width .4s ease' }} />
              </div>
              <div className="d-flex justify-content-between small text-muted"><span>{progresso}% concluído</span><span>40 semanas</span></div>

              <div className="d-flex justify-content-between mt-4">
                {[1, 2, 3].map((numero) => {
                  const etapa = CORES_TRIMESTRE[numero];
                  const ativo = dataValida && trimestre === numero;
                  const concluido = dataValida && trimestre > numero;
                  return <div key={numero} className="d-flex flex-column align-items-center" style={{ width: '33%' }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 34, height: 34, color: ativo || concluido ? '#fff' : '#9ca3af', backgroundColor: ativo || concluido ? etapa.principal : '#fff', border: ativo || concluido ? 'none' : '2px solid #e5e7eb' }}>{numero}</div>
                    <span className="text-muted mt-1 text-center" style={{ fontSize: '.68rem' }}>{numero}º trimestre</span>
                  </div>;
                })}
              </div>
            </section>

            {dataValida && <>
              <section className="bg-white p-4 shadow-sm mb-4" style={{ borderRadius: 24 }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: cor.principal }}><CalendarDays size={19} /><h3 className="h6 fw-bold mb-0">Data provável do parto</h3></div>
                <p className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>{formatarData(parto)}</p>
                <p className="small text-muted mb-0">Estimativa de 280 dias a partir da DUM. A data pode ser ajustada pela equipe de pré-natal.</p>
              </section>

              <section className="bg-white p-4 shadow-sm mb-4" style={{ borderRadius: 24 }}>
                <p className="small mb-1" style={{ color: cor.principal }}>Semana {semanaExibida} · {trimestre}º trimestre</p>
                <h3 className="fw-bold mb-2" style={{ color: '#312e3c', fontSize: '1.25rem' }}>{dadosSemana.titulo}</h3>
                <p className="text-secondary small mb-3">{dadosSemana.descricao}</p>
                <button type="button" onClick={() => setExpandido(!expandido)} aria-expanded={expandido} className="btn w-100 d-flex justify-content-between align-items-center px-3 py-2 fw-medium border-0" style={{ backgroundColor: cor.clara, color: cor.principal, borderRadius: 16, fontSize: '.88rem' }}>
                  {expandido ? 'Ocultar detalhes da semana' : 'Ver detalhes desta semana'}
                  {expandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandido && <ul className="text-secondary small mt-3 mb-0 ps-3">{dadosSemana.desenvolvimento?.map((item) => <li className="mb-2" key={item}>{item}</li>)}</ul>}
              </section>

              <section className="p-4 shadow-sm mb-4" style={{ borderRadius: 24, backgroundColor: cor.clara }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: cor.principal }}><HeartHandshake size={20} /><h3 className="h6 fw-bold mb-0">Cuidados nesta fase</h3></div>
                <p className="small mb-0 text-secondary">{dadosSemana.cuidados}</p>
              </section>
            </>}
          </>
        )}
      </main>
    </div>
  );
}
