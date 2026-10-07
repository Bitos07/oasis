// Catálogo de exercícios.
// principais = músculos que o exercício trabalha mais; secundarios = que ajudam.
// Os ids de músculo batem com as regiões do desenho em components/corpo.js.

export const MUSCULOS = {
  peito: 'Peito',
  costas: 'Costas (dorsal)',
  ombros: 'Ombros',
  trapezio: 'Trapézio',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  antebraco: 'Antebraço',
  abdomen: 'Abdômen',
  obliquos: 'Oblíquos',
  lombar: 'Lombar',
  quadriceps: 'Quadríceps',
  posterior: 'Posterior de coxa',
  gluteos: 'Glúteos',
  adutores: 'Adutores',
  panturrilha: 'Panturrilha',
};

export const GRUPOS = {
  ...MUSCULOS,
  cardio: 'Cardio',
};

export const EQUIPAMENTOS = {
  barra: 'Barra',
  halter: 'Halter',
  maquina: 'Máquina',
  polia: 'Polia/cabo',
  corporal: 'Peso corporal',
  smith: 'Smith',
  kettlebell: 'Kettlebell',
  cardio: 'Aparelho de cardio',
};

function ex(id, nome, principais, secundarios, equipamento, dica, extra = {}) {
  return { id, nome, grupo: extra.grupo || principais[0], principais, secundarios, equipamento, dica, tipo: extra.tipo || 'forca' };
}

