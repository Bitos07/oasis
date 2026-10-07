// Modelos de divisão de treino. Cada exercício: [id, séries, repetições].
// O usuário edita tudo depois de criar o plano.

export const MODELOS = [
  {
    id: 'abc',
    nome: 'ABC',
    descricao: '3 treinos que se repetem. Bom para 3 a 6 dias por semana.',
    dias: [
      { nome: 'Peito, Ombro e Tríceps', ex: [
        ['supino-reto-barra', 4, '8-10'], ['supino-inclinado-halter', 3, '10-12'], ['crucifixo-halter', 3, '12'],
        ['desenvolvimento-halter', 3, '10'], ['elevacao-lateral', 3, '12-15'],
        ['triceps-pulley', 3, '12'], ['triceps-testa', 3, '10'],
      ] },
      { nome: 'Costas e Bíceps', ex: [
        ['puxada-frente', 4, '10'], ['remada-curvada', 3, '8-10'], ['remada-baixa', 3, '12'], ['pulldown', 3, '12'],
        ['crucifixo-inverso', 3, '12-15'], ['rosca-direta', 3, '10'], ['rosca-martelo', 3, '12'],
      ] },
      { nome: 'Pernas', ex: [
        ['agachamento-livre', 4, '8-10'], ['leg-press-45', 3, '10-12'], ['cadeira-extensora', 3, '12'],
        ['mesa-flexora', 3, '12'], ['stiff', 3, '10'], ['elevacao-pelvica', 3, '10'], ['panturrilha-em-pe', 4, '15'],
      ] },
    ],
  },
  {
    id: 'abcd',
    nome: 'ABCD',
    descricao: '4 treinos. Mais volume por grupo, bom para 4 a 6 dias por semana.',
    dias: [
      { nome: 'Peito e Tríceps', ex: [
        ['supino-reto-barra', 4, '8-10'], ['supino-inclinado-halter', 3, '10'], ['crossover', 3, '12'], ['peck-deck', 3, '12'],
        ['triceps-corda', 3, '12'], ['triceps-frances', 3, '10'], ['mergulho-banco', 3, '12'],
      ] },
      { nome: 'Costas e Bíceps', ex: [
        ['barra-fixa', 3, 'máx'], ['puxada-frente', 3, '10'], ['remada-unilateral', 3, '10'], ['remada-baixa', 3, '12'],
        ['rosca-direta', 3, '10'], ['rosca-alternada', 3, '10'], ['rosca-concentrada', 3, '12'],
      ] },
      { nome: 'Pernas', ex: [
        ['agachamento-livre', 4, '8'], ['leg-press-45', 4, '10'], ['bulgaro', 3, '10'], ['cadeira-extensora', 3, '12'],
        ['mesa-flexora', 3, '12'], ['terra-romeno', 3, '10'], ['panturrilha-em-pe', 4, '15'],
      ] },
      { nome: 'Ombros e Abdômen', ex: [
        ['desenvolvimento-barra', 4, '8-10'], ['elevacao-lateral', 4, '12-15'], ['elevacao-frontal', 3, '12'],
        ['face-pull', 3, '15'], ['encolhimento-halter', 3, '12'],
        ['abdominal-infra', 3, '15'], ['prancha', 3, '40s'],
      ] },
    ],
  },
  {
    id: 'abcde',
    nome: 'ABCDE',
    descricao: '5 treinos, um grupo principal por dia. Para quem treina 5 ou 6 dias.',
    dias: [
      { nome: 'Peito', ex: [
        ['supino-reto-barra', 4, '8'], ['supino-inclinado-barra', 4, '10'], ['supino-declinado-barra', 3, '10'],
        ['crucifixo-inclinado', 3, '12'], ['crossover', 3, '12-15'], ['flexao', 2, 'máx'],
      ] },
      { nome: 'Costas', ex: [
        ['barra-fixa', 3, 'máx'], ['puxada-frente', 4, '10'], ['remada-curvada', 4, '8-10'], ['remada-cavalinho', 3, '10'],
        ['pulldown', 3, '12'], ['hiperextensao', 3, '15'],
      ] },
      { nome: 'Pernas', ex: [
        ['agachamento-livre', 4, '8'], ['hack', 3, '10'], ['leg-press-45', 3, '12'], ['cadeira-extensora', 3, '15'],
        ['stiff', 3, '10'], ['mesa-flexora', 3, '12'], ['cadeira-abdutora', 3, '15'], ['panturrilha-sentado', 4, '15'],
      ] },
      { nome: 'Ombros e Trapézio', ex: [
        ['desenvolvimento-halter', 4, '8-10'], ['arnold', 3, '10'], ['elevacao-lateral', 4, '12-15'],
        ['elevacao-lateral-polia', 3, '12'], ['crucifixo-inverso-maquina', 3, '15'], ['encolhimento-barra', 4, '12'],
      ] },
      { nome: 'Braços e Abdômen', ex: [
        ['rosca-direta', 3, '10'], ['triceps-pulley', 3, '12'], ['rosca-scott', 3, '10'], ['triceps-testa', 3, '10'],
        ['rosca-martelo', 3, '12'], ['triceps-corda', 3, '12'], ['abdominal-supra', 3, '20'], ['elevacao-pernas-barra', 3, '12'],
      ] },
    ],
  },
  {
    id: 'ab',
    nome: 'AB – Superior / Inferior',
    descricao: '2 treinos: parte de cima e parte de baixo. Bom para 2 a 4 dias por semana.',
    dias: [
      { nome: 'Superiores', ex: [
        ['supino-reto-barra', 4, '8-10'], ['remada-curvada', 4, '8-10'], ['desenvolvimento-halter', 3, '10'],
        ['puxada-frente', 3, '10'], ['elevacao-lateral', 3, '12'], ['rosca-direta', 3, '10'], ['triceps-pulley', 3, '12'],
      ] },
      { nome: 'Inferiores', ex: [
        ['agachamento-livre', 4, '8'], ['terra-romeno', 3, '10'], ['leg-press-45', 3, '12'], ['mesa-flexora', 3, '12'],
        ['elevacao-pelvica', 3, '10'], ['panturrilha-em-pe', 4, '15'], ['prancha', 3, '40s'],
      ] },
    ],
  },
  {
    id: 'ppl',
    nome: 'Push / Pull / Legs',
    descricao: 'Empurrar, Puxar, Pernas. 3 treinos, pode repetir 2x na semana.',
    dias: [
      { nome: 'Push (empurrar)', ex: [
        ['supino-reto-barra', 4, '6-8'], ['desenvolvimento-barra', 3, '8-10'], ['supino-inclinado-halter', 3, '10'],
        ['elevacao-lateral', 4, '12-15'], ['triceps-corda', 3, '12'], ['triceps-frances', 3, '10'],
      ] },
      { nome: 'Pull (puxar)', ex: [
        ['levantamento-terra', 3, '5'], ['barra-fixa', 3, 'máx'], ['remada-baixa', 3, '10'], ['face-pull', 3, '15'],
        ['rosca-direta', 3, '10'], ['rosca-martelo', 3, '12'],
      ] },
      { nome: 'Legs (pernas)', ex: [
        ['agachamento-livre', 4, '6-8'], ['leg-press-45', 3, '10'], ['terra-romeno', 3, '10'], ['cadeira-extensora', 3, '12'],
        ['mesa-flexora', 3, '12'], ['panturrilha-em-pe', 4, '15'],
      ] },
    ],
  },
  {
    id: 'fullbody',
    nome: 'Full Body',
    descricao: 'Corpo todo no mesmo treino. Ótimo para iniciantes ou quem treina 2–3x por semana.',
    dias: [
      { nome: 'Corpo todo', ex: [
        ['agachamento-livre', 3, '10'], ['supino-reto-barra', 3, '10'], ['puxada-frente', 3, '10'],
        ['desenvolvimento-halter', 3, '10'], ['stiff', 3, '10'], ['rosca-direta', 2, '12'], ['triceps-pulley', 2, '12'],
        ['prancha', 3, '30s'],
      ] },
    ],
  },
];
