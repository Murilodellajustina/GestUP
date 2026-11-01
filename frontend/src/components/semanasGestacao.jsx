const destaques = {
  1: ['Início do ciclo menstrual', 'O organismo inicia a preparação para a ovulação', 'A fecundação ainda não ocorreu'],
  2: ['Os folículos ovarianos amadurecem', 'O endométrio se prepara para uma possível implantação', 'A ovulação pode ocorrer ao fim desta fase'],
  3: ['Pode ocorrer a fecundação', 'As primeiras divisões celulares começam', 'O embrião segue em direção ao útero'],
  4: ['Pode ocorrer a implantação no útero', 'Começam a se formar estruturas embrionárias', 'O organismo inicia a produção de hormônios da gestação'],
  5: ['Começa a formação do tubo neural', 'O coração primitivo inicia seu desenvolvimento', 'O embrião cresce rapidamente'],
  6: ['O coração pode apresentar atividade', 'Começam a se formar estruturas do rosto', 'O cérebro e o sistema nervoso se desenvolvem'],
  7: ['Braços e pernas começam a se desenvolver', 'O cérebro cresce rapidamente', 'Os principais órgãos seguem em formação'],
  8: ['Os membros ficam mais definidos', 'As estruturas faciais continuam a se formar', 'Órgãos internos seguem em desenvolvimento'],
  9: ['Os dedos começam a se delinear', 'Articulações se desenvolvem', 'O embrião pode fazer movimentos espontâneos'],
  10: ['Os órgãos iniciam suas funções', 'Dedos das mãos e dos pés ficam mais definidos', 'Começam pequenos movimentos'],
  11: ['O desenvolvimento dos ossos avança', 'O rosto fica mais definido', 'Movimentos espontâneos continuam'],
  12: ['Os reflexos começam a se desenvolver', 'Os membros continuam crescendo', 'Os órgãos seguem amadurecendo'],
  13: ['O esqueleto continua se formando', 'Os movimentos ficam mais coordenados', 'O primeiro trimestre se aproxima do fim'],
  14: ['Inicia-se o segundo trimestre', 'O corpo cresce em ritmo acelerado', 'As feições ficam mais definidas'],
  15: ['O esqueleto continua se fortalecendo', 'O bebê pode movimentar braços e pernas', 'A audição segue em desenvolvimento'],
  16: ['Os movimentos se tornam mais coordenados', 'Os olhos e as orelhas se posicionam', 'O crescimento continua'],
  17: ['O tecido adiposo começa a se formar', 'O esqueleto fica mais firme', 'O bebê exercita movimentos de sucção'],
  18: ['A audição continua amadurecendo', 'O bebê pode reagir a sons', 'Os movimentos ficam mais ativos'],
  19: ['A pele recebe uma camada protetora', 'Os sentidos continuam se desenvolvendo', 'O crescimento segue constante'],
  20: ['Metade da gestação foi alcançada', 'Os movimentos podem ficar mais perceptíveis', 'Os sentidos continuam amadurecendo'],
  21: ['O bebê movimenta braços e pernas', 'O sistema digestivo segue se desenvolvendo', 'Pode responder a sons e estímulos'],
  22: ['As feições ficam mais definidas', 'O bebê pratica movimentos respiratórios', 'Os sentidos seguem em desenvolvimento'],
  23: ['O bebê ganha peso gradualmente', 'Os pulmões continuam amadurecendo', 'Os movimentos podem ser mais regulares'],
  24: ['O cérebro cresce rapidamente', 'Os pulmões desenvolvem estruturas importantes', 'O bebê responde a sons familiares'],
  25: ['O bebê pode reagir a sons e toques', 'O sistema nervoso amadurece', 'O ganho de peso continua'],
  26: ['Os olhos começam a se abrir', 'Os pulmões seguem em desenvolvimento', 'O bebê alterna períodos de atividade e descanso'],
  27: ['O cérebro continua amadurecendo', 'O bebê pode reconhecer vozes', 'O segundo trimestre chega ao fim'],
  28: ['Começa o terceiro trimestre', 'O cérebro apresenta desenvolvimento intenso', 'O bebê continua ganhando peso'],
  29: ['Os músculos e os pulmões amadurecem', 'O bebê pode abrir e fechar os olhos', 'Os movimentos seguem ativos'],
  30: ['O sistema nervoso segue amadurecendo', 'O bebê ganha peso e acumula gordura', 'Os sentidos ficam mais apurados'],
  31: ['O cérebro cresce rapidamente', 'Os pulmões continuam se preparando', 'O bebê pode mudar de posição'],
  32: ['O bebê acumula gordura corporal', 'Os órgãos continuam amadurecendo', 'Os movimentos podem parecer mais fortes'],
  33: ['Os ossos ficam mais firmes', 'O crânio permanece flexível para o parto', 'O bebê segue ganhando peso'],
  34: ['Os pulmões continuam amadurecendo', 'O sistema imunológico recebe anticorpos maternos', 'O bebê pode se posicionar para o nascimento'],
  35: ['O cérebro e o sistema nervoso seguem amadurecendo', 'Os rins estão desenvolvidos', 'O ganho de peso continua'],
  36: ['O bebê pode se encaixar na pelve', 'Os pulmões estão perto da maturidade', 'A gestação se aproxima do termo'],
  37: ['A gestação é considerada a termo inicial', 'O bebê continua acumulando gordura', 'Os órgãos estão prontos para a vida fora do útero'],
  38: ['O cérebro e os pulmões seguem amadurecendo', 'O bebê continua ganhando peso', 'O nascimento pode acontecer a qualquer momento'],
  39: ['O bebê está pronto para nascer', 'O cérebro continua em desenvolvimento', 'Acompanhe os sinais e orientações da equipe de saúde'],
  40: ['A semana estimada para o parto chegou', 'Cada nascimento tem seu próprio momento', 'Mantenha o acompanhamento com a equipe de saúde']
};

