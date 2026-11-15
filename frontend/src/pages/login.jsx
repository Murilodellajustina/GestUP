import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { login } from "../Services/Api.js";
import { User, Lock, Eye, Heart } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");

    try {
      await login(email, senha);
      navigate("/home");
    } catch (err) {
      setErro(err.message || "Credenciais inválidas.");
      if (senha.length < 6) setErro("A senha deve ter 6 dígitos!");
      console.error(err);
    }
  }

  return (
    <div className="d-flex flex-column align-items-center h-100 w-100 bg-body overflow-auto">
      <div className="w-100 px-4 py-5 d-flex flex-column flex-grow-1" style={{ maxWidth: '480px' }}>
        
        <div className="mt-2 mb-5 text-center text-md-start">
          <h1 className="fw-bold mb-2" style={{ color: '#4c1d95' }}>Bem-vinda!</h1>
          <p className="text-muted">Faça o seu login para continuar no GestUp.</p>
        </div>

        <form onSubmit={handleLogin} className="d-flex flex-column flex-grow-1">
          
          {erro && (
            <div className="alert alert-danger rounded-4 py-2 text-center shadow-sm" style={{ fontSize: '0.875rem' }} role="alert">
              {erro}
            </div>
          )}

          <div className="mb-3">
            <div className="position-relative mb-3">
              <User className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
              <input 
                type="text" 
                placeholder="E-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control py-3 ps-5 border shadow-sm"
                style={{ borderRadius: '20px', backgroundColor: '#f8fafc' }}
                required
              />
            </div>

            <div className="position-relative">
              <Lock className="position-absolute top-50 translate-middle-y ms-3" size={20} style={{ color: '#a78bfa' }} />
              <input 
                type="password" 
                placeholder="Senha" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="form-control py-3 ps-5 pe-5 border shadow-sm"
                style={{ borderRadius: '20px', backgroundColor: '#f8fafc' }}
                required
              />
              <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-muted">
                <Eye size={20} />
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-start mb-5">
            <button type="button" className="btn btn-link text-decoration-none p-0 fw-medium" style={{ color: '#7c3aed', fontSize: '0.875rem' }}>
              Esqueceu sua senha?
            </button>
          </div>

          <button 
            type="submit" 
            className="btn w-100 py-3 fw-bold shadow-sm mb-4 text-white"
            style={{ backgroundColor: '#8b5cf6', borderRadius: '50px' }}
          >
            Entrar
          </button>

          <div className="d-flex align-items-center mb-4">
            <hr className="flex-grow-1 text-muted opacity-25" />
            <span className="mx-3 text-muted small fw-medium">ou</span>
            <hr className="flex-grow-1 text-muted opacity-25" />
          </div>

          <button 
            type="button" 
            onClick={() => navigate('/cadastro')}
            className="btn w-100 py-3 fw-bold bg-body shadow-sm"
            style={{ border: '2px solid #ede9fe', color: '#6b7280', borderRadius: '50px' }}
          >
            Criar conta
          </button>
        </form>

        <div className="mt-5 pb-3 d-flex justify-content-center align-items-center" style={{ color: '#c4b5fd' }}>
          <img
              src="/src/imgs/Gestante em forma de coração e G.png"
              alt="Logo"
              style={{ width: "50px" }}
            />
          <span className="ms-2 fw-bold" style={{ color: '#f65ccd' }}>GestUp</span>
        </div>
      </div>
    </div>
  );
}