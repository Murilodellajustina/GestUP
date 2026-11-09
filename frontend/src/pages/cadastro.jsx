import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { cadastrarUsuario } from "../Services/Api.js";
import { User, Lock, Mail, ChevronLeft, Phone, Calendar } from 'lucide-react';

export default function Cadastrar() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [IdadeGestacional, setIdadeGestacional] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  
  const navigate = useNavigate();

  const handleTelefone = (e) => {
    let valor = e.target.value.replace(/\D/g, ""); 
    if (valor.length > 11) valor = valor.slice(0, 11);
    
    if (valor.length > 2) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    }
    if (valor.length > 9) {
      valor = `${valor.slice(0, 10)}-${valor.slice(10)}`;
    }
    setTelefone(valor);
  };

  async function handleCadastrar(e) {
    e.preventDefault();
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 dígitos.");
      return;
    }

    try {
      await cadastrarUsuario(nome, telefone, IdadeGestacional, email, senha);
      console.log("Cadastro realizado com sucesso!");
      navigate("/login"); 
    } catch (err) {
      setErro("Dados inseridos incorretamente ou erro no servidor.");
      console.error(err);
    }
  }

  return (
    <div className="d-flex flex-column align-items-center h-100 w-100 bg-white overflow-auto">
      <div className="w-100 px-4 py-4 d-flex flex-column flex-grow-1" style={{ maxWidth: '480px' }}>
        
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-light rounded-circle d-flex align-items-center justify-content-center mb-4 border-0 shadow-sm"
          style={{ width: '40px', height: '40px', color: '#4b5563', backgroundColor: '#f8fafc' }}
        >
          <ChevronLeft size={24} />
        </button>

        <div className="mb-4 text-center text-md-start">
          <h1 className="fw-bold mb-2" style={{ color: '#4c1d95' }}>Criar conta</h1>
          <p className="text-muted">Preencha os seus dados para iniciar a sua jornada.</p>
        </div>

        <form onSubmit={handleCadastrar} className="d-flex flex-column flex-grow-1 pb-4">
          
          {erro && (
            <div className="alert alert-danger rounded-4 py-2 text-center shadow-sm" style={{ fontSize: '0.875rem' }} role="alert">
              {erro}
            </div>
          )}

          <div className="position-relative mb-3">
            <User className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
            <input 
              type="text" 
              placeholder="Nome completo" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="form-control py-3 ps-5 border-light shadow-sm" 
              style={{ borderRadius: '20px', backgroundColor: '#f8fafc' }}
              required 
            />
          </div>

          <div className="position-relative mb-3">
            <Phone className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
            <input 
              type="tel" 
              placeholder="Telefone: (99) 99999-9999" 
              value={telefone}
              onChange={handleTelefone}
              className="form-control py-3 ps-5 border-light shadow-sm" 
              style={{ borderRadius: '20px', backgroundColor: '#f8fafc' }}
              required 
            />
          </div>

          <div className="position-relative mb-3">
            <Calendar className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
            <input 
              type="date" 
              placeholder="Idade Gestacional" 
              value={IdadeGestacional}
              onChange={(e) => setIdadeGestacional(e.target.value)}
              className="form-control py-3 ps-5 border-light shadow-sm text-muted" 
              style={{ borderRadius: '20px', backgroundColor: '#f8fafc' }}
              required 
            />
          </div>

          <div className="position-relative mb-3">
            <Mail className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
            <input 
              type="email" 
              placeholder="E-mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control py-3 ps-5 border-light shadow-sm" 
              style={{ borderRadius: '20px', backgroundColor: '#f8fafc' }}
              required 
            />
          </div>

          <div className="position-relative mb-3">
            <Lock className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
            <input 
              type="password" 
              placeholder="Senha" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="form-control py-3 ps-5 border-light shadow-sm" 
              style={{ borderRadius: '20px', backgroundColor: '#f8fafc' }}
              required 
            />
          </div>

          <div className="position-relative mb-4">
            <Lock className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
            <input 
              type="password" 
              placeholder="Confirme a senha" 
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="form-control py-3 ps-5 border-light shadow-sm" 
              style={{ borderRadius: '20px', backgroundColor: '#f8fafc' }}
              required 
            />
          </div>

          <div className="mt-2">
            <button 
              type="submit" 
              className="btn w-100 py-3 fw-bold shadow-sm mb-4 text-white"
              style={{ backgroundColor: '#8b5cf6', borderRadius: '50px' }}
            >
              Criar Conta
            </button>
            
            <p className="text-center text-muted small">
              Já tem uma conta?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/login')} 
                className="btn btn-link p-0 fw-bold text-decoration-none"
                style={{ color: '#7c3aed' }}
              >
                Fazer login
              </button>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}