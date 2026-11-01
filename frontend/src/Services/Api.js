import { useState } from "react";


export async function login(email, senha) {

    const response = await fetch(
        "http://localhost:8000/login",
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
        return data;
    } else {
        const erro = await response.json();
        throw new Error(erro.detail);
    }

}

export async function cadastrarUsuario(nome, telefone, IdadeGestacional, email, senha) {

    const response = await fetch(
        "http://localhost:8000/cadastro",
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

    const response = await fetch(`http://localhost:8000/usuarios/${usuarioId}`, {
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
    const response = await fetch(`http://localhost:8000/eventos${path}`, {
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

export const listarEventosGestacao = () => requisicaoEventos();
export const criarEventoGestacao = (evento) => requisicaoEventos('', { method: 'POST', body: JSON.stringify(evento) });
export const atualizarEventoGestacao = (id, evento) => requisicaoEventos(`/${id}`, { method: 'PUT', body: JSON.stringify(evento) });
export const marcarEventoRealizado = (id, realizado) => requisicaoEventos(`/${id}/realizado?realizado=${realizado}`, { method: 'PATCH' });
export const excluirEventoGestacao = (id) => requisicaoEventos(`/${id}`, { method: 'DELETE' });
