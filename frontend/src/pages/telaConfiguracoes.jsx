import React, { useState, useEffect } from 'react';
import { Moon, Mail, Smartphone, Type } from 'lucide-react';
import TopBar from '../components/TopBar';
import { buscarConfiguracoesBackend, salvarConfiguracoesBackend } from '../Services/Api';

export default function TelaConfiguracoes() {
  const [carregando, setCarregando] = useState(true);
  const aplicarTema = (escuro) => {
    const tema = escuro ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', tema);
    localStorage.setItem('temaGestUp', tema);
  };
  const aplicarTextoGrande = (ativo) => {
    document.documentElement.setAttribute('data-texto-grande', ativo ? 'true' : 'false');
    localStorage.setItem('textoGrandeGestUp', String(ativo));
  };
  const [configs, setConfigs] = useState({
    modoNoturno: localStorage.getItem('temaGestUp') === 'dark',
    textoGrande: localStorage.getItem('textoGrandeGestUp') === 'true',
    notificacoesPush: true,
    lembretesEmail: false
  });


  useEffect(() => {
    buscarConfiguracoesBackend()
      .then((data) => {
        if (data) {
          const textoGrande = data.textoGrande ?? localStorage.getItem('textoGrandeGestUp') === 'true';
          setConfigs({
            modoNoturno: data.modoNoturno ?? false,
            textoGrande,
            notificacoesPush: data.notificacoesPush ?? true,
            lembretesEmail: data.lembretesEmail ?? false
          });
          aplicarTema(data.modoNoturno ?? false);
          aplicarTextoGrande(textoGrande);
        }
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const toggleConfig = async (chave) => {
    const novasConfigs = { ...configs, [chave]: !configs[chave] };
    setConfigs(novasConfigs);

    if (chave === 'modoNoturno') aplicarTema(novasConfigs.modoNoturno);
    if (chave === 'textoGrande') aplicarTextoGrande(novasConfigs.textoGrande);
    try {
      await salvarConfiguracoesBackend(novasConfigs);
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      if (chave !== 'textoGrande') setConfigs(configs);
    }
  };

  return (
    <div className="d-flex flex-column h-100 bg-body-tertiary">
      <TopBar titulo="Configurações" showBack />

      <div className="px-4 py-3 overflow-auto">

        {carregando ? (
          <div className="text-center text-muted mt-4">Carregando preferências...</div>
        ) : (
          <>
            <h6 className="fw-bold text-muted mb-3 ms-2 mt-2" style={{ fontSize: '0.85rem' }}>VISUAL</h6>
            <div className="bg-body shadow-sm overflow-hidden mb-4" style={{ borderRadius: '24px', border: '1px solid #f3f4f6' }}>

              <div className="d-flex align-items-center justify-content-between p-3 border-bottom border">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded p-2" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}><Moon size={20} /></div>
                  <span className="fw-medium text-body" style={{ fontSize: '0.9rem' }}>Modo Noturno</span>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                    checked={configs.modoNoturno}
                    onChange={() => toggleConfig('modoNoturno')}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded p-2" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}><Type size={20} /></div>
                  <span className="fw-medium text-body" style={{ fontSize: '0.9rem' }}>Texto Maior</span>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                    checked={configs.textoGrande}
                    onChange={() => toggleConfig('textoGrande')}
                  />
                </div>
              </div>
            </div>

            <h6 className="fw-bold text-muted mb-3 ms-2" style={{ fontSize: '0.85rem' }}>NOTIFICAÇÕES</h6>
            <div className="bg-body shadow-sm overflow-hidden mb-4" style={{ borderRadius: '24px', border: '1px solid #f3f4f6' }}>

              <div className="d-flex align-items-center justify-content-between p-3 border-bottom border">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded p-2" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}><Smartphone size={20} /></div>
                  <div>
                    <span className="fw-medium text-body d-block" style={{ fontSize: '0.9rem' }}>Notificações no Celular</span>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>Avisos sobre consultas e semanas</span>
                  </div>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                    checked={configs.notificacoesPush}
                    onChange={() => toggleConfig('notificacoesPush')}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded p-2" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}><Mail size={20} /></div>
                  <span className="fw-medium text-body" style={{ fontSize: '0.9rem' }}>Lembretes por E-mail</span>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    style={{ width: '40px', height: '20px', cursor: 'pointer' }}
                    checked={configs.lembretesEmail}
                    onChange={() => toggleConfig('lembretesEmail')}
                  />
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
