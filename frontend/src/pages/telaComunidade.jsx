import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Plus, Send, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { criarTopicoComunidade, enviarMensagemComunidade, listarTopicosComunidade } from '../Services/Api';

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(data));
}

export default function TelaComunidade() {
  const navigate = useNavigate();
  const [topicos, setTopicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [mensagemInicial, setMensagemInicial] = useState('');
  const [enviandoTopico, setEnviandoTopico] = useState(false);
  const [topicoAberto, setTopicoAberto] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [enviandoResposta, setEnviandoResposta] = useState(null);

  const carregarTopicos = useCallback(async () => {
    setErro('');
    try {
      const dados = await listarTopicosComunidade();
      setTopicos(dados);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar os tópicos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarTopicos(); }, [carregarTopicos]);

  async function publicarTopico(event) {
    event.preventDefault();
    setErro('');
    setEnviandoTopico(true);
    try {
      const topico = await criarTopicoComunidade({ titulo, mensagem: mensagemInicial });
      setTopicos((atuais) => [topico, ...atuais]);
      setTitulo('');
      setMensagemInicial('');
      setFormAberto(false);
      setTopicoAberto(topico.id);
    } catch (error) {
      setErro(error.message || 'Não foi possível publicar o tópico.');
    } finally {
      setEnviandoTopico(false);
    }
  }

  async function publicarResposta(event, topicoId) {
    event.preventDefault();
    const texto = respostas[topicoId]?.trim();
    if (!texto) return;
    setErro('');
    setEnviandoResposta(topicoId);
    try {
      const resposta = await enviarMensagemComunidade(topicoId, texto);
      setTopicos((atuais) => atuais.map((topico) => (
        topico.id === topicoId ? { ...topico, mensagens: [...topico.mensagens, resposta] } : topico
      )));
      setRespostas((atuais) => ({ ...atuais, [topicoId]: '' }));
    } catch (error) {
      setErro(error.message || 'Não foi possível enviar a mensagem.');
    } finally {
      setEnviandoResposta(null);
    }
  }

  return (
    <div className="d-flex flex-column h-100 bg-body-tertiary overflow-auto">
      <TopBar titulo="GesBlog" showBack />
      <main className="px-4 py-3 mx-auto w-100" style={{ maxWidth: '820px' }}>
        <section className="p-4 mb-4 text-white shadow-sm" style={{ borderRadius: '24px', background: '#c026d3' }}>
          <div className="d-flex align-items-center gap-2 mb-2"><Users size={22} /><span className="fw-semibold">Um espaço de troca e acolhimento</span></div>
          <p className="mb-3 small" style={{ opacity: 0.92 }}>Compartilhe dúvidas, experiências e mensagens com outras gestantes.</p>
          <button type="button" onClick={() => setFormAberto((aberto) => !aberto)} className="btn btn-light rounded-pill px-4 fw-semibold" style={{ color: '#6d28d9' }}>
            <Plus size={18} className="me-1" /> Criar tópico
          </button>
        </section>

        {erro && (
          <div className="alert alert-warning rounded-4" role="alert">
            <div>{erro}</div>
            {erro.toLowerCase().includes('entre na sua conta') && (
              <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => navigate('/login')}>Fazer login</button>
            )}
            {!erro.toLowerCase().includes('entre na sua conta') && !carregando && (
              <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={carregarTopicos}>Tentar novamente</button>
            )}
          </div>
        )}

        {formAberto && (
          <form onSubmit={publicarTopico} className="bg-body p-3 p-md-4 rounded-4 shadow-sm mb-4">
            <h2 className="h6 fw-bold mb-3">Novo tópico</h2>
            <label htmlFor="topico-titulo" className="form-label small fw-semibold">Título</label>
            <input id="topico-titulo" className="form-control rounded-3 mb-3" value={titulo} onChange={(event) => setTitulo(event.target.value)} minLength={4} maxLength={120} required placeholder="Ex.: Dúvidas sobre o primeiro trimestre" />
            <label htmlFor="topico-mensagem" className="form-label small fw-semibold">Sua mensagem</label>
            <textarea id="topico-mensagem" className="form-control rounded-3 mb-3" value={mensagemInicial} onChange={(event) => setMensagemInicial(event.target.value)} minLength={2} maxLength={4000} rows={4} required placeholder="Escreva o que gostaria de compartilhar..." />
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setFormAberto(false)}>Cancelar</button>
              <button type="submit" className="btn rounded-pill px-4 text-white" style={{ backgroundColor: '#7c3aed' }} disabled={enviandoTopico}>
                {enviandoTopico ? 'Publicando...' : 'Publicar tópico'}
              </button>
            </div>
          </form>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h6 fw-bold text-body mb-0">Tópicos recentes</h2>
          {!carregando && <span className="small text-muted">{topicos.length} {topicos.length === 1 ? 'tópico' : 'tópicos'}</span>}
        </div>

        {carregando ? (
          <div className="text-center text-muted py-5">Carregando conversas...</div>
        ) : topicos.length === 0 ? (
          <div className="bg-body rounded-4 p-4 text-center shadow-sm">
            <MessageCircle className="text-muted mb-2" size={30} />
            <p className="fw-semibold mb-1">Ainda não há tópicos</p>
            <p className="small text-muted mb-0">Comece uma conversa criando o primeiro tópico da comunidade.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {topicos.map((topico) => {
              const aberto = topicoAberto === topico.id;
              return (
                <article key={topico.id} className="bg-body rounded-4 p-3 p-md-4 shadow-sm">
                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 42, height: 42, color: '#7c3aed', backgroundColor: '#f5f3ff' }}>
                      <MessageCircle size={20} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <h3 className="h6 fw-bold mb-1">{topico.titulo}</h3>
                      <p className="text-body mb-2" style={{ whiteSpace: 'pre-wrap' }}>{topico.mensagem_inicial}</p>
                      <div className="d-flex flex-wrap gap-2 small text-muted">
                        <span>{topico.autor}</span><span aria-hidden="true">·</span><time dateTime={topico.criado_em}>{formatarData(topico.criado_em)}</time>
                      </div>
                    </div>
                  </div>

                  <button type="button" className="btn btn-sm rounded-pill mt-3 px-3" style={{ backgroundColor: '#f5f3ff', color: '#6d28d9' }} aria-expanded={aberto} onClick={() => setTopicoAberto(aberto ? null : topico.id)}>
                    <MessageCircle size={15} className="me-1" /> {topico.mensagens.length} {topico.mensagens.length === 1 ? 'mensagem' : 'mensagens'} · {aberto ? 'Fechar conversa' : 'Ver conversa'}
                  </button>

                  {aberto && (
                    <div className="mt-3 pt-3 border-top">
                      {topico.mensagens.map((mensagem) => (
                        <div key={mensagem.id} className="bg-body-tertiary rounded-3 p-3 mb-2">
                          <p className="mb-2 text-body" style={{ whiteSpace: 'pre-wrap' }}>{mensagem.texto}</p>
                          <div className="small text-muted">{mensagem.autor} · <time dateTime={mensagem.criado_em}>{formatarData(mensagem.criado_em)}</time></div>
                        </div>
                      ))}
                      <form onSubmit={(event) => publicarResposta(event, topico.id)} className="d-flex align-items-end gap-2 mt-3">
                        <div className="flex-grow-1">
                          <label className="visually-hidden" htmlFor={`resposta-${topico.id}`}>Escreva uma mensagem</label>
                          <textarea id={`resposta-${topico.id}`} className="form-control rounded-3" rows={2} maxLength={2000} placeholder="Escreva uma mensagem..." value={respostas[topico.id] || ''} onChange={(event) => setRespostas((atuais) => ({ ...atuais, [topico.id]: event.target.value }))} required />
                        </div>
                        <button type="submit" className="btn rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0" aria-label="Enviar mensagem" style={{ width: 42, height: 42, backgroundColor: '#7c3aed' }} disabled={enviandoResposta === topico.id}>
                          <Send size={18} />
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <p className="text-center small text-muted mt-4 mb-2">Evite compartilhar dados pessoais ou informações que identifiquem você.</p>
      </main>
    </div>
  );
}
