import React from 'react';
import { Heart } from 'lucide-react';
import TopBar from '../components/TopBar';

export default function TelaSobre() {
  return (
    <div className="d-flex flex-column h-100 bg-body">
      <TopBar titulo="Sobre" showBack />
      
      <div className="d-flex flex-column align-items-center justify-content-center px-4 py-5 flex-grow-1 text-center">
        <div className="d-flex align-items-center gap-2 mb-2" style={{ color: '#7c3aed' }}>
          <Heart size={48} fill="currentColor" />
        </div>
        <h1 className="display-6 fw-bold mb-2" style={{ color: '#4c1d95' }}>GestUp</h1>
        <p className="fw-medium mb-5 small" style={{ color: '#7c3aed' }}>
          Cuidando de você <br /> e do seu bebê, em cada etapa.
        </p>

        <p className="text-muted small mb-5 px-3" style={{ lineHeight: '1.6' }}>
          O GestUp é um projeto de extensão do IFSC, desenvolvido em parceria com o CISAMURES, com o objetivo de oferecer informação, apoio e acompanhamento para gestantes da região serrana.
        </p>

        <div className="d-flex align-items-center justify-content-center gap-4 mb-5 opacity-75">
          <div className="bg-body-tertiary rounded d-flex align-items-center justify-content-center text-muted fw-bold shadow-sm" style={{ height: '45px', width: '120px', fontSize: '11px' }}>
            IFSC
          </div>
          <div className="bg-body-tertiary rounded d-flex align-items-center justify-content-center text-muted fw-bold shadow-sm" style={{ height: '45px', width: '120px', fontSize: '11px' }}>
            CISAMURES
          </div>
        </div>

        <button className="btn w-100 py-3 fw-bold text-white shadow-sm" style={{ maxWidth: '280px', backgroundColor: '#f472b6', borderRadius: '50px' }}>
          Juntos por um futuro<br /> mais saudável.
        </button>
      </div>
    </div>
  );
}