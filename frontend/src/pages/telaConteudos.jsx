import React, { useMemo, useState } from 'react';
import { Activity, BookOpen, ChevronDown, ExternalLink, Heart, Search } from 'lucide-react';
import TopBar from '../components/TopBar';

const categorias = ['Todos', 'Alimentação', 'Saúde', 'Preparação'];

const conteudosBase = [
  {
    id: 'alimentacao',
    titulo: 'Alimentação na gestação',
    resumo: 'Informações sobre alimentação adequada e saudável durante a gravidez.',
    categoria: 'Alimentação',
    duracao: 'Leitura rápida',
    icone: Heart,
    corFundo: '#fef3c7',
    corIcone: '#ca8a04',
    detalhes: 'O Ministério da Saúde reúne orientações para apoiar escolhas alimentares saudáveis durante a gestação. As necessidades variam; converse com a equipe que acompanha seu pré-natal para receber orientação adequada ao seu caso.',
    fonte: 'https://www.gov.br/saude/pt-br/assuntos/noticias/2022/julho/guia-alimentar-habitos-saudaveis-podem-evitar-complicacoes-durante-a-gravidez',
    textoFonte: 'Ver orientação do Ministério da Saúde',
  },
  {
    id: 'pre-natal',
    titulo: 'Acompanhamento pré-natal',
    resumo: 'Entenda a importância do acompanhamento durante a gestação.',
    categoria: 'Saúde',
    duracao: 'Leitura rápida',
    icone: BookOpen,
    corFundo: '#ede9fe',
    corIcone: '#7c3aed',
    detalhes: 'O pré-natal acompanha a saúde da gestante e do bebê ao longo da gravidez. A equipe de saúde pode orientar sobre consultas, exames, vacinas e dúvidas em cada etapa.',
    fonte: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/g/gravidez/pre-natal',
    textoFonte: 'Ver informações sobre pré-natal',
  },
  {
    id: 'atividade-fisica',
    titulo: 'Atividade física na gravidez',
    resumo: 'Cuidados importantes para conversar com a equipe antes de se exercitar.',
    categoria: 'Saúde',
    duracao: 'Leitura rápida',
    icone: Activity,
    corFundo: '#dbeafe',
    corIcone: '#2563eb',
    detalhes: 'A Caderneta Brasileira da Gestante traz orientações sobre atividade física e cuidados de segurança. Antes de iniciar ou mudar uma atividade, converse com a equipe do pré-natal, que poderá considerar suas condições individuais.',
    fonte: 'https://www.gov.br/saude/pt-br/composicao/saps/publicacoes/cadernetas-e-cartoes/caderneta-brasileira-da-gestante.pdf',
    textoFonte: 'Abrir a Caderneta Brasileira da Gestante',
  },
  {
    id: 'preparacao',
    titulo: 'Preparação para o parto e o pós-parto',
    resumo: 'Converse com a equipe sobre seus planos, dúvidas e rede de apoio.',
    categoria: 'Preparação',
    duracao: 'Leitura rápida',
    icone: Heart,
    corFundo: '#fce7f3',
    corIcone: '#db2777',
    detalhes: 'A preparação pode incluir conversas sobre o parto, amamentação, cuidados com o bebê e apoio disponível. A equipe que acompanha o pré-natal pode ajudar a planejar conforme suas necessidades e preferências.',
    fonte: 'https://linhasdecuidado.saude.gov.br/portal/pre-natal-baixo-risco/unidade-de-atencao-primaria/planejamento-terapeutico/',
    textoFonte: 'Ver orientações de cuidado pré-natal',
  },
];

