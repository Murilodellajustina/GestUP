import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, EyeOff, Flag, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { listarDenunciasModeracao, resolverDenunciaModeracao, souModeradora } from '../Services/Api';

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(data));
}

const filtros = [
  { id: 'pendente', rotulo: 'Pendentes' },
  { id: 'resolvida', rotulo: 'Resolvidas' },
  { id: 'todas', rotulo: 'Todas' },
];

const rotuloTipo = { topico: 'Pergunta', mensagem: 'Resposta' };

export default function TelaModeracao() {
  const navigate = useNavigate();
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('pendente');
  const [processando, setProcessando] = useState(null);

  const carregarDenuncias = useCallback(async (filtro) => {
    setErro('');
    try {
      const dados = await listarDenunciasModeracao(filtro);
      setDenuncias(dados);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar as denúncias.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (souModeradora()) {
      carregarDenuncias(filtroAtivo);
    } else {
      setCarregando(false);
    }
  }, [carregarDenuncias, filtroAtivo]);

  async function resolver(denunciaId, acao) {
    const mensagemConfirmacao = acao === 'remover'
      ? 'Remover o conteúdo denunciado do GesBlog?'
      : 'Ignorar esta denúncia e manter o conteúdo?';
    if (!window.confirm(mensagemConfirmacao)) return;
    setErro('');
    setSucesso('');
    setProcessando(denunciaId);
    try {
      await resolverDenunciaModeracao(denunciaId, acao);
      setSucesso(acao === 'remover' ? 'Conteúdo removido e denúncia resolvida.' : 'Denúncia resolvida sem remover o conteúdo.');
      setDenuncias((atuais) => atuais.filter((d) => d.id !== denunciaId));
    } catch (error) {
      setErro(error.message || 'Não foi possível resolver a denúncia.');
    } finally {
      setProcessando(null);
    }
  }

  if (!souModeradora()) {
    return (
      <div className="d-flex flex-column h-100 bg-body-tertiary overflow-auto">
        <TopBar titulo="Moderação" showBack />
        <main className="px-4 py-3 mx-auto w-100 text-center" style={{ maxWidth: '560px' }}>
          <div className="bg-body rounded-4 p-4 shadow-sm mt-4">
            <ShieldAlert className="text-muted mb-2" size={30} />
            <p className="fw-semibold mb-1">Acesso restrito</p>
            <p className="small text-muted mb-3">Esta área é exclusiva da moderação do GestUp.</p>
            <button type="button" className="btn rounded-pill px-4 text-white" style={{ backgroundColor: '#7c3aed' }} onClick={() => navigate('/forum')}>Voltar ao GesBlog</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100 bg-body-tertiary overflow-auto">
      <TopBar titulo="Moderação" showBack />

      <main className="px-4 py-3 mx-auto w-100" style={{ maxWidth: '820px' }}>
        <section className="p-4 mb-4 text-white shadow-sm" style={{ borderRadius: '24px', background: '#7c3aed' }}>
          <div className="d-flex align-items-center gap-2 mb-2"><ShieldCheck size={22} /><span className="fw-semibold">Central de denúncias</span></div>
          <p className="mb-0 small" style={{ opacity: 0.92 }}>Analise denúncias das gestantes sobre perguntas e respostas do GesBlog.</p>
        </section>

        {sucesso && <div className="alert alert-success rounded-4 py-2" role="status">{sucesso}</div>}
        {erro && (
          <div className="alert alert-warning rounded-4" role="alert">
            <div>{erro}</div>
            {!carregando && <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => carregarDenuncias(filtroAtivo)}>Tentar novamente</button>}
          </div>
        )}

        <div className="d-flex gap-2 mb-4 overflow-auto pb-1" aria-label="Filtrar denúncias">
          {filtros.map(({ id, rotulo }) => {
            const ativo = filtroAtivo === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={ativo}
                onClick={() => setFiltroAtivo(id)}
                className={`btn rounded-pill px-4 py-1 fw-medium ${ativo ? 'text-white border-0' : 'text-secondary bg-body border'}`}
                style={{ backgroundColor: ativo ? '#7c3aed' : undefined, fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                {rotulo}
              </button>
            );
          })}
        </div>

        {carregando ? (
          <div className="text-center text-muted py-5">Carregando denúncias...</div>
        ) : denuncias.length === 0 ? (
          <div className="bg-body rounded-4 p-4 text-center shadow-sm">
            <CheckCircle2 className="text-muted mb-2" size={30} />
            <p className="fw-semibold mb-1">{filtroAtivo === 'pendente' ? 'Nenhuma denúncia pendente' : 'Nenhuma denúncia encontrada'}</p>
            <p className="small text-muted mb-0">{filtroAtivo === 'pendente' ? 'Está tudo tranquilo por aqui.' : 'Tente outro filtro.'}</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {denuncias.map((denuncia) => (
              <article key={denuncia.id} className="bg-body rounded-4 p-3 p-md-4 shadow-sm">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <span className="badge rounded-pill" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>{rotuloTipo[denuncia.tipo]}</span>
                  <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>{denuncia.motivo}</span>
                  {denuncia.status === 'resolvida' && (
                    <span className="badge rounded-pill" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>resolvida</span>
                  )}
                </div>

                <div className="bg-body-tertiary rounded-3 p-3 mb-3">
                  <p className="mb-1 fw-semibold" style={{ fontSize: '0.85rem' }}>Conteúdo denunciado</p>
                  <p className="mb-2 text-body" style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{denuncia.conteudo}</p>
                  <p className="mb-0 small text-muted">Publicado por <strong>{denuncia.autor_conteudo || '(removido)'}</strong></p>
                </div>

                {denuncia.detalhes && (
                  <p className="small text-secondary mb-2"><Flag size={14} className="me-1" aria-hidden="true" />{denuncia.detalhes}</p>
                )}

                <div className="small text-muted mb-3">
                  Denunciada por <strong>{denuncia.denunciante}</strong> · {formatarData(denuncia.criada_em)}
                  {denuncia.resolvida_em && <> · resolvida em {formatarData(denuncia.resolvida_em)}</>}
                </div>

                {denuncia.status === 'pendente' ? (
                  <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="btn btn-sm rounded-pill px-3 text-white d-flex align-items-center gap-1" style={{ backgroundColor: '#db2777' }} onClick={() => resolver(denuncia.id, 'remover')} disabled={processando === denuncia.id}>
                      <Trash2 size={15} /> Remover conteúdo
                    </button>
                    <button type="button" className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1 border" onClick={() => resolver(denuncia.id, 'ignorar')} disabled={processando === denuncia.id}>
                      <EyeOff size={15} className="text-secondary" /> Ignorar
                    </button>
                  </div>
                ) : (
                  <p className="small text-muted mb-0">
                    {denuncia.topico_id || denuncia.mensagem_id ? 'Denúncia resolvida.' : 'Conteúdo foi removido do GesBlog.'}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
