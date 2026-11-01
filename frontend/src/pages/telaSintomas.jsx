import React, { useState } from 'react';
import {
  AlertTriangle, ArrowUpRight, Baby, Brain, CheckCircle2,
  Droplets, HeartPulse, Info, Leaf, ShieldAlert, Smile, Thermometer,
  Utensils, Wind
} from 'lucide-react';
import TopBar from '../components/TopBar';

const sintomasComuns = [
  { icon: HeartPulse, title: 'Enjoos e vômitos leves', texto: 'São frequentes, principalmente no início, e muitas vezes melhoram depois do primeiro trimestre.', dica: 'Faça pequenas refeições ao longo do dia e beba líquidos em goles. Procure orientação se não conseguir manter líquidos.' },
  { icon: Utensils, title: 'Azia', texto: 'A digestão pode ficar mais lenta e o útero em crescimento pode favorecer o refluxo.', dica: 'Prefira porções menores e evite se deitar logo após comer. Converse com a equipe antes de usar medicamentos.' },
  { icon: Brain, title: 'Cansaço e sono', texto: 'O corpo passa por mudanças importantes; o cansaço é comum, sobretudo no começo e no fim da gestação.', dica: 'Descanse quando puder e conte esse sintoma no pré-natal se for intenso ou vier acompanhado de falta de ar.' },
  { icon: Droplets, title: 'Urinar com mais frequência', texto: 'Mudanças hormonais e a pressão do útero sobre a bexiga podem aumentar a vontade de urinar.', dica: 'Não reduza a ingestão de água. Ardor, dor ou febre junto com a vontade de urinar precisam de avaliação.' },
  { icon: HeartPulse, title: 'Seios sensíveis', texto: 'Sensibilidade e aumento dos seios podem ocorrer por causa das alterações hormonais.', dica: 'Um sutiã confortável pode ajudar. Se aparecer vermelhidão, calor local ou febre, procure orientação.' },
  { icon: Smile, title: 'Mudanças de humor', texto: 'Oscilações emocionais podem acontecer durante a gestação.', dica: 'Compartilhe como está se sentindo nas consultas. Tristeza ou ansiedade persistentes merecem apoio profissional.' },
  { icon: Leaf, title: 'Intestino preso', texto: 'Alterações hormonais podem deixar o intestino mais lento.', dica: 'Água, fibras e movimento orientado pela equipe podem ajudar. Converse com a equipe se persistir.' },
  { icon: Baby, title: 'Desconforto lombar leve', texto: 'Mudanças na postura e no peso do corpo podem causar dor leve nas costas.', dica: 'Evite carregar peso e peça orientação sobre posições e atividade física segura.' }
];

const sinaisAlerta = [
  { icon: Droplets, titulo: 'Sangramento ou perda de líquido pela vagina', texto: 'Procure atendimento imediatamente, mesmo que o sangramento seja pequeno ou não haja dor.' },
  { icon: AlertTriangle, titulo: 'Dor abdominal forte ou persistente', texto: 'Precisa de avaliação imediata, especialmente se vier com contrações, sangramento ou mal-estar.' },
  { icon: Brain, titulo: 'Dor de cabeça intensa ou alteração na visão', texto: 'Visão turva, pontos brilhantes ou perda de visão junto com dor de cabeça exigem atendimento imediato.' },
  { icon: Thermometer, titulo: 'Febre a partir de 37,8 °C', texto: 'Entre em contato com um serviço de saúde para avaliação imediata.' },
  { icon: ShieldAlert, titulo: 'Inchaço repentino no rosto ou nas mãos', texto: 'Procure atendimento, principalmente se houver dor de cabeça ou alteração na visão.' },
  { icon: Baby, titulo: 'Bebê se mexendo menos que o habitual', texto: 'Após 20 semanas, redução ou ausência de movimentos — especialmente por mais de 4 horas — precisa de avaliação imediata.' },
  { icon: Wind, titulo: 'Falta de ar importante ou dor no peito', texto: 'Procure uma urgência imediatamente. Se houver dificuldade intensa para respirar, desmaio ou convulsão, ligue para o SAMU (192).' },
  { icon: Droplets, titulo: 'Dor ou ardor ao urinar', texto: 'Pode ser sinal de infecção urinária. Procure avaliação de saúde sem demora, especialmente se houver febre ou dor nas costas.' },
  { icon: AlertTriangle, titulo: 'Vômitos persistentes', texto: 'Procure avaliação se não conseguir manter líquidos, estiver urinando pouco ou sentir fraqueza intensa.' }
];

const dicas = [
  { titulo: 'Observe mudanças no seu corpo', texto: 'Anote quando o sintoma começou, com que frequência acontece e o que parece piorar ou aliviar. Leve essas informações ao pré-natal.' },
  { titulo: 'Evite se automedicar', texto: 'Antes de usar remédios, chás ou suplementos, confirme com um profissional de saúde se são adequados na gestação.' },
  { titulo: 'Mantenha o pré-natal', texto: 'As consultas ajudam a conversar sobre desconfortos e avaliar sintomas que precisam de cuidado.' },
  { titulo: 'Na dúvida, peça ajuda', texto: 'Se algo parecer diferente ou preocupante, fale com sua equipe, UBS ou maternidade de referência.' }
];