const temasExtras = [
  ['Hidratação e escolhas alimentares', 'Alimentação', 'Informações gerais para conversar sobre alimentação e hidratação no pré-natal.'],
  ['Frutas, verduras e variedade', 'Alimentação', 'A variedade de alimentos pode fazer parte de uma alimentação adequada e saudável.'],
  ['Feijão e comida de verdade', 'Alimentação', 'O Guia Alimentar ajuda a reconhecer alimentos in natura e preparações caseiras.'],
  ['Rótulos e alimentos ultraprocessados', 'Alimentação', 'Saiba onde encontrar orientações oficiais sobre alimentos ultraprocessados.'],
  ['Náuseas e desconfortos digestivos', 'Alimentação', 'Converse com a equipe sobre enjoos, vômitos ou dificuldade para se alimentar.'],
  ['Alimentação e ganho de peso', 'Alimentação', 'O acompanhamento do peso faz parte do cuidado pré-natal individualizado.'],
  ['Ferro e anemia na gestação', 'Alimentação', 'Entenda por que exames e avaliação profissional são importantes para investigar anemia.'],
  ['Segurança alimentar na gravidez', 'Alimentação', 'Tire dúvidas sobre cuidados com alimentos com a equipe que acompanha sua gestação.'],
  ['Consultas de pré-natal', 'Saúde', 'As consultas acompanham a saúde da gestante e do bebê ao longo da gravidez.'],
  ['Exames do pré-natal', 'Saúde', 'Conheça os principais exames que podem ser solicitados durante o acompanhamento.'],
  ['Vacinas durante a gestação', 'Saúde', 'Confira as orientações oficiais de vacinação e atualize seu cartão com a equipe de saúde.'],
  ['Saúde bucal na gravidez', 'Saúde', 'A saúde bucal também faz parte do cuidado integral durante o pré-natal.'],
  ['Pressão arterial e acompanhamento', 'Saúde', 'A aferição da pressão pode fazer parte da avaliação nas consultas pré-natais.'],
  ['Diabetes gestacional', 'Saúde', 'O pré-natal inclui avaliações que ajudam a identificar alterações da glicemia.'],
  ['Tipagem sanguínea e fator Rh', 'Saúde', 'Entenda por que informações sobre tipo sanguíneo e fator Rh são registradas no pré-natal.'],
  ['Infecções e exames preventivos', 'Saúde', 'Converse com a equipe sobre exames, prevenção e tratamentos seguros na gestação.'],
  ['Saúde emocional na gravidez', 'Saúde', 'Mudanças emocionais podem ser conversadas com a equipe de saúde durante o pré-natal.'],
  ['Rede de apoio e bem-estar', 'Saúde', 'Identificar pessoas de confiança pode ajudar a organizar o apoio durante a gestação.'],
  ['Sono e descanso', 'Saúde', 'Compartilhe com a equipe dúvidas sobre sono, cansaço ou desconfortos que afetem seu descanso.'],
  ['Mudanças do corpo na gestação', 'Saúde', 'A Caderneta explica mudanças do corpo e situações que merecem avaliação profissional.'],
  ['Sinais de alerta na gestação', 'Saúde', 'Aprenda a reconhecer situações descritas pelo Ministério da Saúde que precisam de atendimento.'],
  ['Movimentos do bebê', 'Saúde', 'Acompanhe as orientações da Caderneta sobre movimentos do bebê e quando buscar atendimento.'],
  ['Medicamentos e automedicação', 'Saúde', 'Antes de usar ou interromper medicamentos, converse com um profissional de saúde.'],
  ['Álcool, tabaco e outras substâncias', 'Saúde', 'Converse sem julgamento com a equipe de saúde para receber acolhimento e apoio.'],
  ['Sexualidade durante a gestação', 'Saúde', 'A Caderneta aborda sexualidade e cuidados que podem ser conversados no pré-natal.'],
  ['Trabalho e direitos na gestação', 'Saúde', 'Conheça informações sobre direitos da gestante e onde buscar orientação.'],
  ['Cartão da gestante', 'Saúde', 'Use a Caderneta para registrar informações e apoiar a comunicação com os serviços de saúde.'],
  ['Como organizar dúvidas para a consulta', 'Saúde', 'Anotar dúvidas e sintomas ajuda a conversar com a equipe durante o atendimento.'],
  ['Acompanhamento após o nascimento', 'Saúde', 'O cuidado continua depois do parto, incluindo consultas e atenção à saúde da mãe e do bebê.'],
  ['Planejando o parto', 'Preparação', 'Conversar sobre preferências e dúvidas pode ajudar a construir um plano de parto com a equipe.'],
  ['Sinais de que o parto se aproxima', 'Preparação', 'Conheça informações gerais sobre sinais do trabalho de parto na Caderneta da Gestante.'],
  ['Vias de nascimento', 'Preparação', 'Entenda as vias de nascimento e converse sobre as opções com a equipe que acompanha você.'],
  ['Fases do trabalho de parto', 'Preparação', 'A Caderneta explica as fases do trabalho de parto e cuidados durante esse período.'],
  ['Direitos durante o parto', 'Preparação', 'Conheça direitos e práticas de cuidado descritos nos materiais oficiais para gestantes.'],
  ['Escolha da maternidade de referência', 'Preparação', 'Converse no pré-natal sobre o serviço de referência e como chegar até ele.'],
  ['Pessoa acompanhante no parto', 'Preparação', 'Informe-se sobre acompanhamento e acolhimento durante o parto nos serviços de saúde.'],
  ['Bolsa e documentos para a maternidade', 'Preparação', 'Organize documentos e itens importantes com antecedência e conforme a orientação local.'],
  ['Plano de pós-parto', 'Preparação', 'Planeje consultas, apoio em casa e cuidados após o nascimento junto à sua rede de apoio.'],
  ['Amamentação: primeiros passos', 'Preparação', 'A Caderneta reúne orientações sobre amamentação e apoio para a alimentação do bebê.'],
  ['Apoio à amamentação', 'Preparação', 'Procure apoio da equipe de saúde diante de dúvidas ou dificuldades para amamentar.'],
  ['Contato pele a pele', 'Preparação', 'Conheça o contato pele a pele e converse com a equipe sobre os cuidados no nascimento.'],
  ['Cuidados com o recém-nascido', 'Preparação', 'A Caderneta aborda os primeiros cuidados e o acompanhamento do bebê após o nascimento.'],
  ['Registro de nascimento do bebê', 'Preparação', 'Informe-se sobre os documentos e procedimentos para obter a Certidão de Nascimento.'],
  ['Acompanhamento do bebê na UBS', 'Preparação', 'Saiba como a Unidade Básica de Saúde participa do acompanhamento do bebê após o nascimento.'],
  ['Contracepção no pós-parto', 'Preparação', 'Converse com um profissional sobre planejamento reprodutivo após o nascimento.'],
  ['Emoções no pós-parto', 'Preparação', 'O bem-estar emocional também merece atenção e acolhimento após o nascimento.'],
];

