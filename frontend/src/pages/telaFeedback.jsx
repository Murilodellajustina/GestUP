import React, { useState } from 'react';
import { MessageSquareHeart, Send } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useNavigate } from 'react-router-dom';
import { enviarFeedbackAoBackend } from '../Services/Api';

export default function TelaFeedback() {
  const [mensagem, setMensagem] = useState('');
  const [enviado, setEnviado] = useState(false);
  const navigate = useNavigate();

  const handleEnviar = async (e) => {
  e.preventDefault();
  await enviarFeedbackAoBackend(mensagem);
  setEnviado(true);
  setTimeout(() => navigate('/home'), 3000);
};

  if (enviado) {
    return (
      <div className="d-flex flex-column h-100 bg-white align-items-center justify-content-center text-center px-4">
        <div className="rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px', backgroundColor: '#dbeafe', color: '#3b82f6' }}>
          <MessageSquareHeart size={40} />
        </div>
        <h3 className="fw-bold" style={{ color: '#4c1d95' }}>Obrigado!</h3>
        <p className="text-muted">Seu feedback foi enviado anonimamente e nos ajudará a melhorar o GestarUp.</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100 bg-light">
      <TopBar titulo="Deixar Feedback" showBack />
      
      <div className="px-4 py-4 d-flex flex-column flex-grow-1">
        <div className="bg-white p-4 shadow-sm mb-4" style={{ borderRadius: '24px', border: '1px solid #f3f4f6' }}>
          <h5 className="fw-bold text-dark mb-2">Como está sendo sua experiência?</h5>
          <p className="text-muted small mb-0">Sua opinião é 100% anônima e muito importante para nós! Não coletamos seu nome ou e-mail neste formulário.</p>
        </div>

        <form onSubmit={handleEnviar} className="d-flex flex-column flex-grow-1">
          <div className="mb-4 flex-grow-1 d-flex flex-column">
            <label className="fw-bold text-dark mb-2 ms-1" style={{ fontSize: '0.9rem' }}>Deixe sua sugestão ou crítica:</label>
            <textarea 
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="form-control flex-grow-1 shadow-sm border-light p-3"
              placeholder="Ex: Gostaria que tivesse mais conteúdos sobre amamentação..."
              style={{ borderRadius: '20px', resize: 'none', backgroundColor: '#fff' }}
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="btn w-100 py-3 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
            style={{ backgroundColor: '#8b5cf6', borderRadius: '50px' }}
          >
            <Send size={20} /> Enviar Feedback
          </button>
        </form>
      </div>
    </div>
  );
}