import React from 'react';
import { Search, PlayCircle, Activity, Heart } from 'lucide-react';
import TopBar from '../components/TopBar';

export default function TelaConteudos() {
  return (
    <div className="d-flex flex-column h-100 bg-body-tertiary">
      <TopBar titulo="Conteúdos" showBack />
      
      <div className="px-4 py-3">
        <div className="position-relative mb-4">
          <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Buscar conteúdo..." 
            className="form-control py-3 ps-5 border shadow-sm"
            style={{ borderRadius: '50px', fontSize: '0.875rem' }}
          />
        </div>

        <div className="d-flex gap-2 mb-4 overflow-auto" style={{ scrollbarWidth: 'none' }}>
          <button className="btn rounded-pill px-4 py-1 text-white fw-medium border-0" style={{ backgroundColor: '#7c3aed', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Todos</button>
          <button className="btn rounded-pill px-4 py-1 text-secondary fw-medium bg-body border" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Alimentação</button>
          <button className="btn rounded-pill px-4 py-1 text-secondary fw-medium bg-body border" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Saúde</button>
          <button className="btn rounded-pill px-4 py-1 text-secondary fw-medium bg-body border" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Preparação</button>
        </div>

        <div className="bg-body shadow-sm overflow-hidden mb-4" style={{ borderRadius: '24px', border: '1px solid #f3f4f6' }}>
          <div className="position-relative d-flex align-items-center justify-content-center" style={{ height: '160px', backgroundColor: '#fed7aa' }}>
            <div className="position-absolute w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}></div>
            <PlayCircle size={48} className="text-white position-relative opacity-75" style={{ zIndex: 1 }} />
            <div className="position-absolute bottom-0 start-0 w-100 p-3 text-white" style={{ zIndex: 1 }}>
              <h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>Alimentação na gestação</h5>
              <p className="mb-0" style={{ fontSize: '0.75rem', opacity: 0.9 }}>O que comer e o que evitar?</p>
            </div>
          </div>
          <div className="p-3 d-flex justify-content-between align-items-center text-muted fw-medium" style={{ fontSize: '0.75rem' }}>
            <span>10 min • Saúde</span>
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          <div className="bg-body p-2 shadow-sm d-flex align-items-center gap-3" style={{ borderRadius: '20px', border: '1px solid #f3f4f6' }}>
            <div className="rounded d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', backgroundColor: '#fef08a', color: '#ca8a04', borderRadius: '16px' }}>
              <Heart size={24} />
            </div>
            <div>
              <h6 className="fw-bold text-body mb-1" style={{ fontSize: '0.9rem' }}>Como lidar com a ansiedade</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>8 min • Saúde</p>
            </div>
          </div>

          <div className="bg-body p-2 shadow-sm d-flex align-items-center gap-3" style={{ borderRadius: '20px', border: '1px solid #f3f4f6' }}>
            <div className="rounded d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '16px' }}>
              <Activity size={24} />
            </div>
            <div>
              <h6 className="fw-bold text-body mb-1" style={{ fontSize: '0.9rem' }}>Atividade física na gravidez</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>7 min • Bem-estar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}