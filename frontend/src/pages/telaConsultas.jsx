import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Circle, CheckCircle2, Plus, X, Download, Pencil, Trash2, Clock3, MapPin, Stethoscope } from 'lucide-react';
import TopBar from '../components/TopBar';
import { buscarPerfilUsuario, criarEventoGestacao, excluirEventoGestacao, listarEventosGestacao, marcarEventoRealizado, atualizarEventoGestacao } from '../Services/Api';

const formatDate = (value) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
const dateKey = (value) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
const blankForm = { titulo: '', tipo: 'consulta', data: dateKey(new Date()), horario: '', clinica: '', observacoes: '' };

const exames = [
  { titulo: 'Ultrassom transvaginal obstétrico', inicio: 6, fim: 12, detalhe: 'Geralmente considerado no início da gestação, conforme indicação clínica.' },
  { titulo: 'Translucência nucal', inicio: 11, fim: 13 + 6 / 7, detalhe: 'Janela: 11 semanas a 13 semanas e 6 dias.' },
  { titulo: 'Morfológico do 1º trimestre', inicio: 11, fim: 13 + 6 / 7, detalhe: 'Janela: 11 semanas a 13 semanas e 6 dias.' },
  { titulo: 'Morfológico do 2º trimestre', inicio: 20, fim: 24, detalhe: 'Janela informada: 20 a 24 semanas.' },
  { titulo: 'Ultrassom obstétrico abdominal', inicio: 12, fim: 40, detalhe: 'A partir de 12 semanas, se solicitado pela equipe.' },
  { titulo: 'Ultrassom obstétrico com Doppler', inicio: 11, fim: 40, detalhe: 'Pode ser indicado a partir de 11 semanas, conforme avaliação profissional.' },
  { titulo: 'Ultrassom transvaginal para medida do colo', inicio: 1, fim: 40, detalhe: 'Pode ser realizado em qualquer idade gestacional, quando indicado.' }
];

function calcularSugestoes( dum, idade ) {
  const hoje = new Date();
  const hojeKey = dateKey(hoje);
  const sugestoesExames = exames.flatMap((exame) => {
    if (!dum) return [];
    const semanasAlvo = Math.max(0, Math.ceil(exame.inicio * 7 - idade));
    const data = new Date(`${hojeKey}T12:00:00`);
    data.setDate(data.getDate() + semanasAlvo * 7);
    if (idade > exame.fim * 7 || (idade >= exame.inicio * 7 && idade <= exame.fim * 7)) {
      data.setTime(new Date(`${hojeKey}T12:00:00`).getTime());
    }
    const dia = Math.floor(idade / 7);
    if (dia > exame.fim * 7) return [];
    return [{ ...exame, data: dateKey(data), periodo: `Semanas ${exame.inicio}–${Math.floor(exame.fim)}${exame.fim % 1 ? ' + 6 dias' : ''}` }];
  });
  const intervaloConsulta = idade < 28 * 7 ? 28 : idade < 36 * 7 ? 14 : 7;
  const dataConsulta = new Date(`${hojeKey}T12:00:00`);
  dataConsulta.setDate(dataConsulta.getDate() + intervaloConsulta);
  const consultas = [{ titulo: 'Próxima consulta de pré-natal', tipo: 'consulta', data: dateKey(dataConsulta), detalhe: idade < 28 * 7 ? 'Sugestão de intervalo mensal até 28 semanas.' : idade < 36 * 7 ? 'Sugestão de intervalo quinzenal entre 28 e 36 semanas.' : 'Sugestão de intervalo semanal a partir de 36 semanas.' }];
  return { exames: sugestoesExames, consultas };
}