const abas = [
  { id: 'comuns', label: 'Comuns', icon: Info },
  { id: 'alerta', label: 'Sinais de alerta', icon: ShieldAlert },
  { id: 'dicas', label: 'Dicas', icon: Leaf }
];

export default function TelaSintomas() {
  const [aba, setAba] = useState('comuns');

  return (
    <div className="d-flex flex-column h-100 bg-light">
      <TopBar titulo="Sintomas na gestação" showBack />
      <main className="px-3 px-sm-4 py-3" style={{ overflowY: 'auto', paddingBottom: 32 }}>
        <div className="d-flex gap-2 mb-3 overflow-auto" role="tablist" aria-label="Categorias de sintomas" style={{ scrollbarWidth: 'none' }}>
          {abas.map(({ id, label, icon: Icon }) => (
            <button key={id} id={`aba-${id}`} role="tab" aria-selected={aba === id} aria-controls={`painel-${id}`} onClick={() => setAba(id)} className="btn rounded-pill px-3 py-2 fw-medium border-0 d-flex align-items-center gap-2" style={{ backgroundColor: aba === id ? (id === 'alerta' ? '#dc2626' : '#7c3aed') : '#fff', color: aba === id ? '#fff' : '#6b7280', whiteSpace: 'nowrap', fontSize: '.85rem' }}>
              <Icon size={16} />{label}
            </button>
          ))}
        </div>

        {aba === 'comuns' && <section id="painel-comuns" role="tabpanel" aria-labelledby="aba-comuns">
          <div className="p-3 mb-3 d-flex gap-2 align-items-start" style={{ borderRadius: 18, background: '#f5f3ff', color: '#5b21b6' }}>
            <Info size={19} className="flex-shrink-0 mt-1" />
            <p className="small mb-0">Alguns desconfortos são comuns, mas variam de pessoa para pessoa. Se forem intensos, persistentes ou preocupantes, converse com a equipe do pré-natal.</p>
          </div>
          <div className="d-flex flex-column gap-2">
            {sintomasComuns.map(({ icon: Icon, title, texto, dica }) => <article key={title} className="bg-white p-3 shadow-sm d-flex align-items-start gap-3" style={{ borderRadius: 18 }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40, background: '#ede9fe', color: '#7c3aed' }}><Icon size={20} /></div>
              <div><h2 className="h6 fw-bold mb-1">{title}</h2><p className="small text-secondary mb-2">{texto}</p><p className="small mb-0" style={{ color: '#5b21b6' }}><strong>O que pode ajudar:</strong> {dica}</p></div>
            </article>)}
          </div>
        </section>}

        {aba === 'alerta' && <section id="painel-alerta" role="tabpanel" aria-labelledby="aba-alerta">
          <div className="p-3 mb-3 d-flex gap-2 align-items-start" style={{ borderRadius: 18, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
            <AlertTriangle size={21} className="flex-shrink-0 mt-1" />
            <div><h2 className="h6 fw-bold mb-1">Procure atendimento imediatamente</h2><p className="small mb-0">Se apresentar qualquer um destes sinais, procure sua UBS, maternidade de referência ou serviço de urgência. Em emergência grave, ligue para o SAMU: <a className="fw-bold" href="tel:192" style={{ color: '#991b1b' }}>192</a>.</p></div>
          </div>
          <div className="d-flex flex-column gap-2">
            {sinaisAlerta.map(({ icon: Icon, titulo, texto }) => <article key={titulo} className="bg-white p-3 shadow-sm d-flex gap-3 align-items-start" style={{ borderRadius: 18, borderLeft: '4px solid #dc2626' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 38, height: 38, background: '#fef2f2', color: '#dc2626' }}><Icon size={19} /></div>
              <div><h3 className="h6 fw-bold mb-1">{titulo}</h3><p className="small text-secondary mb-0">{texto}</p></div>
            </article>)}
          </div>
        </section>}

        {aba === 'dicas' && <section id="painel-dicas" role="tabpanel" aria-labelledby="aba-dicas">
          <div className="d-flex flex-column gap-2">
            {dicas.map(({ titulo, texto }) => <article key={titulo} className="bg-white p-3 shadow-sm d-flex gap-3 align-items-start" style={{ borderRadius: 18 }}><CheckCircle2 size={20} color="#7c3aed" className="flex-shrink-0" /><div><h2 className="h6 fw-bold mb-1">{titulo}</h2><p className="small text-secondary mb-0">{texto}</p></div></article>)}
          </div>
        </section>}

        <div className="mt-4 pt-3 border-top">
          <p className="small text-muted mb-2">Esta página é informativa e não substitui avaliação profissional. Em caso de dúvida ou piora, procure um serviço de saúde.</p>
          <a className="small d-inline-flex align-items-center gap-1" href="https://bvsms.saude.gov.br/bvs/publicacoes/caderneta_brasileira_gestante.pdf" target="_blank" rel="noreferrer">Consulte a Caderneta da Gestante do Ministério da Saúde <ArrowUpRight size={14} /></a>
        </div>
      </main>
    </div>
  );
}
