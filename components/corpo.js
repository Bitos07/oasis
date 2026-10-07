// Desenho do corpo (frente e costas) que pinta os músculos de um exercício.
// Cada figura tem 200 de largura; as formas são desenhadas só do lado esquerdo
// e espelhadas no eixo x = 100.

const FRENTE = [
  // [músculo ou null para parte neutra, forma SVG]
  ['pescoco', '<rect x="92" y="46" width="8" height="14"/>'],
  [null, '<path d="M78,160 L100,166 L100,188 L92,186 L80,174 Z"/>'],
  [null, '<ellipse cx="50" cy="190" rx="7" ry="10"/>'],
  [null, '<ellipse cx="84" cy="262" rx="10" ry="8"/>'],
  [null, '<ellipse cx="83" cy="324" rx="10" ry="6"/>'],
  ['trapezio', '<path d="M92,54 Q88,62 76,66 L96,64 Z"/>'],
  ['ombros', '<ellipse cx="70" cy="77" rx="13" ry="12"/>'],
  ['peito', '<path d="M100,68 L84,66 Q74,72 75,86 Q80,101 100,100 Z"/>'],
  ['biceps', '<ellipse cx="62" cy="107" rx="8.5" ry="18"/>'],
  ['antebraco', '<path d="M55,128 Q47,152 45,178 L55,180 Q63,154 69,128 Z"/>'],
  ['obliquos', '<path d="M76,100 L87,103 Q85,130 88,158 L80,154 Q73,128 76,100 Z"/>'],
  ['abdomen', '<path d="M89,103 L100,103 L100,162 L90,159 Q87,130 89,103 Z"/>'],
  ['quadriceps', '<path d="M79,174 Q69,204 75,250 Q85,258 95,250 Q98,216 92,188 Z"/>'],
  ['adutores', '<path d="M93,188 L100,190 L100,206 Q98,222 95,232 Q98,208 93,188 Z"/>'],
  ['panturrilha', '<path d="M76,272 Q71,296 77,316 L89,316 Q93,292 91,272 Z"/>'],
];

const COSTAS = [
  ['pescoco', '<rect x="92" y="46" width="8" height="10"/>'],
  [null, '<ellipse cx="50" cy="190" rx="7" ry="10"/>'],
  [null, '<ellipse cx="84" cy="262" rx="10" ry="8"/>'],
  [null, '<ellipse cx="83" cy="324" rx="10" ry="6"/>'],
  ['trapezio', '<path d="M100,50 L92,56 L76,66 L88,74 L100,104 Z"/>'],
  ['ombros', '<ellipse cx="70" cy="77" rx="13" ry="12"/>'],
  ['costas', '<path d="M77,88 Q79,80 87,78 L99,106 L99,132 L90,146 Q78,128 77,88 Z"/>'],
  ['triceps', '<ellipse cx="62" cy="107" rx="8.5" ry="18"/>'],
  ['antebraco', '<path d="M55,128 Q47,152 45,178 L55,180 Q63,154 69,128 Z"/>'],
  ['lombar', '<path d="M91,148 L100,136 L100,162 L86,162 Z"/>'],
  ['obliquos', '<path d="M80,132 L89,148 L85,162 L78,158 Z"/>'],
  ['gluteos', '<path d="M77,168 Q80,163 100,165 L100,194 Q86,200 76,188 Z"/>'],
  ['posterior', '<path d="M77,198 Q71,222 76,250 Q86,257 96,250 Q99,224 97,202 Z"/>'],
  ['panturrilha', '<path d="M76,270 Q69,290 77,308 Q84,314 90,306 Q95,286 91,270 Z"/>'],
];

function classe(musculo, principais, secundarios) {
  if (!musculo) return 'm-neutro';
  if (principais.includes(musculo)) return 'm-prin';
  if (secundarios.includes(musculo)) return 'm-sec';
  return 'm-base';
}

function figura(formas, principais, secundarios) {
  const metade = formas
    .map(([m, forma]) => `<g class="${classe(m, principais, secundarios)}"${m ? ` data-musculo="${m}"` : ''}>${forma}</g>`)
    .join('');
  return `<ellipse class="m-neutro" cx="100" cy="27" rx="16" ry="20"/>${metade}<g transform="translate(200,0) scale(-1,1)">${metade}</g>`;
}

export function corpoSVG(principais = [], secundarios = [], { legenda = true } = {}) {
  const leg = legenda
    ? `<g class="leg" font-size="14">
        <rect x="70" y="346" width="12" height="12" rx="3" class="m-prin"/><text x="88" y="356">Principal</text>
        <rect x="220" y="346" width="12" height="12" rx="3" class="m-sec"/><text x="238" y="356">Secundário</text>
      </g>`
    : '';
  return `<svg class="corpo" viewBox="0 0 420 ${legenda ? 364 : 344}" role="img" aria-label="Músculos trabalhados">
    <g stroke-width="1.5" stroke-linejoin="round">${figura(FRENTE, principais, secundarios)}</g>
    <g transform="translate(220,0)" stroke-width="1.5" stroke-linejoin="round">${figura(COSTAS, principais, secundarios)}</g>
    <text x="100" y="342" text-anchor="middle" class="corpo-rot">Frente</text>
    <text x="320" y="342" text-anchor="middle" class="corpo-rot">Costas</text>
    ${leg}
  </svg>`;
}
