import React, { useState } from 'react';
import { MessageSquareHeart, Send } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useNavigate } from 'react-router-dom';
import { enviarFeedbackAoBackend } from '../Services/Api';

export default function TelaFeedback() {
  const [mensagem, setMensagem] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const handleEnviar = async (e) => {
  e.preventDefault();
  setErro('');
  setEnviando(true);
  try {
    await enviarFeedbackAoBackend(mensagem);
    setEnviado(true);
    setTimeout(() => navigate('/home'), 3000);
  } catch (error) {
    setErro(error.message || 'Não foi possível enviar seu feedback. Tente novamente.');
  } finally {
    setEnviando(false);
  }
};

  if (enviado) {
    return (
      <div className="d-flex flex-column h-100 bg-body align-items-center justify-content-center text-center px-4">
        <div className="rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px', backgroundColor: '#dbeafe', color: '#3b82f6' }}>
          <MessageSquareHeart size={40} />
        </div>
        <h3 className="fw-bold" style={{ color: '#4c1d95' }}>Obrigado!</h3>
        <p className="text-muted">Seu feedback foi enviado anonimamente e nos ajudará a melhorar o GestUp.</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100 bg-body-tertiary">
      <TopBar titulo="Deixar Feedback" showBack />
      
      <div className="px-4 py-4 d-flex flex-column flex-grow-1">
        <div className="bg-body p-4 shadow-sm mb-4" style={{ borderRadius: '24px', border: '1px solid #f3f4f6' }}>
          <h5 className="fw-bold text-body mb-2">Como está sendo sua experiência?</h5>
          <p className="text-muted small mb-0">Sua opinião é 100% anônima e muito importante para nós! Não coletamos seu nome ou e-mail neste formulário.</p>
        </div>

        <form onSubmit={handleEnviar} className="d-flex flex-column flex-grow-1">
          {erro && (
            <div className="alert alert-danger rounded-4 py-2 text-center shadow-sm" style={{ fontSize: '0.875rem' }} role="alert">
              {erro}
            </div>
          )}
          <div className="mb-4 flex-grow-1 d-flex flex-column">
            <label className="fw-bold text-body mb-2 ms-1" style={{ fontSize: '0.9rem' }}>Deixe sua sugestão ou crítica:</label>
            <textarea 
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="form-control flex-grow-1 shadow-sm border p-3"
              placeholder="Ex: Gostaria que tivesse mais conteúdos sobre amamentação..."
              style={{ borderRadius: '20px', resize: 'none', backgroundColor: '#fff' }}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn w-100 py-3 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
            style={{ backgroundColor: '#8b5cf6', borderRadius: '50px' }}
            disabled={enviando}
          >
            <Send size={20} /> {enviando ? 'Enviando...' : 'Enviar Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}