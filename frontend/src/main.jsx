import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

import AppLayout from './layouts/AppLayout'

import Landingpage from './pages/Landingpage'
import Login from './pages/login'
import Cadastrar from './pages/cadastro'

import TelaInicial from './pages/telaInicial'
import TelaGestacao from './pages/telaGestacao'
import TelaConsultas from './pages/telaConsultas'
import TelaConteudos from './pages/telaConteudos'
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
        <div className="bg-white h-100 position-relative d-flex flex-column overflow-hidden shadow-lg" style={{ width: '100%', maxWidth: '2000px' }}>
          
          <Routes>
            <Route path="/" element={<Landingpage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastrar />} />

            <Route element={<AppLayout />}>
              <Route path="/home" element={<TelaInicial />} />
              <Route path="/gestacao" element={<TelaGestacao />} />
              <Route path="/consultas" element={<TelaConsultas />} />
              <Route path="/conteudos" element={<TelaConteudos />} />
              <Route path="/perfil" element={<TelaPerfil />} />
              <Route path="/sintomas" element={<TelaSintomas />} />
              <Route path="/sobre" element={<TelaSobre />} />
              <Route path="/exames" element={<TelaExamesRecomendados />} />
              <Route path="/feedback" element={<TelaFeedback />} />
              <Route path="/meus-dados" element={<TelaMeusDados />} />
              <Route path="/notificacoes" element={<TelaNotificacoes />} />
              <Route path="/configuracoes" element={<TelaConfiguracoes />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

        </div>
      </div>
    </BrowserRouter>
  </React.StrictMode>,
)