const titulos = [
  'Início do ciclo', 'Preparação para a ovulação', 'Primeiros momentos', 'Possível implantação', 'Desenvolvimento inicial',
  'O coração começa a se formar', 'Novas estruturas', 'Crescimento do embrião', 'Movimentos iniciais', 'Órgãos em formação',
  'Estruturas mais definidas', 'Novos reflexos', 'Fim do primeiro trimestre', 'Uma nova fase', 'Crescimento constante',
  'Movimentos coordenados', 'Esqueleto em formação', 'Percepção de sons', 'Proteção da pele', 'Metade da gestação',
  'Mais atividade', 'Sentidos em desenvolvimento', 'Ganho de peso', 'Desenvolvimento acelerado', 'Respostas a estímulos',
  'Olhos em desenvolvimento', 'Reta final do trimestre', 'Início do terceiro trimestre', 'Mais força e movimento', 'Sentidos apurados',
  'Cérebro em crescimento', 'Preparação gradual', 'Corpo mais forte', 'Perto da posição de nascimento', 'Amadurecimento final',
  'Reta final', 'A termo inicial', 'Quase lá', 'Pronto para chegar', 'Semana prevista para o parto'
];

const semanasGestacao = Object.fromEntries(
  Array.from({ length: 40 }, (_, index) => {
    const semana = index + 1;
    const trimestre = semana <= 13 ? 'primeiro' : semana <= 27 ? 'segundo' : 'terceiro';
    return [semana, {
      titulo: titulos[index],
      descricao: `Na ${semana}ª semana, ${destaques[semana][0].toLowerCase()}. O desenvolvimento continua de forma gradual e pode variar de uma gestação para outra.`,
      desenvolvimento: destaques[semana],
      cuidados: trimestre === 'primeiro'
        ? 'Inicie ou mantenha o pré-natal, converse com a equipe sobre medicamentos e tire dúvidas sobre alimentação e suplementação.'
        : trimestre === 'segundo'
          ? 'Mantenha as consultas e exames recomendados, cuide da hidratação e converse com a equipe sobre movimentos e sintomas.'
          : 'Mantenha o acompanhamento pré-natal, combine com a equipe um plano para o parto e procure orientação diante de sinais de alerta.'
    }];
  })
);

export default semanasGestacao;
