import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Flag, Heart, HelpCircle, MessageCircle, Pencil, Plus, Search, Send, ShieldCheck, Stethoscope, Trash2, UserRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import {
    CATEGORIAS_FORUM,
    MOTIVOS_DENUNCIA,
    criarPerguntaForum,
    curtirPerguntaForum,
    curtirRespostaForum,
    denunciarConteudoForum,
    enviarRespostaForum,
    excluirPerguntaForum,
    excluirRespostaForum,
    listarPerguntasForum,
    atualizarPerguntaForum,
    atualizarRespostaForum,
    souModeradora,
} from '../Services/Api';

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(data));
}

const rotuloTipoDenuncia = { topico: 'pergunta', mensagem: 'resposta' };

export default function TelaForum() {
  const navigate = useNavigate();
  const moderadora = souModeradora();

  const [perguntas, setPerguntas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');

  const [formAberto, setFormAberto] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [mensagemInicial, setMensagemInicial] = useState('');
  const [categoriaNova, setCategoriaNova] = useState('outros');
  const [anonima, setAnonima] = useState(false);
  const [enviandoPergunta, setEnviandoPergunta] = useState(false);

  const [perguntaAberta, setPerguntaAberta] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [enviandoResposta, setEnviandoResposta] = useState(null);

  const [edicaoPergunta, setEdicaoPergunta] = useState(null);
  const [edicaoResposta, setEdicaoResposta] = useState(null);
  const [edicaoTexto, setEdicaoTexto] = useState('');

  const [denunciaAberta, setDenunciaAberta] = useState(null);
  const [motivoDenuncia, setMotivoDenuncia] = useState(MOTIVOS_DENUNCIA[0]);
  const [detalhesDenuncia, setDetalhesDenuncia] = useState('');
  const [enviandoDenuncia, setEnviandoDenuncia] = useState(false);

  const carregarPerguntas = useCallback(async () => {
    setErro('');
    try {
      const dados = await listarPerguntasForum();
      setPerguntas(dados);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar o GesBlog.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarPerguntas(); }, [carregarPerguntas]);

  const perguntasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return perguntas.filter((pergunta) => {
      const correspondeCategoria = categoriaAtiva === 'todos' || pergunta.categoria === categoriaAtiva;
      const texto = `${pergunta.titulo} ${pergunta.mensagem_inicial}`.toLocaleLowerCase('pt-BR');
      return correspondeCategoria && texto.includes(termo);
    });
  }, [perguntas, busca, categoriaAtiva]);

  async function publicarPergunta(event) {
    event.preventDefault();
    setErro('');
    setEnviandoPergunta(true);
    try {
      const pergunta = await criarPerguntaForum({ titulo, mensagem: mensagemInicial, categoria: categoriaNova, anonima });
      setPerguntas((atuais) => [pergunta, ...atuais]);
      setTitulo('');
      setMensagemInicial('');
      setCategoriaNova('outros');
      setAnonima(false);
      setFormAberto(false);
      setPerguntaAberta(pergunta.id);
    } catch (error) {
      setErro(error.message || 'Não foi possível publicar a pergunta.');
    } finally {
      setEnviandoPergunta(false);
    }
  }

  async function salvarEdicaoPergunta(event, perguntaId) {
    event.preventDefault();
    setErro('');
    try {
      const atualizada = await atualizarPerguntaForum(perguntaId, {
        titulo: edicaoPergunta.titulo,
        mensagem: edicaoPergunta.mensagem,
        categoria: edicaoPergunta.categoria,
      });
      setPerguntas((atuais) => atuais.map((p) => (p.id === perguntaId ? { ...p, ...atualizada } : p)));
      setEdicaoPergunta(null);
    } catch (error) {
      setErro(error.message || 'Não foi possível editar a pergunta.');
    }
  }

  async function excluirPergunta(perguntaId) {
    if (!window.confirm('Excluir esta pergunta e todas as respostas?')) return;
    setErro('');
    try {
      await excluirPerguntaForum(perguntaId);
      setPerguntas((atuais) => atuais.filter((p) => p.id !== perguntaId));
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir a pergunta.');
    }
  }

  async function enviarResposta(event, perguntaId) {
    event.preventDefault();
    const texto = respostas[perguntaId]?.trim();
    if (!texto) return;
    setErro('');
    setEnviandoResposta(perguntaId);
    try {
      const resposta = await enviarRespostaForum(perguntaId, texto);
      setPerguntas((atuais) => atuais.map((p) => (
        p.id === perguntaId ? { ...p, mensagens: [...p.mensagens, resposta] } : p
      )));
      setRespostas((atuais) => ({ ...atuais, [perguntaId]: '' }));
    } catch (error) {
      setErro(error.message || 'Não foi possível enviar a resposta.');
    } finally {
      setEnviandoResposta(null);
    }
  }

  async function submeterEdicaoResposta(event, perguntaId, respostaId) {
    event.preventDefault();
    const texto = edicaoTexto.trim();
    if (!texto) return;
    setErro('');
    try {
      const atualizada = await atualizarRespostaForum(respostaId, { texto });
      setPerguntas((atuais) => atuais.map((p) => (
        p.id === perguntaId
          ? { ...p, mensagens: p.mensagens.map((m) => (m.id === respostaId ? { ...m, ...atualizada } : m)) }
          : p
      )));
      setEdicaoResposta(null);
      setEdicaoTexto('');
    } catch (error) {
      setErro(error.message || 'Não foi possível editar a resposta.');
    }
  }

  async function alternarCurtidaPergunta(perguntaId) {
    try {
      const { curtiu, curtidas } = await curtirPerguntaForum(perguntaId);
      setPerguntas((atuais) => atuais.map((p) => (p.id === perguntaId ? { ...p, curtiu, curtidas } : p)));
    } catch (error) {
      setErro(error.message || 'Não foi possível curtir a pergunta.');
    }
  }

  async function alternarCurtidaResposta(perguntaId, respostaId) {
    try {
      const { curtiu, curtidas } = await curtirRespostaForum(respostaId);
      setPerguntas((atuais) => atuais.map((p) => (
        p.id === perguntaId
          ? { ...p, mensagens: p.mensagens.map((m) => (m.id === respostaId ? { ...m, curtiu, curtidas } : m)) }
          : p
      )));
    } catch (error) {
      setErro(error.message || 'Não foi possível curtir a resposta.');
    }
  }

  async function excluirResposta(perguntaId, respostaId) {
    if (!window.confirm('Excluir esta resposta?')) return;
    setErro('');
    try {
      await excluirRespostaForum(respostaId);
      setPerguntas((atuais) => atuais.map((p) => (
        p.id === perguntaId ? { ...p, mensagens: p.mensagens.filter((m) => m.id !== respostaId) } : p
      )));
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir a resposta.');
    }
  }

  function abrirDenuncia(tipo, id) {
    setMotivoDenuncia(MOTIVOS_DENUNCIA[0]);
    setDetalhesDenuncia('');
    setDenunciaAberta({ tipo, id });
  }

  async function confirmarDenuncia(event) {
    event.preventDefault();
    if (!denunciaAberta) return;
    setErro('');
    setEnviandoDenuncia(true);
    try {
      await denunciarConteudoForum({
        tipo: denunciaAberta.tipo,
        conteudo_id: denunciaAberta.id,
        motivo: motivoDenuncia,
        detalhes: detalhesDenuncia.trim() || undefined,
      });
      setDenunciaAberta(null);
    } catch (error) {
      setErro(error.message || 'Não foi possível registrar a denúncia.');
    } finally {
      setEnviandoDenuncia(false);
    }
  }

  return (
    <div className="d-flex flex-column h-100 bg-body-tertiary overflow-auto">
      <TopBar titulo="GesBlog" showBack />

      <main className="px-4 py-3 mx-auto w-100" style={{ maxWidth: '820px' }}>
        <section className="p-4 mb-3 text-white shadow-sm" style={{ borderRadius: '24px', background: '#c026d3' }}>
          <div className="d-flex align-items-center gap-2 mb-2"><HelpCircle size={22} /><span className="fw-semibold">Tire suas dúvidas com outras gestantes</span></div>
          <p className="mb-3 small" style={{ opacity: 0.92 }}>Pergunte, compartilhe experiências e converse com quem está passando pelo mesmo.</p>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" onClick={() => setFormAberto((aberto) => !aberto)} className="btn btn-light rounded-pill px-4 fw-semibold" style={{ color: '#6d28d9' }}>
              <Plus size={18} className="me-1" /> Fazer pergunta
            </button>
            {moderadora && (
              <button type="button" onClick={() => navigate('/moderacao')} className="btn rounded-pill px-4 fw-semibold border-light-subtle" style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.18)' }}>
                <ShieldCheck size={18} className="me-1" /> Moderação
              </button>
            )}
          </div>
        </section>

        <div className="alert d-flex align-items-start gap-2 py-2 px-3 mb-4 rounded-4 border-0" style={{ backgroundColor: '#f5f3ff', color: '#4c1d95' }} role="note">
          <Stethoscope size={18} className="flex-shrink-0 mt-1" aria-hidden="true" />
          <small>As respostas do GesBlog vêm de outras gestantes e <strong>não substituem uma consulta médica</strong>. Em caso de sintomas ou emergência, procure sua equipe de pré-natal.</small>
        </div>

        {erro && (
          <div className="alert alert-warning rounded-4" role="alert">
            <div>{erro}</div>
            {erro.toLowerCase().includes('entre na sua conta') && (
              <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => navigate('/login')}>Fazer login</button>
            )}
            {!erro.toLowerCase().includes('entre na sua conta') && !carregando && (
              <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={carregarPerguntas}>Tentar novamente</button>
            )}
          </div>
        )}

        {formAberto && (
          <form onSubmit={publicarPergunta} className="bg-body p-3 p-md-4 rounded-4 shadow-sm mb-4">
            <h2 className="h6 fw-bold mb-3">Nova pergunta</h2>
            <label htmlFor="pergunta-titulo" className="form-label small fw-semibold">Título</label>
            <input id="pergunta-titulo" className="form-control rounded-3 mb-3" value={titulo} onChange={(event) => setTitulo(event.target.value)} minLength={4} maxLength={120} required placeholder="Ex.: Como aliviar enjoo no primeiro trimestre?" />
            <label htmlFor="pergunta-mensagem" className="form-label small fw-semibold">Sua pergunta</label>
            <textarea id="pergunta-mensagem" className="form-control rounded-3 mb-3" value={mensagemInicial} onChange={(event) => setMensagemInicial(event.target.value)} minLength={2} maxLength={4000} rows={4} required placeholder="Escreva a sua dúvida ou experiência..." />
            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label htmlFor="pergunta-categoria" className="form-label small fw-semibold">Categoria</label>
                <select id="pergunta-categoria" className="form-select rounded-3" value={categoriaNova} onChange={(event) => setCategoriaNova(event.target.value)}>
                  {CATEGORIAS_FORUM.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
                </select>
              </div>
              <div className="col-sm-6 d-flex align-items-end">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="pergunta-anonima" checked={anonima} onChange={(event) => setAnonima(event.target.checked)} />
                  <label className="form-check-label small" htmlFor="pergunta-anonima">Publicar como <strong>anônima</strong> (só você vê seu nome)</label>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setFormAberto(false)}>Cancelar</button>
              <button type="submit" className="btn rounded-pill px-4 text-white" style={{ backgroundColor: '#7c3aed' }} disabled={enviandoPergunta}>
                {enviandoPergunta ? 'Publicando...' : 'Publicar pergunta'}
              </button>
            </div>
          </form>
        )}

        <div className="position-relative mb-3">
          <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={20} aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar perguntas"
            placeholder="Buscar no GesBlog..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="form-control py-3 ps-5 border shadow-sm"
            style={{ borderRadius: '50px', fontSize: '0.875rem' }}
          />
        </div>

        <div className="d-flex gap-2 mb-4 overflow-auto pb-1" aria-label="Filtrar por categoria" style={{ scrollbarWidth: 'none' }}>
          {['todos', ...CATEGORIAS_FORUM].map((categoria) => {
            const ativa = categoriaAtiva === categoria;
            return (
              <button
                key={categoria}
                type="button"
                aria-pressed={ativa}
                onClick={() => setCategoriaAtiva(categoria)}
                className={`btn rounded-pill px-3 px-sm-4 py-1 fw-medium text-capitalize ${ativa ? 'text-white border-0' : 'text-secondary bg-body border'}`}
                style={{ backgroundColor: ativa ? '#7c3aed' : undefined, fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                {categoria}
              </button>
            );
          })}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h6 fw-bold text-body mb-0">Perguntas recentes</h2>
          {!carregando && <span className="small text-muted">{perguntasFiltradas.length} {perguntasFiltradas.length === 1 ? 'pergunta' : 'perguntas'}</span>}
        </div>

        {carregando ? (
          <div className="text-center text-muted py-5">Carregando perguntas...</div>
        ) : perguntasFiltradas.length === 0 ? (
          <div className="bg-body rounded-4 p-4 text-center shadow-sm">
            <HelpCircle className="text-muted mb-2" size={30} />
            <p className="fw-semibold mb-1">{perguntas.length === 0 ? 'Ainda não há perguntas' : 'Nenhuma pergunta encontrada'}</p>
            <p className="small text-muted mb-0">{perguntas.length === 0 ? 'Seja a primeira a perguntar algo para a comunidade.' : 'Tente outro termo ou categoria.'}</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {perguntasFiltradas.map((pergunta) => {
              const aberta = perguntaAberta === pergunta.id;
              const editando = edicaoPergunta?.id === pergunta.id;
              return (
                <article key={pergunta.id} className="bg-body rounded-4 p-3 p-md-4 shadow-sm">
                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 42, height: 42, color: '#7c3aed', backgroundColor: '#f5f3ff' }}>
                      {pergunta.anonima && pergunta.autor === 'Anônima' ? <UserRound size={20} /> : <HelpCircle size={20} />}
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      {editando ? (
                        <form onSubmit={(event) => salvarEdicaoPergunta(event, pergunta.id)}>
                          <label className="form-label small fw-semibold mt-2" htmlFor={`edicao-titulo-${pergunta.id}`}>Título</label>
                          <input id={`edicao-titulo-${pergunta.id}`} className="form-control rounded-3 mb-2" value={edicaoPergunta.titulo} onChange={(event) => setEdicaoPergunta({ ...edicaoPergunta, titulo: event.target.value })} minLength={4} maxLength={120} required />
                          <label className="form-label small fw-semibold" htmlFor={`edicao-mensagem-${pergunta.id}`}>Pergunta</label>
                          <textarea id={`edicao-mensagem-${pergunta.id}`} className="form-control rounded-3 mb-2" rows={4} value={edicaoPergunta.mensagem} onChange={(event) => setEdicaoPergunta({ ...edicaoPergunta, mensagem: event.target.value })} minLength={2} maxLength={4000} required />
                          <label className="form-label small fw-semibold" htmlFor={`edicao-categoria-${pergunta.id}`}>Categoria</label>
                          <select id={`edicao-categoria-${pergunta.id}`} className="form-select rounded-3 mb-3" value={edicaoPergunta.categoria} onChange={(event) => setEdicaoPergunta({ ...edicaoPergunta, categoria: event.target.value })}>
                            {CATEGORIAS_FORUM.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
                          </select>
                          <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setEdicaoPergunta(null)}>Cancelar</button>
                            <button type="submit" className="btn rounded-pill px-4 text-white" style={{ backgroundColor: '#7c3aed' }}>Salvar</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                            <h3 className="h6 fw-bold mb-0">{pergunta.titulo}</h3>
                            <span className="badge rounded-pill text-capitalize" style={{ backgroundColor: '#f5f3ff', color: '#6d28d9' }}>{pergunta.categoria}</span>
                          </div>
                          <p className="text-body mb-2" style={{ whiteSpace: 'pre-wrap' }}>{pergunta.mensagem_inicial}</p>
                          <div className="d-flex flex-wrap gap-2 small text-muted">
                            <span>{pergunta.autor}</span>
                            <span aria-hidden="true">·</span>
                            <time dateTime={pergunta.criado_em}>{formatarData(pergunta.criado_em)}</time>
                            {pergunta.anonima && pergunta.autor === 'Anônima' && <span className="badge rounded-pill" style={{ backgroundColor: '#fdf4ff', color: '#a21caf' }}>anônima</span>}
                          </div>
                        </>
                      )}
                    </div>
                    {!editando && (
                      <div className="d-flex flex-column gap-1 flex-shrink-0">
                        {pergunta.sou_autor && (
                          <button type="button" className="btn btn-sm btn-link p-1" aria-label="Editar pergunta" title="Editar pergunta" onClick={() => setEdicaoPergunta({ id: pergunta.id, titulo: pergunta.titulo, mensagem: pergunta.mensagem_inicial, categoria: pergunta.categoria })}>
                            <Pencil size={16} className="text-secondary" />
                          </button>
                        )}
                        {(pergunta.sou_autor || moderadora) && (
                          <button type="button" className="btn btn-sm btn-link p-1" aria-label="Excluir pergunta" title="Excluir pergunta" onClick={() => excluirPergunta(pergunta.id)}>
                            <Trash2 size={16} className="text-danger" />
                          </button>
                        )}
                        {!pergunta.sou_autor && (
                          <button type="button" className="btn btn-sm btn-link p-1" aria-label="Denunciar pergunta" title="Denunciar pergunta" onClick={() => abrirDenuncia('topico', pergunta.id)}>
                            <Flag size={16} className="text-secondary" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <button type="button" className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1" style={{ backgroundColor: pergunta.curtiu ? '#fce7f3' : '#f5f3ff', color: pergunta.curtiu ? '#db2777' : '#6d28d9' }} onClick={() => alternarCurtidaPergunta(pergunta.id)} aria-pressed={pergunta.curtiu}>
                      <Heart size={15} fill={pergunta.curtiu ? 'currentColor' : 'none'} /> {pergunta.curtidas}
                    </button>
                    <button type="button" className="btn btn-sm rounded-pill px-3" style={{ backgroundColor: '#f5f3ff', color: '#6d28d9' }} aria-expanded={aberta} onClick={() => setPerguntaAberta(aberta ? null : pergunta.id)}>
                      <MessageCircle size={15} className="me-1" /> {pergunta.mensagens.length} {pergunta.mensagens.length === 1 ? 'resposta' : 'respostas'}
                    </button>
                  </div>

                  {aberta && (
                    <div className="mt-3 pt-3 border-top">
                      {pergunta.mensagens.map((mensagem) => {
                        const editandoResposta = edicaoResposta === mensagem.id;
                        return (
                          <div key={mensagem.id} className="bg-body-tertiary rounded-3 p-3 mb-2">
                            {editandoResposta ? (
                              <form onSubmit={(event) => submeterEdicaoResposta(event, pergunta.id, mensagem.id)}>
                                <textarea className="form-control rounded-3 mb-2" rows={3} value={edicaoTexto} onChange={(event) => setEdicaoTexto(event.target.value)} maxLength={2000} required aria-label="Editar resposta" />
                                <div className="d-flex justify-content-end gap-2">
                                  <button type="button" className="btn btn-sm btn-light rounded-pill px-3" onClick={() => setEdicaoResposta(null)}>Cancelar</button>
                                  <button type="submit" className="btn btn-sm rounded-pill px-3 text-white" style={{ backgroundColor: '#7c3aed' }}>Salvar</button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <p className="mb-2 text-body" style={{ whiteSpace: 'pre-wrap' }}>{mensagem.texto}</p>
                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                  <div className="small text-muted">{mensagem.autor} · <time dateTime={mensagem.criado_em}>{formatarData(mensagem.criado_em)}</time></div>
                                  <div className="d-flex align-items-center gap-2">
                                    <button type="button" className="btn btn-sm btn-link p-0 d-flex align-items-center gap-1" style={{ color: mensagem.curtiu ? '#db2777' : '#6b7280' }} onClick={() => alternarCurtidaResposta(pergunta.id, mensagem.id)} aria-pressed={mensagem.curtiu} aria-label={`Curtir resposta de ${mensagem.autor}`}>
                                      <Heart size={15} fill={mensagem.curtiu ? 'currentColor' : 'none'} /> {mensagem.curtidas}
                                    </button>
                                    {mensagem.sou_autor ? (
                                      <>
                                        <button type="button" className="btn btn-sm btn-link p-1" aria-label="Editar resposta" title="Editar resposta" onClick={() => { setEdicaoResposta(mensagem.id); setEdicaoTexto(mensagem.texto); }}>
                                          <Pencil size={15} className="text-secondary" />
                                        </button>
                                        <button type="button" className="btn btn-sm btn-link p-1" aria-label="Excluir resposta" title="Excluir resposta" onClick={() => excluirResposta(pergunta.id, mensagem.id)}>
                                          <Trash2 size={15} className="text-danger" />
                                        </button>
                                      </>
                                    ) : (
                                      <button type="button" className="btn btn-sm btn-link p-1" aria-label="Denunciar resposta" title="Denunciar resposta" onClick={() => abrirDenuncia('mensagem', mensagem.id)}>
                                        <Flag size={15} className="text-secondary" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                      <form onSubmit={(event) => enviarResposta(event, pergunta.id)} className="d-flex align-items-end gap-2 mt-3">
                        <div className="flex-grow-1">
                          <label className="visually-hidden" htmlFor={`resposta-${pergunta.id}`}>Escreva uma resposta</label>
                          <textarea id={`resposta-${pergunta.id}`} className="form-control rounded-3" rows={2} maxLength={2000} placeholder="Escreva uma resposta..." value={respostas[pergunta.id] || ''} onChange={(event) => setRespostas((atuais) => ({ ...atuais, [pergunta.id]: event.target.value }))} required />
                        </div>
                        <button type="submit" className="btn rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0" aria-label="Enviar resposta" style={{ width: 42, height: 42, backgroundColor: '#7c3aed' }} disabled={enviandoResposta === pergunta.id}>
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

      {denunciaAberta && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }} role="dialog" aria-modal="true" aria-labelledby="denuncia-titulo">
          <div className="bg-body rounded-4 shadow-lg p-4 w-100" style={{ maxWidth: '420px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 id="denuncia-titulo" className="h6 fw-bold mb-0">Denuncar {rotuloTipoDenuncia[denunciaAberta.tipo]}</h2>
              <button type="button" className="btn btn-link p-0" aria-label="Fechar" onClick={() => setDenunciaAberta(null)}><X size={20} /></button>
            </div>
            <form onSubmit={confirmarDenuncia}>
              <label htmlFor="denuncia-motivo" className="form-label small fw-semibold">Motivo</label>
              <select id="denuncia-motivo" className="form-select rounded-3 mb-3" value={motivoDenuncia} onChange={(event) => setMotivoDenuncia(event.target.value)}>
                {MOTIVOS_DENUNCIA.map((motivo) => <option key={motivo} value={motivo}>{motivo}</option>)}
              </select>
              <label htmlFor="denuncia-detalhes" className="form-label small fw-semibold">Detalhes (opcional)</label>
              <textarea id="denuncia-detalhes" className="form-control rounded-3 mb-3" rows={3} maxLength={500} value={detalhesDenuncia} onChange={(event) => setDetalhesDenuncia(event.target.value)} placeholder="Conte o que aconteceu para ajudar a moderação a analisar." />
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setDenunciaAberta(null)}>Cancelar</button>
                <button type="submit" className="btn rounded-pill px-4 text-white" style={{ backgroundColor: '#db2777' }} disabled={enviandoDenuncia}>
                  {enviandoDenuncia ? 'Enviando...' : 'Denunciar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
