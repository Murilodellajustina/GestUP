import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react';
import TopBar from '../components/TopBar';

export default function TelaExamesRecomendados() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column h-100 bg-body-tertiary">
      <TopBar titulo="Exames recomendados" showBack />
      
      <div className="px-4 py-3">
        <div className="d-flex bg-secondary bg-opacity-10 p-1 rounded-pill mb-4">
          <button className="btn w-50 rounded-pill text-white fw-medium border-0" style={{ backgroundColor: '#8b5cf6', fontSize: '0.85rem' }}>Por trimestre</button>
          <button 
            onClick={() => navigate('/consultas')}
            className="btn w-50 rounded-pill text-secondary fw-medium border-0" style={{ fontSize: '0.85rem' }}
          >
            Lista completa
          </button>
        </div>

        <div className="bg-body shadow-sm mb-3 overflow-hidden" style={{ borderRadius: '24px', border: '1px solid #f3f4f6' }}>
          <div className="p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f5f3ff', borderBottom: '1px solid #ede9fe' }}>
            <h6 className="fw-bold mb-0" style={{ color: '#4c1d95', fontSize: '0.85rem' }}>1º trimestre (até 13 semanas)</h6>
            <ChevronDown size={20} style={{ color: '#7c3aed' }} />
          </div>
          <div className="p-4 d-flex flex-column gap-3">
            {[
              "Hemograma completo", 
              "Tipagem sanguínea e fator Rh", 
              "Glicemia de jejum", 
              "Exame de urina", 
              "Sorologias (HIV, sífilis, hepatites)", 
              "Ultrassom obstétrico"
            ].map((exame, idx) => (
              <div key={idx} className="d-flex align-items-center gap-2">
                <CheckCircle2 size={18} style={{ color: '#14b8a6' }} className="flex-shrink-0" />
                <span className="text-body fw-medium" style={{ fontSize: '0.85rem' }}>{exame}</span>
              </div>
            ))}
            
            <div className="mt-3 p-3 d-flex gap-2 align-items-start" style={{ backgroundColor: '#f5f3ff', borderRadius: '16px', border: '1px solid #ede9fe' }}>
              <ShieldAlert size={18} style={{ color: '#8b5cf6' }} className="flex-shrink-0 mt-1" />
              <p className="mb-0 text-secondary fw-medium" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                Importante: os exames podem variar de acordo com cada caso. Sempre siga a orientação do seu médico.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-body p-3 shadow-sm d-flex justify-content-between align-items-center mb-2" style={{ borderRadius: '16px', border: '1px solid #f3f4f6' }}>
          <h6 className="fw-bold text-body mb-0" style={{ fontSize: '0.85rem' }}>2º trimestre <span className="text-muted fw-normal ms-1">(14 a 27 semanas)</span></h6>
          <ChevronRight size={20} className="text-muted" />
        </div>

        <div className="bg-body p-3 shadow-sm d-flex justify-content-between align-items-center" style={{ borderRadius: '16px', border: '1px solid #f3f4f6' }}>
          <h6 className="fw-bold text-body mb-0" style={{ fontSize: '0.85rem' }}>3º trimestre <span className="text-muted fw-normal ms-1">(28 a 41 semanas)</span></h6>
          <ChevronRight size={20} className="text-muted" />
        </div>
      </div>
    </div>
  );
}