export const EXERCICIOS = [
  // ---------- PEITO ----------
  ex('supino-reto-barra', 'Supino reto com barra', ['peito'], ['triceps', 'ombros'], 'barra', 'Escápulas encaixadas no banco; desça a barra até a linha do mamilo e empurre sem tirar o quadril do banco.'),
  ex('supino-reto-halter', 'Supino reto com halteres', ['peito'], ['triceps', 'ombros'], 'halter', 'Desça os halteres até a lateral do peito, cotovelos a ~45° do tronco.'),
  ex('supino-inclinado-barra', 'Supino inclinado com barra', ['peito'], ['ombros', 'triceps'], 'barra', 'Banco a 30–45°. Foca a parte de cima do peito. Desça a barra na parte alta do peito.'),
  ex('supino-inclinado-halter', 'Supino inclinado com halteres', ['peito'], ['ombros', 'triceps'], 'halter', 'Banco a 30–45°. Não deixe os halteres baterem em cima.'),
  ex('supino-declinado-barra', 'Supino declinado com barra', ['peito'], ['triceps', 'ombros'], 'barra', 'Foca a parte de baixo do peito. Prenda bem as pernas no apoio.'),
  ex('supino-maquina', 'Supino na máquina', ['peito'], ['triceps', 'ombros'], 'maquina', 'Ajuste o banco para a pegada ficar na linha do peito.'),
  ex('supino-smith', 'Supino reto no Smith', ['peito'], ['triceps', 'ombros'], 'smith', 'Posicione o banco para a barra descer na linha do mamilo.'),
  ex('crucifixo-halter', 'Crucifixo reto com halteres', ['peito'], ['ombros'], 'halter', 'Cotovelos levemente dobrados e fixos; abra até sentir alongar o peito.'),
  ex('crucifixo-inclinado', 'Crucifixo inclinado com halteres', ['peito'], ['ombros'], 'halter', 'Banco a 30°. Mesmo movimento do crucifixo reto, foco no peito superior.'),
  ex('crossover', 'Crossover na polia', ['peito'], ['ombros'], 'polia', 'Polias altas, puxe em arco à frente do corpo e junte as mãos embaixo.'),
  ex('crossover-baixo', 'Crossover de baixo para cima', ['peito'], ['ombros'], 'polia', 'Polias baixas, puxe em arco até a altura do queixo. Foca o peito superior.'),
  ex('peck-deck', 'Voador (peck deck)', ['peito'], ['ombros'], 'maquina', 'Cotovelos na altura dos ombros; feche apertando o peito, volte devagar.'),
  ex('flexao', 'Flexão de braço', ['peito'], ['triceps', 'ombros', 'abdomen'], 'corporal', 'Corpo reto da cabeça ao calcanhar; peito quase encosta no chão.'),
  ex('paralelas-peito', 'Paralelas (foco peito)', ['peito'], ['triceps', 'ombros'], 'corporal', 'Tronco inclinado para frente e cotovelos abertos para pegar mais peito.'),
  ex('pullover', 'Pullover com halter', ['peito', 'costas'], ['triceps'], 'halter', 'Deitado, leve o halter para trás da cabeça com braços quase retos e volte.'),

  // ---------- COSTAS ----------
  ex('puxada-frente', 'Puxada frontal (pulley)', ['costas'], ['biceps', 'antebraco'], 'polia', 'Puxe a barra até o alto do peito levando os cotovelos para baixo; não balance o tronco.'),
  ex('puxada-triangulo', 'Puxada com triângulo', ['costas'], ['biceps', 'antebraco'], 'polia', 'Pegada neutra fechada; puxe até o peito estufando o tórax.'),
  ex('puxada-supinada', 'Puxada supinada', ['costas'], ['biceps', 'antebraco'], 'polia', 'Palmas viradas para você; trabalha mais bíceps junto.'),
  ex('barra-fixa', 'Barra fixa (pronada)', ['costas'], ['biceps', 'antebraco', 'abdomen'], 'corporal', 'Pegada um pouco mais aberta que os ombros; suba até o queixo passar da barra.'),
  ex('barra-fixa-supinada', 'Barra fixa supinada (chin-up)', ['costas', 'biceps'], ['antebraco'], 'corporal', 'Palmas para você, pegada na largura dos ombros.'),
  ex('remada-curvada', 'Remada curvada com barra', ['costas'], ['biceps', 'trapezio', 'lombar'], 'barra', 'Tronco inclinado ~45°, coluna neutra; puxe a barra até o umbigo.'),
  ex('remada-baixa', 'Remada baixa (sentada)', ['costas'], ['biceps', 'trapezio'], 'polia', 'Puxe o triângulo até o abdômen juntando as escápulas; não jogue o tronco para trás.'),
  ex('remada-unilateral', 'Remada unilateral com halter (serrote)', ['costas'], ['biceps', 'trapezio'], 'halter', 'Apoie joelho e mão no banco; puxe o halter em direção ao quadril.'),
  ex('remada-cavalinho', 'Remada cavalinho (T-bar)', ['costas'], ['biceps', 'trapezio', 'lombar'], 'barra', 'Peito aberto, coluna neutra; puxe até a barra encostar no peito.'),
  ex('remada-maquina', 'Remada na máquina', ['costas'], ['biceps', 'trapezio'], 'maquina', 'Peito apoiado; puxe juntando as escápulas.'),
  ex('pulldown', 'Pulldown braço estendido', ['costas'], ['triceps'], 'polia', 'Braços quase retos, leve a barra da altura da cabeça até as coxas.'),
  ex('levantamento-terra', 'Levantamento terra', ['lombar', 'gluteos', 'posterior'], ['costas', 'trapezio', 'quadriceps', 'antebraco'], 'barra', 'Barra colada na canela, coluna neutra; empurre o chão com as pernas e estenda o quadril.'),
  ex('hiperextensao', 'Hiperextensão lombar (banco romano)', ['lombar'], ['gluteos', 'posterior'], 'corporal', 'Desça com a coluna neutra e suba até alinhar o tronco com as pernas, sem hiperestender.'),
  ex('bom-dia', 'Bom dia (good morning)', ['lombar', 'posterior'], ['gluteos'], 'barra', 'Barra nas costas, joelhos levemente dobrados; incline o tronco à frente empurrando o quadril para trás.'),

  // ---------- OMBROS ----------
  ex('desenvolvimento-halter', 'Desenvolvimento com halteres', ['ombros'], ['triceps', 'trapezio'], 'halter', 'Sentado, empurre os halteres para cima sem bater um no outro.'),
  ex('desenvolvimento-barra', 'Desenvolvimento militar com barra', ['ombros'], ['triceps', 'trapezio'], 'barra', 'Barra pela frente do rosto; abdômen e glúteos contraídos.'),
  ex('desenvolvimento-maquina', 'Desenvolvimento na máquina', ['ombros'], ['triceps'], 'maquina', 'Ajuste o banco para as pegadas ficarem na altura dos ombros.'),
  ex('arnold', 'Desenvolvimento Arnold', ['ombros'], ['triceps'], 'halter', 'Comece com palmas para você e gire os halteres enquanto empurra para cima.'),
  ex('elevacao-lateral', 'Elevação lateral com halteres', ['ombros'], ['trapezio'], 'halter', 'Suba os braços pela lateral até a altura dos ombros, cotovelos levemente dobrados.'),
  ex('elevacao-lateral-polia', 'Elevação lateral na polia', ['ombros'], ['trapezio'], 'polia', 'Unilateral, cabo passando à frente do corpo; tensão constante.'),
  ex('elevacao-frontal', 'Elevação frontal', ['ombros'], ['peito'], 'halter', 'Suba os halteres à frente até a altura dos olhos, sem balançar.'),
  ex('crucifixo-inverso', 'Crucifixo inverso com halteres', ['ombros'], ['costas', 'trapezio'], 'halter', 'Tronco inclinado, abra os braços para os lados. Trabalha o deltoide posterior.'),
  ex('crucifixo-inverso-maquina', 'Crucifixo inverso na máquina', ['ombros'], ['costas', 'trapezio'], 'maquina', 'Voador de frente para o encosto; abra os braços para trás.'),
  ex('face-pull', 'Face pull', ['ombros'], ['trapezio', 'costas'], 'polia', 'Corda na altura do rosto; puxe abrindo as mãos para os lados da cabeça.'),
  ex('remada-alta', 'Remada alta', ['ombros', 'trapezio'], ['biceps'], 'barra', 'Puxe a barra rente ao corpo até o peito, cotovelos acima das mãos.'),

  // ---------- TRAPÉZIO ----------
  ex('encolhimento-barra', 'Encolhimento com barra', ['trapezio'], ['antebraco'], 'barra', 'Suba os ombros em direção às orelhas, segure 1 s e desça devagar. Não gire os ombros.'),
  ex('encolhimento-halter', 'Encolhimento com halteres', ['trapezio'], ['antebraco'], 'halter', 'Braços ao lado do corpo; suba só os ombros.'),

  // ---------- BÍCEPS ----------
  ex('rosca-direta', 'Rosca direta com barra', ['biceps'], ['antebraco'], 'barra', 'Cotovelos colados no corpo; suba sem balançar o tronco.'),
  ex('rosca-w', 'Rosca direta com barra W', ['biceps'], ['antebraco'], 'barra', 'A barra W alivia o punho. Mesmo movimento da rosca direta.'),
  ex('rosca-alternada', 'Rosca alternada com halteres', ['biceps'], ['antebraco'], 'halter', 'Gire a palma para cima enquanto sobe (supinação).'),
  ex('rosca-martelo', 'Rosca martelo', ['biceps', 'antebraco'], [], 'halter', 'Pegada neutra (palmas uma de frente para a outra) o tempo todo.'),
  ex('rosca-scott', 'Rosca Scott', ['biceps'], ['antebraco'], 'barra', 'Braço apoiado no banco Scott; não estenda o cotovelo de forma brusca embaixo.'),
  ex('rosca-concentrada', 'Rosca concentrada', ['biceps'], ['antebraco'], 'halter', 'Sentado, cotovelo apoiado na parte interna da coxa.'),
  ex('rosca-polia', 'Rosca na polia', ['biceps'], ['antebraco'], 'polia', 'Polia baixa; tensão constante durante todo o movimento.'),
  ex('rosca-inclinada', 'Rosca inclinada com halteres', ['biceps'], ['antebraco'], 'halter', 'Banco a 45°, braços pendurados para trás: alonga mais o bíceps.'),

  // ---------- TRÍCEPS ----------
  ex('triceps-pulley', 'Tríceps pulley (barra)', ['triceps'], [], 'polia', 'Cotovelos colados no corpo; estenda até o fim e volte até 90°.'),
  ex('triceps-corda', 'Tríceps corda', ['triceps'], [], 'polia', 'No fim do movimento, abra a corda para os lados.'),
  ex('triceps-testa', 'Tríceps testa', ['triceps'], [], 'barra', 'Deitado, desça a barra W em direção à testa só dobrando o cotovelo.'),
  ex('triceps-frances', 'Tríceps francês', ['triceps'], [], 'halter', 'Halter atrás da cabeça segurado com as duas mãos; cotovelos apontando para cima.'),
  ex('triceps-coice', 'Tríceps coice', ['triceps'], [], 'halter', 'Tronco inclinado, braço colado ao corpo; estenda o cotovelo para trás.'),
  ex('triceps-unilateral', 'Tríceps unilateral na polia', ['triceps'], [], 'polia', 'Um braço de cada vez, pegada invertida ou neutra.'),
  ex('mergulho-banco', 'Mergulho no banco', ['triceps'], ['peito', 'ombros'], 'corporal', 'Mãos no banco atrás do corpo; desça dobrando os cotovelos até 90°.'),
  ex('paralelas-triceps', 'Paralelas (foco tríceps)', ['triceps'], ['peito', 'ombros'], 'corporal', 'Tronco reto e cotovelos fechados para pegar mais tríceps.'),
  ex('supino-fechado', 'Supino fechado', ['triceps'], ['peito', 'ombros'], 'barra', 'Pegada na largura dos ombros, cotovelos perto do corpo.'),

  // ---------- ANTEBRAÇO ----------
  ex('rosca-inversa', 'Rosca inversa', ['antebraco'], ['biceps'], 'barra', 'Pegada pronada (palmas para baixo).'),
  ex('rosca-punho', 'Rosca de punho', ['antebraco'], [], 'barra', 'Antebraço apoiado na coxa, só o punho se movimenta.'),
  ex('rosca-punho-inversa', 'Rosca de punho inversa', ['antebraco'], [], 'barra', 'Igual à rosca de punho, com as palmas para baixo.'),
  ex('farmer-walk', 'Caminhada do fazendeiro', ['antebraco', 'trapezio'], ['abdomen', 'gluteos'], 'halter', 'Caminhe com halteres pesados nas mãos, tronco ereto.'),

  // ---------- QUADRÍCEPS / PERNAS ----------
  ex('agachamento-livre', 'Agachamento livre', ['quadriceps', 'gluteos'], ['posterior', 'adutores', 'lombar', 'abdomen'], 'barra', 'Pés na largura dos ombros, joelhos na direção dos pés; desça mantendo a coluna neutra.'),
  ex('agachamento-smith', 'Agachamento no Smith', ['quadriceps', 'gluteos'], ['posterior', 'adutores'], 'smith', 'Pés um pouco à frente da barra para proteger o joelho.'),
  ex('agachamento-frontal', 'Agachamento frontal', ['quadriceps'], ['gluteos', 'abdomen'], 'barra', 'Barra apoiada na frente dos ombros, cotovelos altos e tronco mais ereto.'),
  ex('agachamento-goblet', 'Agachamento goblet', ['quadriceps', 'gluteos'], ['abdomen', 'adutores'], 'halter', 'Segure um halter ou kettlebell junto ao peito.'),
  ex('agachamento-sumo', 'Agachamento sumô', ['gluteos', 'adutores'], ['quadriceps', 'posterior'], 'halter', 'Pés bem afastados e pontas para fora.'),
  ex('hack', 'Agachamento hack', ['quadriceps'], ['gluteos'], 'maquina', 'Costas apoiadas; pés mais baixos na plataforma pegam mais quadríceps.'),
  ex('leg-press-45', 'Leg press 45°', ['quadriceps', 'gluteos'], ['posterior', 'adutores'], 'maquina', 'Não tire o quadril do banco embaixo e não trave o joelho em cima.'),
  ex('leg-press-horizontal', 'Leg press horizontal', ['quadriceps', 'gluteos'], ['posterior'], 'maquina', 'Mesmo cuidado do 45°: não travar o joelho.'),
  ex('cadeira-extensora', 'Cadeira extensora', ['quadriceps'], [], 'maquina', 'Eixo da máquina alinhado com o joelho; segure 1 s em cima.'),
  ex('afundo', 'Afundo (avanço parado)', ['quadriceps', 'gluteos'], ['posterior', 'adutores'], 'halter', 'Desça até o joelho de trás quase tocar o chão, tronco reto.'),
  ex('passada', 'Passada (avanço caminhando)', ['quadriceps', 'gluteos'], ['posterior', 'adutores'], 'halter', 'Dê passos largos alternando as pernas.'),
  ex('bulgaro', 'Agachamento búlgaro', ['quadriceps', 'gluteos'], ['posterior', 'adutores'], 'halter', 'Pé de trás apoiado no banco; desça na vertical.'),
  ex('step-up', 'Subida no banco (step-up)', ['quadriceps', 'gluteos'], ['posterior'], 'halter', 'Suba empurrando com a perna da frente, sem impulsionar com a de trás.'),

  // ---------- POSTERIOR DE COXA ----------
  ex('mesa-flexora', 'Mesa flexora', ['posterior'], ['panturrilha'], 'maquina', 'Quadril colado no banco; suba o rolo até perto do glúteo.'),
  ex('cadeira-flexora', 'Cadeira flexora', ['posterior'], ['panturrilha'], 'maquina', 'Sentado, coxa travada; puxe o rolo para baixo.'),
  ex('flexora-em-pe', 'Flexora em pé (unilateral)', ['posterior'], ['panturrilha'], 'maquina', 'Uma perna de cada vez, sem girar o quadril.'),
  ex('stiff', 'Stiff', ['posterior', 'gluteos'], ['lombar', 'antebraco'], 'barra', 'Joelhos quase retos; desça a barra rente às pernas empurrando o quadril para trás.'),
  ex('terra-romeno', 'Levantamento terra romeno', ['posterior', 'gluteos'], ['lombar', 'antebraco'], 'barra', 'Joelhos um pouco dobrados; desça até o meio da canela com a coluna neutra.'),

  // ---------- GLÚTEOS / ADUTORES ----------
  ex('elevacao-pelvica', 'Elevação pélvica (hip thrust)', ['gluteos'], ['posterior'], 'barra', 'Costas apoiadas no banco, barra no quadril; suba até o tronco ficar alinhado e aperte o glúteo.'),
  ex('ponte-gluteo', 'Ponte de glúteo', ['gluteos'], ['posterior'], 'corporal', 'Deitado no chão, pés apoiados; suba o quadril.'),
  ex('gluteo-polia', 'Glúteo na polia (coice)', ['gluteos'], ['posterior'], 'polia', 'Tornozeleira na polia baixa; leve a perna para trás sem arquear a lombar.'),
  ex('gluteo-4-apoios', 'Glúteo 4 apoios', ['gluteos'], ['posterior'], 'maquina', 'Na máquina ou com caneleira; empurre o pé para cima.'),
  ex('cadeira-abdutora', 'Cadeira abdutora', ['gluteos'], [], 'maquina', 'Abra as pernas contra a resistência. Trabalha o glúteo médio (lateral).'),
  ex('cadeira-adutora', 'Cadeira adutora', ['adutores'], [], 'maquina', 'Feche as pernas contra a resistência. Trabalha a parte interna da coxa.'),

  // ---------- PANTURRILHA ----------
  ex('panturrilha-em-pe', 'Panturrilha em pé', ['panturrilha'], [], 'maquina', 'Desça o calcanhar até alongar bem e suba na ponta do pé; segure em cima.'),
  ex('panturrilha-sentado', 'Panturrilha sentado', ['panturrilha'], [], 'maquina', 'Com o joelho dobrado foca o sóleo (parte de baixo da panturrilha).'),
  ex('panturrilha-leg', 'Panturrilha no leg press', ['panturrilha'], [], 'maquina', 'Só a ponta dos pés na plataforma; não trave o joelho.'),
  ex('panturrilha-unilateral', 'Panturrilha unilateral com halter', ['panturrilha'], [], 'halter', 'Em um degrau, uma perna de cada vez.'),

  // ---------- ABDÔMEN ----------
  ex('abdominal-supra', 'Abdominal supra (crunch)', ['abdomen'], [], 'corporal', 'Tire só as escápulas do chão, sem puxar o pescoço.'),
  ex('abdominal-infra', 'Abdominal infra (elevação de pernas)', ['abdomen'], ['obliquos'], 'corporal', 'Deitado, suba as pernas sem tirar a lombar do chão.'),
  ex('elevacao-pernas-barra', 'Elevação de pernas na barra', ['abdomen'], ['obliquos', 'antebraco'], 'corporal', 'Pendurado, suba os joelhos (ou pernas retas) sem balançar.'),
  ex('prancha', 'Prancha', ['abdomen'], ['obliquos', 'ombros', 'lombar'], 'corporal', 'Corpo reto, glúteos contraídos. Anote o tempo em segundos no lugar das reps.'),
  ex('prancha-lateral', 'Prancha lateral', ['obliquos'], ['abdomen', 'ombros'], 'corporal', 'Apoio no antebraço, quadril alto. Anote os segundos nas reps.'),
  ex('abdominal-bicicleta', 'Abdominal bicicleta', ['obliquos', 'abdomen'], [], 'corporal', 'Leve o cotovelo em direção ao joelho oposto, alternando.'),
  ex('russian-twist', 'Rotação russa (russian twist)', ['obliquos'], ['abdomen'], 'corporal', 'Sentado, tronco inclinado para trás; gire de um lado para o outro.'),
  ex('abdominal-polia', 'Abdominal na polia (ajoelhado)', ['abdomen'], ['obliquos'], 'polia', 'Ajoelhado, puxe a corda enrolando o tronco para baixo.'),
  ex('abdominal-maquina', 'Abdominal na máquina', ['abdomen'], [], 'maquina', 'Enrole o tronco; não puxe com os braços.'),
  ex('roda-abdominal', 'Roda abdominal', ['abdomen'], ['costas', 'ombros', 'lombar'], 'corporal', 'Comece de joelhos; só vá até onde consegue manter a lombar neutra.'),

  // ---------- CARDIO ----------
  ex('esteira', 'Esteira', ['quadriceps', 'panturrilha'], ['gluteos', 'posterior'], 'cardio', 'Anote os minutos.', { grupo: 'cardio', tipo: 'cardio' }),
  ex('bicicleta', 'Bicicleta ergométrica', ['quadriceps'], ['gluteos', 'panturrilha'], 'cardio', 'Anote os minutos.', { grupo: 'cardio', tipo: 'cardio' }),
  ex('eliptico', 'Elíptico (transport)', ['quadriceps', 'gluteos'], ['panturrilha', 'peito', 'costas'], 'cardio', 'Anote os minutos.', { grupo: 'cardio', tipo: 'cardio' }),
  ex('escada', 'Escada (simulador)', ['quadriceps', 'gluteos'], ['panturrilha'], 'cardio', 'Anote os minutos.', { grupo: 'cardio', tipo: 'cardio' }),
  ex('pular-corda', 'Pular corda', ['panturrilha'], ['quadriceps', 'ombros'], 'corporal', 'Anote os minutos.', { grupo: 'cardio', tipo: 'cardio' }),
];
