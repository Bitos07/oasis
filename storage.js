// Dados do app ficam no localStorage do aparelho.
const CHAVE = 'treino-app:v1';
const VERSAO = 1;

export function padrao() {
  return {
    versao: VERSAO,
    perfil: { nome: '', pesoKg: null, metaAguaMl: null, copoMl: 300 },
    agua: {},          // { 'AAAA-MM-DD': [ {hora, ml} ] }
    pesos: [],         // [ {data, kg} ]
    planos: [],
    planoAtivoId: null,
    sessoes: [],
    treinoAtual: null, // treino em andamento (sobrevive se o celular recarregar a página)
    exerciciosPersonalizados: [],
  };
}

function normalizar(d) {
  const base = padrao();
  if (!d || typeof d !== 'object') return base;
  return { ...base, ...d, perfil: { ...base.perfil, ...(d.perfil || {}) }, versao: VERSAO };
}

export function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? normalizar(JSON.parse(bruto)) : padrao();
  } catch {
    return padrao();
  }
}

export function salvar(dados) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
    return true;
  } catch {
    return false;
  }
}

export function exportarJSON(dados) {
  return JSON.stringify({ app: 'treino-app', exportadoEm: new Date().toISOString(), dados }, null, 2);
}

export function importarJSON(texto) {
  const obj = JSON.parse(texto);
  const dados = obj && obj.app === 'treino-app' ? obj.dados : obj;
  if (!dados || !Array.isArray(dados.planos) || !Array.isArray(dados.sessoes)) {
    throw new Error('Arquivo não é um backup deste app.');
  }
  return normalizar(dados);
}

// Data local no formato AAAA-MM-DD (não usa UTC, para não virar o dia às 21h).
export function dataISO(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
