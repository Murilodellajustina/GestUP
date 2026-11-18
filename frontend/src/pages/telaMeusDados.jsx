import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Save } from 'lucide-react';
import TopBar from '../components/TopBar';
import { buscarPerfilUsuario, atualizarPerfilUsuario } from '../Services/Api';

export default function TelaMeusDados() {
  const [dados, setDados] = useState({
    nome: "",
    email: "",
    telefone: "",
    idadeGestacional: ""
  });

  const [editando, setEditando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
  buscarPerfilUsuario().then(data => {
    setDados({
      nome: data.nome || "",
      email: data.email || "",
      telefone: data.telefone || "",
      idadeGestacional: data.idadeGestacional || ""
    });
  }).catch(console.error);
}, []);

const handleSalvar = async (e) => {
  e.preventDefault();
  setErro("");
  try {
    await atualizarPerfilUsuario({
      nome: dados.nome,
      telefone: dados.telefone,
      idadeGestacional: dados.idadeGestacional
    });
    setEditando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  } catch (error) {
    console.error(error);
    setErro("Não foi possível salvar. Verifique sua conexão e tente novamente.");
  }
};

  return (
    <div className="d-flex flex-column h-100 bg-body-tertiary">
      <TopBar titulo="Meus dados" showBack />
      
      <div className="px-4 py-4 overflow-auto">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <p className="text-muted mb-0 small">Visualize ou altere suas informações pessoais.</p>
          <button 
            onClick={() => setEditando(!editando)}
            className="btn btn-sm fw-bold"
            style={{ color: '#7c3aed', backgroundColor: '#f5f3ff', borderRadius: '12px' }}
          >
            {editando ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {salvo && (
          <div className="alert alert-success rounded-4 py-2 text-center shadow-sm" style={{ fontSize: '0.875rem' }} role="status">
            Dados atualizados com sucesso!
          </div>
        )}

        {erro && (
          <div className="alert alert-danger rounded-4 py-2 text-center shadow-sm" style={{ fontSize: '0.875rem' }} role="alert">
            {erro}
          </div>
        )}

        <form onSubmit={handleSalvar} className="d-flex flex-column gap-3">
          <div className="position-relative">
            <User className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
            <label className="visually-hidden" htmlFor="dado-nome">Nome completo</label>
            <input
              id="dado-nome"
              type="text"
              placeholder="Nome completo"
              value={dados.nome}
              onChange={(e) => setDados({...dados, nome: e.target.value})}
              disabled={!editando}
              className="form-control py-3 ps-5 shadow-sm"
              autoComplete="name"
              style={{ borderRadius: '20px', backgroundColor: editando ? '#fff' : '#f8fafc', border: '1px solid #e5e7eb' }}
            />
          </div>

          <div className="position-relative">
            <Mail className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
            <label className="visually-hidden" htmlFor="dado-email">E-mail</label>
            <input
              id="dado-email"
              type="email"
              placeholder="E-mail"
              value={dados.email}
              disabled
              className="form-control py-3 ps-5 shadow-sm text-muted"
              style={{ borderRadius: '20px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb' }}
            />
          </div>

          <div className="position-relative">
            <Phone className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
            <label className="visually-hidden" htmlFor="dado-telefone">Telefone</label>
            <input
              id="dado-telefone"
              type="tel"
              placeholder="Telefone"
              value={dados.telefone}
              onChange={(e) => setDados({...dados, telefone: e.target.value})}
              disabled={!editando}
              className="form-control py-3 ps-5 shadow-sm"
              autoComplete="tel"
              style={{ borderRadius: '20px', backgroundColor: editando ? '#fff' : '#f8fafc', border: '1px solid #e5e7eb' }}
            />
          </div>

          <div className="position-relative">
            <Calendar className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
            <label className="visually-hidden" htmlFor="dado-dum">Data da última menstruação (DUM)</label>
            <input
              id="dado-dum"
              type="date"
              value={dados.idadeGestacional}
              onChange={(e) => setDados({...dados, idadeGestacional: e.target.value})}
              disabled={!editando}
              className="form-control py-3 ps-5 shadow-sm"
              style={{ borderRadius: '20px', backgroundColor: editando ? '#fff' : '#f8fafc', border: '1px solid #e5e7eb' }}
            />
          </div>

          {editando && (
            <button 
              type="submit" 
              className="btn w-100 py-3 mt-3 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
              style={{ backgroundColor: '#8b5cf6', borderRadius: '50px' }}
            >
              <Save size={20} /> Salvar Alterações
            </button>
          )}
        </form>
      </div>
    </div>
  );
}