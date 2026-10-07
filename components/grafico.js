// Gráfico de linha simples em SVG. pontos = [{ data: 'AAAA-MM-DD', y: número }]

function dm(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function fmt(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');
}

export function graficoSVG(pontos, { unidade = '', classe = 'serie-1' } = {}) {
  if (!pontos.length) return '<p class="vazio">Sem registros ainda.</p>';
  const L = 340, A = 190, esq = 40, dir = 14, topo = 16, base = 30;
  const ordenados = [...pontos].sort((a, b) => a.data.localeCompare(b.data));
  const ts = ordenados.map((p) => new Date(p.data + 'T12:00').getTime());
  const ys = ordenados.map((p) => p.y);
  let yMin = Math.min(...ys), yMax = Math.max(...ys);
  const folga = Math.max((yMax - yMin) * 0.15, yMax * 0.05, 1);
  yMin = Math.max(0, yMin - folga);
  yMax = yMax + folga;
  const t0 = ts[0], t1 = ts[ts.length - 1];
  const px = (t) => (t1 === t0 ? esq + (L - esq - dir) / 2 : esq + ((t - t0) / (t1 - t0)) * (L - esq - dir));
  const py = (y) => topo + (1 - (y - yMin) / (yMax - yMin)) * (A - topo - base);

  const grade = [0, 1, 2, 3].map((i) => {
    const v = yMin + ((yMax - yMin) * i) / 3;
    const y = py(v);
    return `<line x1="${esq}" x2="${L - dir}" y1="${y}" y2="${y}" class="grade"/>
      <text x="${esq - 6}" y="${y + 4}" text-anchor="end" class="eixo">${fmt(Math.round(v * 10) / 10)}</text>`;
  }).join('');

  const caminho = ordenados.map((p, i) => `${i ? 'L' : 'M'}${px(ts[i]).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
  const bolas = ordenados.map((p, i) =>
    `<circle cx="${px(ts[i])}" cy="${py(p.y)}" r="4" class="ponto"><title>${dm(p.data)}: ${fmt(p.y)} ${unidade}</title></circle>`
  ).join('');
  const ult = ordenados[ordenados.length - 1];
  const rotX = [`<text x="${px(t0)}" y="${A - 8}" text-anchor="${t1 === t0 ? 'middle' : 'start'}" class="eixo">${dm(ordenados[0].data)}</text>`];
  if (t1 !== t0) rotX.push(`<text x="${px(t1)}" y="${A - 8}" text-anchor="end" class="eixo">${dm(ult.data)}</text>`);

  return `<svg class="grafico ${classe}" viewBox="0 0 ${L} ${A}" role="img" aria-label="Gráfico de evolução">
    ${grade}
    <path d="${caminho}" class="linha" fill="none"/>
    ${bolas}
    <text x="${Math.min(px(t1), L - dir)}" y="${py(ult.y) - 10}" text-anchor="end" class="valor">${fmt(ult.y)} ${unidade}</text>
    ${rotX.join('')}
  </svg>`;
}
