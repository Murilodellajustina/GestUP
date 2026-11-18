import { useState } from "react";

const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:8000"
        : "https://gest-up-topaz.vercel.app";

export async function login(email, senha) {

    const response = await fetch(
        `${API_URL}/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                senha
            })
        }
    );

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("usuario_id", data.usuario.id);
        localStorage.setItem("papel", data.usuario.papel || "gestante");
        return data;
    } else {
        const erro = await response.json();
        throw new Error(erro.detail);
    }

}

export async function cadastrarUsuario(nome, telefone, IdadeGestacional, email, senha) {

    const response = await fetch(
        `${API_URL}/cadastro`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                telefone,
                IdadeGestacional,
                email,
                senha
            })
        }
    );

    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.detail);
    }

    return response.json();
}

export async function buscarPerfilUsuario() {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("usuario_id");

    if (!token || !usuarioId) {
        throw new Error("Usuário não autenticado");
    }

    const response = await fetch(`${API_URL}/usuarios/${usuarioId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        }
    });

    if (response.ok) {
        return await response.json();
    } else {
        throw new Error("Erro ao buscar dados do usuário");
    }
}

async function requisicaoEventos(path = '', options = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/eventos${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });
    if (!response.ok) {
        const erro = await response.json().catch(() => ({}));
        throw new Error(erro.detail || 'Não foi possível salvar o evento.');
    }
    if (response.status === 204) return null;
    return response.json();
}

export async function atualizarPerfilUsuario(dados) {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("usuario_id");
    const response = await fetch(`${API_URL}/usuarios/${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(dados)
    });
    if (!response.ok) throw new Error("Erro ao atualizar dados");
    return response.json();
}

export async function enviarFeedbackAoBackend(mensagem) {
    const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem })
    });
    if (!response.ok) throw new Error("Erro ao enviar feedback");
    return response.json();
}

export async function buscarConfiguracoesBackend() {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("usuario_id");
    const response = await fetch(`${API_URL}/configuracoes/${usuarioId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) return response.json();
    return null;
}

export async function salvarConfiguracoesBackend(configs) {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("usuario_id");
    await fetch(`${API_URL}/configuracoes/${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(configs)
    });
}

export async function buscarNotificacoesBackend() {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("usuario_id");
    const response = await fetch(`${API_URL}/notificacoes/${usuarioId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
        const notificacoes = await response.json();
        const lidas = JSON.parse(localStorage.getItem("notificacoesLidas") || "[]");
        return notificacoes.filter(n => !lidas.includes(n.id));
    }
    return [];
}

export function marcarNotificacoesComoLidas(notificacoes) {
    const lidasAntigas = JSON.parse(localStorage.getItem("notificacoesLidas") || "[]");
    const novasLidas = notificacoes.map(n => n.id);
    
    const todasLidas = [...new Set([...lidasAntigas, ...novasLidas])];
    localStorage.setItem("notificacoesLidas", JSON.stringify(todasLidas));
    
    window.dispatchEvent(new Event("notificacoesAtualizadas"));
}

export const listarEventosGestacao = () => requisicaoEventos();
export const criarEventoGestacao = (evento) => requisicaoEventos('', { method: 'POST', body: JSON.stringify(evento) });
export const atualizarEventoGestacao = (id, evento) => requisicaoEventos(`/${id}`, { method: 'PUT', body: JSON.stringify(evento) });
export const marcarEventoRealizado = (id, realizado) => requisicaoEventos(`/${id}/realizado?realizado=${realizado}`, { method: 'PATCH' });
export const excluirEventoGestacao = (id) => requisicaoEventos(`/${id}`, { method: 'DELETE' });

async function requisicaoComunidade(path = '', options = {}) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Entre na sua conta para participar do GesBlog.');
    const response = await fetch(`${API_URL}/comunidade${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });
    const dados = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(dados.detail || 'Não foi possível concluir a ação no GesBlog.');
    return dados;
}

// Categorias e motivos precisam ser iguais aos aceitos pelo backend
export const CATEGORIAS_FORUM = ['1º trimestre', '2º trimestre', '3º trimestre', 'pós-parto', 'alimentação', 'emocional', 'outros'];
export const MOTIVOS_DENUNCIA = ['conteúdo ofensivo', 'desinformação', 'assédio ou constrangimento', 'spam', 'outro'];

export const souModeradora = () => localStorage.getItem('papel') === 'admin';

export const listarPerguntasForum = () => requisicaoComunidade('/topicos');
export const criarPerguntaForum = (dados) => requisicaoComunidade('/topicos', {
    method: 'POST',
    body: JSON.stringify(dados)
});
export const atualizarPerguntaForum = (id, dados) => requisicaoComunidade(`/topicos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados)
});
export const excluirPerguntaForum = (id) => requisicaoComunidade(`/topicos/${id}`, { method: 'DELETE' });
export const enviarRespostaForum = (perguntaId, texto) => requisicaoComunidade(`/topicos/${perguntaId}/mensagens`, {
    method: 'POST',
    body: JSON.stringify({ texto })
});
export const excluirRespostaForum = (id) => requisicaoComunidade(`/mensagens/${id}`, { method: 'DELETE' });
export const atualizarRespostaForum = (id, dados) => requisicaoComunidade(`/mensagens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados)
});
export const curtirPerguntaForum = (id) => requisicaoComunidade(`/topicos/${id}/curtir`, { method: 'POST' });
export const curtirRespostaForum = (id) => requisicaoComunidade(`/mensagens/${id}/curtir`, { method: 'POST' });
export const denunciarConteudoForum = (dados) => requisicaoComunidade('/denuncias', {
    method: 'POST',
    body: JSON.stringify(dados)
});

async function requisicaoModeracao(path = '', options = {}) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Entre na sua conta para acessar a moderação.');
    const response = await fetch(`${API_URL}/moderacao${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });
    const dados = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(dados.detail || 'Não foi possível concluir a ação na moderação.');
    return dados;
}

export const listarDenunciasModeracao = (statusFiltro = 'pendente') =>
    requisicaoModeracao(`/denuncias?status_filtro=${encodeURIComponent(statusFiltro)}`);
export const resolverDenunciaModeracao = (id, acao) => requisicaoModeracao(`/denuncias/${id}/resolver`, {
    method: 'POST',
    body: JSON.stringify({ acao })
});