const estiloPorCategoria = {
  'Alimentação': { icone: Heart, corFundo: '#fef3c7', corIcone: '#ca8a04' },
  'Saúde': { icone: Activity, corFundo: '#dbeafe', corIcone: '#2563eb' },
  'Preparação': { icone: BookOpen, corFundo: '#ede9fe', corIcone: '#7c3aed' },
};

const fonteGeral = 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-mulher/publicacoes/caderneta-brasileira-da-gestante.pdf/view';

const conteudos = [
  ...conteudosBase,
  ...temasExtras.map(([titulo, categoria, resumo], indice) => ({
    id: `conteudo-${indice + 1}`,
    titulo,
    resumo,
    categoria,
    duracao: 'Leitura rápida',
    ...estiloPorCategoria[categoria],
    detalhes: `${resumo} Este resumo é informativo e não substitui avaliação individual. Consulte a Caderneta Brasileira da Gestante e converse com a equipe do pré-natal sobre suas dúvidas.`,
    fonte: fonteGeral,
    textoFonte: 'Abrir a Caderneta Brasileira da Gestante',
  })),
];

export default function TelaConteudos() {
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [conteudoAberto, setConteudoAberto] = useState(null);

  const conteudosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');

    return conteudos.filter((conteudo) => {
      const correspondeCategoria = categoriaAtiva === 'Todos' || conteudo.categoria === categoriaAtiva;
      const textoBusca = `${conteudo.titulo} ${conteudo.resumo} ${conteudo.categoria}`.toLocaleLowerCase('pt-BR');
      return correspondeCategoria && textoBusca.includes(termo);
    });
  }, [busca, categoriaAtiva]);

  return (
    <div className="d-flex flex-column h-100 bg-body-tertiary overflow-auto">
      <TopBar titulo="Conteúdos" showBack />

      <main className="px-4 py-3 mx-auto w-100" style={{ maxWidth: '760px' }}>
        <div className="position-relative mb-4">
          <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={20} aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar conteúdos"
            placeholder="Buscar conteúdo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="form-control py-3 ps-5 border shadow-sm"
            style={{ borderRadius: '50px', fontSize: '0.875rem' }}
          />
        </div>

        <div className="d-flex gap-2 mb-4 overflow-auto pb-1" aria-label="Filtrar por categoria" style={{ scrollbarWidth: 'none' }}>
          {categorias.map((categoria) => {
            const ativa = categoriaAtiva === categoria;
            return (
              <button
                key={categoria}
                type="button"
                aria-pressed={ativa}
                onClick={() => setCategoriaAtiva(categoria)}
                className={`btn rounded-pill px-4 py-1 fw-medium ${ativa ? 'text-white border-0' : 'text-secondary bg-body border'}`}
                style={{ backgroundColor: ativa ? '#7c3aed' : undefined, fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                {categoria}
              </button>
            );
          })}
        </div>

        {conteudosFiltrados.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {conteudosFiltrados.map((conteudo) => {
              const Icone = conteudo.icone;
              const aberto = conteudoAberto === conteudo.id;

              return (
                <article key={conteudo.id} className="bg-body p-3 shadow-sm" style={{ borderRadius: '20px', border: '1px solid #f3f4f6' }}>
                  <button
                    type="button"
                    aria-expanded={aberto}
                    aria-controls={`detalhe-${conteudo.id}`}
                    onClick={() => setConteudoAberto(aberto ? null : conteudo.id)}
                    className="btn p-0 border-0 bg-transparent text-start w-100 d-flex align-items-center gap-3"
                  >
                    <span className="rounded d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '60px', height: '60px', backgroundColor: conteudo.corFundo, color: conteudo.corIcone, borderRadius: '16px' }}>
                      <Icone size={24} aria-hidden="true" />
                    </span>
                    <span className="flex-grow-1">
                      <span className="d-block fw-bold text-body mb-1" style={{ fontSize: '0.95rem' }}>{conteudo.titulo}</span>
                      <span className="d-block text-muted" style={{ fontSize: '0.8rem' }}>{conteudo.resumo}</span>
                      <span className="d-block text-muted mt-1" style={{ fontSize: '0.75rem' }}>{conteudo.duracao} · {conteudo.categoria}</span>
                    </span>
                    <ChevronDown className="text-muted flex-shrink-0" size={20} style={{ transform: aberto ? 'rotate(180deg)' : undefined, transition: 'transform 150ms ease' }} aria-hidden="true" />
                  </button>

                  {aberto && (
                    <div id={`detalhe-${conteudo.id}`} className="mt-3 pt-3 border-top">
                      <p className="text-body mb-3" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{conteudo.detalhes}</p>
                      <a href={conteudo.fonte} target="_blank" rel="noreferrer" className="btn btn-sm rounded-pill px-3" style={{ color: '#6d28d9', backgroundColor: '#f5f3ff' }}>
                        {conteudo.textoFonte} <ExternalLink size={14} className="ms-1" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-body rounded-4 p-4 text-center shadow-sm">
            <Search className="text-muted mb-2" size={28} aria-hidden="true" />
            <p className="fw-semibold text-body mb-1">Nenhum conteúdo encontrado</p>
            <p className="text-muted small mb-0">Tente outro termo ou selecione uma categoria diferente.</p>
          </div>
        )}
      </main>
    </div>
  );
}
