import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react';
import TopBar from '../components/TopBar';

const trimestres = [
  {
    id: '1',
    titulo: '1º trimestre',
    periodo: 'até 13 semanas',
    exames: [
      'Hemograma completo',
      'Tipagem sanguínea e fator Rh',
      'Glicemia de jejum',
      'Exame de urina',
      'Sorologias (HIV, sífilis, hepatites)',
      'Ultrassom obstétrico'
    ]
  },
  {
    id: '2',
    titulo: '2º trimestre',
    periodo: '14 a 27 semanas',
    exames: [
      'Glicemia de jejum ou curva glicêmica (TOTG, entre 24 e 28 semanas)',
      'Hemograma completo',
      'Urocultura',
      'Sorologias conforme indicação da equipe',
      'Ultrassom morfológico (entre 20 e 24 semanas)'
    ]
  },
  {
    id: '3',
    titulo: '3º trimestre',
    periodo: '28 a 41 semanas',
    exames: [
      'Hemograma completo',
      'Glicemia de jejum',
      'Urocultura',
      'Repetição de sorologias (HIV e sífilis, conforme recomendação)',
      'Ultrassom obstétrico com estimativa de peso',
      'Cardiotocografia, quando indicada'
    ]
  }
];

export default function TelaExamesRecomendados() {
  const navigate = useNavigate();
  const [aberto, setAberto] = useState('1');

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

        {trimestres.map((trimestre) => {
          const expandido = aberto === trimestre.id;
          const Icone = expandido ? ChevronDown : ChevronRight;
          return (
            <div key={trimestre.id} className="bg-body shadow-sm mb-3 overflow-hidden" style={{ borderRadius: '24px', border: '1px solid #f3f4f6' }}>
              <button
                type="button"
                className="btn w-100 p-3 d-flex justify-content-between align-items-center border-0"
                style={{ backgroundColor: expandido ? '#f5f3ff' : 'transparent', borderBottom: expandido ? '1px solid #ede9fe' : 'none' }}
                aria-expanded={expandido}
                aria-controls={`painel-${trimestre.id}`}
                onClick={() => setAberto(expandido ? null : trimestre.id)}
              >
                <h6 className="fw-bold mb-0" style={{ color: '#4c1d95', fontSize: '0.85rem' }}>
                  {trimestre.titulo} <span className="fw-normal text-muted ms-1">({trimestre.periodo})</span>
                </h6>
                <Icone size={20} style={{ color: '#7c3aed' }} />
              </button>

              {expandido && (
                <div id={`painel-${trimestre.id}`} className="p-4 d-flex flex-column gap-3">
                  {trimestre.exames.map((exame) => (
                    <div key={exame} className="d-flex align-items-center gap-2">
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
