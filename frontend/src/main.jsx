import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import AppLayout from './layouts/AppLayout'

import Landingpage from './pages/Landingpage'
import Login from './pages/login'
import Cadastrar from './pages/cadastro'

import TelaInicial from './pages/telaInicial'
import TelaGestacao from './pages/telaGestacao'
import TelaConsultas from './pages/telaConsultas'
import TelaForum from './pages/telaForum'
import TelaModeracao from './pages/telaModeracao'
import TelaPerfil from './pages/telaPerfil'
import TelaSintomas from './pages/telaSintomas'
import TelaSobre from './pages/telaSobre'
import TelaExamesRecomendados from './pages/telaExamesRecomendados'
import TelaFeedback from './pages/telaFeedback'
import TelaMeusDados from './pages/telaMeusDados'
import TelaNotificacoes from './pages/telaNotificacoes'
import TelaConfiguracoes from './pages/telaConfiguracoes'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="vh-100 d-flex justify-content-center bg-secondary bg-opacity-10">
        <div className="bg-body h-100 position-relative d-flex flex-column overflow-hidden shadow-lg" style={{ width: '100%', maxWidth: '2000px' }}>
          
          <Routes>
            <Route path="/" element={<Landingpage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastrar />} />

            <Route element={<AppLayout />}>
              <Route path="/home" element={<TelaInicial />} />
              <Route path="/gestacao" element={<TelaGestacao />} />
              <Route path="/consultas" element={<TelaConsultas />} />
              <Route path="/forum" element={<TelaForum />} />
              <Route path="/moderacao" element={<TelaModeracao />} />
              <Route path="/perfil" element={<TelaPerfil />} />
              <Route path="/sintomas" element={<TelaSintomas />} />
              <Route path="/sobre" element={<TelaSobre />} />
              <Route path="/exames" element={<TelaExamesRecomendados />} />
              <Route path="/feedback" element={<TelaFeedback />} />
              <Route path="/meus-dados" element={<TelaMeusDados />} />
              <Route path="/notificacoes" element={<TelaNotificacoes />} />
              <Route path="/configuracoes" element={<TelaConfiguracoes />} />
            </Route>

            {/* Rotas antigas continuam funcionando para quem tinha link salvo */}
            <Route path="/conteudos" element={<Navigate to="/forum" replace />} />
            <Route path="/comunidade" element={<Navigate to="/forum" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

        </div>
      </div>
    </BrowserRouter>
  </React.StrictMode>,
)