function exportarIcs(evento) {
  const inicio = evento.data.replaceAll('-', '') + (evento.horario ? `T${evento.horario.replace(':', '')}00` : 'T120000');
  const fimDate = new Date(`${evento.data}T${evento.horario || '12:00'}:00`);
  fimDate.setHours(fimDate.getHours() + 1);
  const fim = dateKey(fimDate).replaceAll('-', '') + (evento.horario ? `T${String(fimDate.getHours()).padStart(2, '0')}${String(fimDate.getMinutes()).padStart(2, '0')}00` : 'T130000');
  const escape = (texto = '') => texto.replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n');
  const conteudo = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GestUp//Calendario gestacional//PT-BR', 'BEGIN:VEVENT', `UID:${evento.id}@gestup`, `DTSTAMP:${new Date().toISOString().replaceAll('-', '').replaceAll(':', '').replace(/\.\d{3}/, '')}`, `DTSTART:${inicio}`, `DTEND:${fim}`, `SUMMARY:${escape(evento.titulo)}`, `LOCATION:${escape(evento.clinica || '')}`, `DESCRIPTION:${escape(evento.observacoes || evento.tipo)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const blob = new Blob([conteudo], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${evento.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function TelaConsultas() {
  const [eventos, setEventos] = useState([]);
  const [dum, setDum] = useState(null);
  const [idadeDias, setIdadeDias] = useState(null);
  const [mes, setMes] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [diaSelecionado, setDiaSelecionado] = useState(dateKey(new Date()));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    const lista = await listarEventosGestacao();
    setEventos(lista);
  };

  useEffect(() => {
    carregar().catch((e) => setErro(e.message));
    buscarPerfilUsuario().then((perfil) => {
      if (perfil.idadeGestacional) {
        const data = new Date(`${String(perfil.idadeGestacional).slice(0, 10)}T12:00:00`);
        setDum(data);
        setIdadeDias(Math.floor((new Date(`${dateKey(new Date())}T12:00:00`) - data) / 86400000));
      }
    }).catch(() => {});
  }, []);

  const datasMes = useMemo(() => {
    const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const inicio = new Date(primeiro);
    inicio.setDate(primeiro.getDate() - primeiro.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + index);
      return dia;
    });
  }, [mes]);
  const eventosDia = eventos.filter((evento) => evento.data === diaSelecionado);
  const eventosMes = eventos.filter((evento) => evento.data.slice(0, 7) === dateKey(mes).slice(0, 7));
  const hoje = dateKey(new Date());
  const sugestoes = calcularSugestoes(dum, idadeDias ?? 0);

  const abrirNovo = (dados = {}) => {
    setEditando(null);
    setForm({ ...blankForm, data: diaSelecionado, ...dados });
    setErro('');
    setModal(true);
  };
  const abrirEdicao = (evento) => {
    setEditando(evento.id);
    setForm({ titulo: evento.titulo, tipo: evento.tipo, data: evento.data, horario: evento.horario || '', clinica: evento.clinica || '', observacoes: evento.observacoes || '' });
    setModal(true);
  };
  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      if (editando) await atualizarEventoGestacao(editando, form);
      else await criarEventoGestacao(form);
      await carregar();
      setDiaSelecionado(form.data);
      setMes(new Date(`${form.data}T12:00:00`));
      setModal(false);
    } catch (error) { setErro(error.message); }
    finally { setSalvando(false); }
  };
  const alternarRealizado = async (evento) => {
    try { await marcarEventoRealizado(evento.id, !evento.realizado); await carregar(); }
    catch (error) { setErro(error.message); }
  };
  const remover = async (evento) => {
    if (!window.confirm(`Excluir “${evento.titulo}”?`)) return;
    try { await excluirEventoGestacao(evento.id); await carregar(); }
    catch (error) { setErro(error.message); }
  };
  const adicionarSugestao = (item, tipo) => abrirNovo({ titulo: item.titulo, tipo, data: item.data });

  return <div className="d-flex flex-column h-100 bg-light">
    <TopBar titulo="Consultas e exames" showBack />
    <main className="px-3 px-sm-4 py-3" style={{ overflowY: 'auto', paddingBottom: 96 }}>
      {erro && <div className="alert alert-warning rounded-4 py-2" role="alert">{erro}</div>}
      <section className="bg-white p-3 shadow-sm mb-3" style={{ borderRadius: 22 }} aria-label="Calendário mensal">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-light rounded-circle p-2" aria-label="Mês anterior" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}><ChevronLeft size={19} /></button>
          <h2 className="h6 fw-bold text-capitalize mb-0">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mes)}</h2>
          <button className="btn btn-light rounded-circle p-2" aria-label="Próximo mês" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}><ChevronRight size={19} /></button>
        </div>
        <div className="calendar-grid text-center">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, i) => <div key={`${dia}${i}`} className="text-muted small fw-semibold py-1">{dia}</div>)}
          {datasMes.map((data) => {
            const chave = dateKey(data);
            const temEvento = eventos.some((evento) => evento.data === chave);
            const selecionado = chave === diaSelecionado;
            return <button key={chave} type="button" onClick={() => { setDiaSelecionado(chave); if (data.getMonth() !== mes.getMonth()) setMes(new Date(data.getFullYear(), data.getMonth(), 1)); }} aria-label={`${data.getDate()}${temEvento ? ', há evento' : ''}`} aria-pressed={selecionado} className="calendar-day btn p-0 d-flex flex-column align-items-center justify-content-center mx-auto" style={{ width: 38, height: 42, color: selecionado ? '#fff' : data.getMonth() === mes.getMonth() ? '#292536' : '#c4c1cc', backgroundColor: selecionado ? '#7c3aed' : 'transparent', borderRadius: 12, fontWeight: chave === hoje ? 700 : 400 }}>
              {data.getDate()}<span style={{ height: 5, width: 5, borderRadius: '50%', backgroundColor: temEvento ? (selecionado ? '#fff' : '#8b5cf6') : 'transparent' }} />
            </button>;
          })}
        </div>
        <div className="d-flex justify-content-between align-items-center border-top mt-3 pt-3">
          <div><p className="fw-bold mb-0" style={{ fontSize: '.9rem' }}>{diaSelecionado === hoje ? 'Hoje' : formatDate(diaSelecionado)}</p><p className="small text-muted mb-0">{eventosMes.length} {eventosMes.length === 1 ? 'evento no mês' : 'eventos no mês'}</p></div>
          <button onClick={() => abrirNovo()} className="btn text-white rounded-pill px-3" style={{ backgroundColor: '#7c3aed' }}><Plus size={17} /> Adicionar</button>
        </div>
      </section>

      <section className="mb-4">
        <h2 className="h6 fw-bold mb-3">{eventosDia.length ? 'Agenda do dia' : 'Nenhum evento neste dia'}</h2>
        <div className="d-flex flex-column gap-2">
          {eventosDia.map((evento) => {
            const dias = Math.ceil((new Date(`${evento.data}T12:00:00`) - new Date(`${hoje}T12:00:00`)) / 86400000);
            const alerta = !evento.realizado && dias >= 0 && dias < 7;
            return <article key={evento.id} className="bg-white p-3 shadow-sm" style={{ borderRadius: 18, border: alerta ? '1px solid #fecaca' : '1px solid #f3f4f6', background: alerta ? '#fff1f2' : '#fff' }}>
              <div className="d-flex gap-3 align-items-start">
                <button onClick={() => alternarRealizado(evento)} className="btn p-0 border-0" aria-label={evento.realizado ? 'Marcar como pendente' : 'Marcar como realizado'}>{evento.realizado ? <CheckCircle2 size={23} color="#0d9488" /> : <Circle size={23} color={alerta ? '#dc2626' : '#aaa4b5'} />}</button>
                <div className="flex-grow-1">
                  {alerta && <span className="badge text-bg-danger mb-2">Em menos de 7 dias</span>}
                  <h3 className="fw-bold mb-1" style={{ fontSize: '.95rem', color: evento.realizado ? '#64748b' : '#302b3c', textDecoration: evento.realizado ? 'line-through' : 'none' }}>{evento.titulo}</h3>
                  <div className="d-flex flex-wrap gap-3 small text-muted">
                    {evento.horario && <span><Clock3 size={14} className="me-1" />{evento.horario}</span>}
                    {evento.clinica && <span><MapPin size={14} className="me-1" />{evento.clinica}</span>}
                  </div>
                  {evento.observacoes && <p className="small text-muted mt-2 mb-0">{evento.observacoes}</p>}
                </div>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm btn-light p-2" aria-label="Editar evento" onClick={() => abrirEdicao(evento)}><Pencil size={15} /></button>
                  <button className="btn btn-sm btn-light p-2" aria-label="Adicionar ao calendário do dispositivo" onClick={() => exportarIcs(evento)}><Download size={15} /></button>
                  <button className="btn btn-sm btn-light text-danger p-2" aria-label="Excluir evento" onClick={() => remover(evento)}><Trash2 size={15} /></button>
                </div>
              </div>
            </article>;
          })}
        </div>
      </section>

      <section className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1"><Stethoscope size={19} color="#7c3aed" /><h2 className="h6 fw-bold mb-0">Sugestões para sua fase</h2></div>
        <p className="small text-muted mb-3">Sugestões baseadas na idade gestacional. Confirme cada indicação e data com sua equipe de pré-natal.</p>
        {!dum && <div className="small text-muted bg-white p-3 rounded-4">Cadastre sua DUM no perfil para personalizar as sugestões por semana.</div>}
        {dum && !eventos.some((evento) => evento.tipo === 'consulta') && <div className="bg-white p-3 shadow-sm mb-2 d-flex gap-3 align-items-center" style={{ borderRadius: 17 }}><div className="flex-grow-1"><p className="fw-bold mb-1" style={{ fontSize: '.9rem' }}>Primeira consulta de pré-natal</p><p className="small text-muted mb-1">Se ainda não iniciou o pré-natal, procure a unidade de saúde para agendar. O início precoce é recomendado.</p></div><button className="btn btn-sm rounded-pill" style={{ color: '#7c3aed', background: '#f5f3ff' }} onClick={() => abrirNovo({ titulo: 'Primeira consulta de pré-natal', tipo: 'consulta', data: hoje })}>Agendar</button></div>}
        {sugestoes.consultas.map((item) => <div key={item.titulo} className="bg-white p-3 shadow-sm mb-2 d-flex gap-3 align-items-center" style={{ borderRadius: 17 }}><div className="flex-grow-1"><p className="fw-bold mb-1" style={{ fontSize: '.9rem' }}>{item.titulo}</p><p className="small text-muted mb-1">{item.detalhe}</p><span className="small" style={{ color: '#7c3aed' }}>Sugestão: {formatDate(item.data)}</span></div><button className="btn btn-sm rounded-pill" style={{ color: '#7c3aed', background: '#f5f3ff' }} onClick={() => adicionarSugestao(item, 'consulta')}>Adicionar</button></div>)}
        {sugestoes.exames.map((item) => <div key={item.titulo} className="bg-white p-3 shadow-sm mb-2 d-flex gap-3 align-items-center" style={{ borderRadius: 17 }}><div className="flex-grow-1"><p className="fw-bold mb-1" style={{ fontSize: '.9rem' }}>{item.titulo}</p><p className="small text-muted mb-1">{item.detalhe}</p><span className="small" style={{ color: '#7c3aed' }}>{item.periodo} · {formatDate(item.data)}</span></div><button className="btn btn-sm rounded-pill" style={{ color: '#7c3aed', background: '#f5f3ff' }} onClick={() => adicionarSugestao(item, 'exame')}>Adicionar</button></div>)}
        <p className="small text-muted mt-3">As janelas de ultrassom são referências informativas. Nem todos os exames são indicados para todas as gestações. Confirme com sua equipe.</p>
        <p className="small mb-0"><a href="https://linhasdecuidado.saude.gov.br/portal/pre-natal-baixo-risco/unidade-de-atencao-primaria/planejamento-terapeutico/" target="_blank" rel="noreferrer">Orientações de pré-natal do Ministério da Saúde</a></p>
      </section>
    </main>

    {modal && <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end align-items-sm-center justify-content-center" style={{ zIndex: 1100, background: 'rgba(20,16,30,.48)' }} onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
      <section className="bg-white w-100 p-4" style={{ maxWidth: 520, borderRadius: '24px 24px 0 0', maxHeight: '92vh', overflowY: 'auto' }} role="dialog" aria-modal="true" aria-labelledby="form-evento-title">
        <div className="d-flex justify-content-between align-items-center mb-3"><h2 id="form-evento-title" className="h5 fw-bold mb-0">{editando ? 'Editar evento' : 'Novo evento'}</h2><button className="btn btn-light rounded-circle p-2" onClick={() => setModal(false)} aria-label="Fechar"><X size={19} /></button></div>
        <form onSubmit={salvar}>
          <label className="form-label small fw-semibold">Tipo</label><select className="form-select mb-3" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}><option value="consulta">Consulta</option><option value="exame">Exame</option></select>
          <label className="form-label small fw-semibold">Nome da consulta ou exame</label><input className="form-control mb-3" required maxLength="160" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex.: Pré-natal, ultrassom…" />
          <div className="row g-3"><div className="col-7"><label className="form-label small fw-semibold">Data</label><input type="date" className="form-control" required value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></div><div className="col-5"><label className="form-label small fw-semibold">Horário</label><input type="time" className="form-control" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} /></div></div>
          <label className="form-label small fw-semibold mt-3">Clínica ou local</label><input className="form-control mb-3" maxLength="160" value={form.clinica} onChange={(e) => setForm({ ...form, clinica: e.target.value })} placeholder="Nome e endereço, se desejar" />
          <label className="form-label small fw-semibold">Observações</label><textarea className="form-control mb-3" rows="2" maxLength="1000" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Instruções ou lembretes" />
          {erro && <p className="small text-danger" role="alert">{erro}</p>}
          <button disabled={salvando} className="btn w-100 py-3 fw-bold text-white rounded-pill" style={{ backgroundColor: '#7c3aed' }}>{salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Salvar na agenda'}</button>
        </form>
      </section>
    </div>}
    <style>{`.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));row-gap:2px}.calendar-day{font-size:.85rem}`}</style>
  </div>;
}
