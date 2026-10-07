import { carregar, salvar, padrao, exportarJSON, importarJSON, dataISO, uid } from './storage.js';
import { EXERCICIOS, MUSCULOS, GRUPOS, EQUIPAMENTOS, CATEGORIAS, NIVEIS, fotoURL, instrucoesURL } from './data/exercicios.js';
import { MODELOS } from './data/modelos.js';
import { corpoSVG } from './components/corpo.js';
import { graficoSVG } from './components/grafico.js';

let db = carregar();
const $ = (s) => document.querySelector(s);
const main = $('#main');

const LETRAS = 'ABCDEFG';
const DESCANSOS = [30, 45, 60, 90, 120, 180, 240];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

const filtroCat = { q: '', musculo: '', equip: '', cat: '', limite: 60 };
let novoEx = null;         // rascunho do exercício personalizado
let diaSelHist = null;     // dia tocado no calendário
let promptInstalar = null; // evento beforeinstallprompt

// ---------------------------------------------------------------- utilidades

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function semAcento(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
function num(v) {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}
function fmtNum(n) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10).replace('.', ',');
}
function primeiroNumero(s) {
  return (String(s ?? '').match(/\d+/) || [''])[0];
}
function fmtData(iso, comAno = false) {
  const d = new Date(iso + 'T12:00');
  const base = `${SEMANA[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  return comAno ? `${base}/${d.getFullYear()}` : base;
}
function hora(ts = Date.now()) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function gravar() {
  if (!salvar(db)) toast('Não consegui salvar (memória do navegador cheia?)');
}
function commit() {
  gravar();
  render();
}
function ir(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
}

// ---------------------------------------------------------------- exercícios

let cacheEx = { lista: null, mapa: null, pers: null };
function todosExercicios() {
  if (cacheEx.pers !== db.exerciciosPersonalizados || cacheEx.n !== db.exerciciosPersonalizados.length) {
    const lista = [...EXERCICIOS, ...db.exerciciosPersonalizados];
    cacheEx = { lista, mapa: new Map(lista.map((e) => [e.id, e])), pers: db.exerciciosPersonalizados, n: db.exerciciosPersonalizados.length };
  }
  return cacheEx.lista;
}
function exPorId(id) {
  todosExercicios();
  return cacheEx.mapa.get(id) ||
    { id, nome: '(exercício removido)', principais: [], secundarios: [], grupo: '', equipamento: '', dica: '', tipo: 'forca' };
}
// Miniatura (1ª foto) e prévia animada (alterna posição inicial e final).
function miniatura(e, cls = 'mini') {
  const url = fotoURL(e, 0);
  return url ? `<img class="${cls}" src="${url}" alt="" loading="lazy" decoding="async">` : `<span class="${cls} sem-foto">🏋️</span>`;
}
function previa(e) {
  if (!e.fotos) return '<div class="previa sem-foto">Sem foto para este exercício</div>';
  const b = e.fotos > 1 ? `<img class="b" src="${fotoURL(e, 1)}" alt="Posição final">` : '';
  return `<button class="previa ${e.fotos > 1 ? 'anima' : ''}" data-a="pausar-previa" aria-label="Pausar ou continuar a animação">
    <img src="${fotoURL(e, 0)}" alt="Posição inicial">${b}<span class="previa-dica">toque para pausar</span></button>`;
}
function linkVideo(e) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${e.nome} execução correta`)}`;
}
function chipsMusculos(e, pequeno = false) {
  const cls = pequeno ? ' peq' : '';
  return e.principais.map((m) => `<span class="chip prin${cls}">${esc(MUSCULOS[m] || m)}</span>`).join('') +
    e.secundarios.map((m) => `<span class="chip sec${cls}">${esc(MUSCULOS[m] || m)}</span>`).join('');
}
function musculosDe(listaIds) {
  const p = new Set(), s = new Set();
  listaIds.forEach((id) => {
    const e = exPorId(id);
    e.principais.forEach((m) => p.add(m));
    e.secundarios.forEach((m) => s.add(m));
  });
  return { principais: [...p], secundarios: [...s].filter((m) => !p.has(m)) };
}
// Cardio e alongamento não têm carga: registra-se só tempo.
function ehCardio(e) {
  return e.tipo === 'cardio' || e.tipo === 'alongamento';
}
function unidade(e) {
  return e.tipo === 'cardio' ? 'min' : e.tipo === 'alongamento' ? 'seg' : 'reps';
}

// ---------------------------------------------------------------- água e peso

function metaAgua() {
  const p = db.perfil;
  if (p.metaAguaMl) return p.metaAguaMl;
  if (p.pesoKg) return Math.round((p.pesoKg * 35) / 50) * 50;
  return 2000;
}
function aguaDia(d) {
  return (db.agua[d] || []).reduce((s, x) => s + x.ml, 0);
}
function addAgua(ml) {
  ml = Math.round(ml);
  if (!(ml > 0)) return;
  const hoje = dataISO();
  const antes = aguaDia(hoje);
  (db.agua[hoje] ||= []).push({ hora: hora(), ml });
  commit();
  const meta = metaAgua();
  if (antes < meta && antes + ml >= meta) toast('💧 Meta de água batida!');
  else toast(`+${ml} ml`);
}

// ---------------------------------------------------------------- planos e sessões

function planoPorId(id) {
  return db.planos.find((p) => p.id === id);
}
function planoAtivo() {
  return planoPorId(db.planoAtivoId) || db.planos[0] || null;
}
function sessoesOrdenadas() {
  return [...db.sessoes].sort((a, b) => b.inicio - a.inicio);
}
function proximoDiaIdx(plano) {
  const ult = sessoesOrdenadas().find((s) => s.planoId === plano.id);
  if (!ult) return 0;
  const i = plano.dias.findIndex((d) => d.letra === ult.letra);
  return i < 0 ? 0 : (i + 1) % plano.dias.length;
}
function ultimaVez(exId) {
  for (const s of sessoesOrdenadas()) {
    const item = s.itens.find((it) => it.exId === exId);
    if (item && item.series.length) return { data: s.data, series: item.series };
  }
  return null;
}
function novoItemTreino(exId, nSeries = 3, reps = '10', descansoSeg = 60, obs = '') {
  const ult = ultimaVez(exId);
  const series = Array.from({ length: Math.max(1, nSeries) }, (_, j) => {
    const s = ult ? ult.series[Math.min(j, ult.series.length - 1)] : null;
    return { kg: '', reps: '', feita: false, phKg: s ? fmtNum(s.kg) : '', phReps: s ? String(s.reps) : primeiroNumero(reps) };
  });
  return { exId, alvoSeries: nSeries, alvoReps: String(reps), descansoSeg, obs, series };
}
function comecarTreino(planoId, idx) {
  const plano = planoPorId(planoId);
  const dia = plano?.dias[idx];
  if (!dia) return;
  if (db.treinoAtual && !confirm('Já existe um treino em andamento. Descartar e começar outro?')) return;
  db.treinoAtual = {
    id: uid(), data: dataISO(), inicio: Date.now(), planoId, letra: dia.letra, nomeDia: dia.nome, nomePlano: plano.nome,
    itens: dia.exercicios.map((e) => novoItemTreino(e.exId, e.series, e.reps, e.descansoSeg, e.obs)),
  };
  gravar();
  ir('#/treino');
}
function textoUltimaVez(exId, cardio, un = 'min') {
  const u = ultimaVez(exId);
  if (!u) return '';
  const series = u.series.map((s) => (cardio ? `${s.reps} ${un}` : `${fmtNum(s.kg)}×${s.reps}`)).join(' · ');
  return `<p class="ultima">Última vez (${fmtData(u.data)}): ${series}</p>`;
}
// Valor sugerido (cinza) de uma série: o da última vez; se não houver, o da série anterior de hoje.
function sugestao(it, j) {
  const s = it.series[j];
  const ant = j > 0 ? sugestao(it, j - 1) : null;
  const antKg = j > 0 ? it.series[j - 1].kg || ant.kg : '';
  const antReps = j > 0 ? it.series[j - 1].reps || ant.reps : '';
  return { kg: s.phKg || antKg || '', reps: s.phReps || antReps || '' };
}
function litros(ml) {
  return (ml / 1000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
}
function e1rm(kg, reps) {
  return reps > 0 ? kg * (1 + reps / 30) : kg;
}

// ---------------------------------------------------------------- telas

function viewHoje() {
  const hoje = dataISO();
  const total = aguaDia(hoje);
  const meta = metaAgua();
  const pct = Math.min(1, total / meta);
  const C = 2 * Math.PI * 52;
  const falta = Math.max(0, meta - total);
  const copo = db.perfil.copoMl || 300;
  const registros = db.agua[hoje] || [];

  let cardTreino;
  if (db.treinoAtual) {
    const t = db.treinoAtual;
    cardTreino = `<section class="card destaque">
      <p class="rotulo">Treino em andamento</p>
      <div class="dia-linha"><span class="letra">${esc(t.letra)}</span><div><h2>${esc(t.nomeDia)}</h2><p class="mudo">começou às ${hora(t.inicio)}</p></div></div>
      <a class="btn prim largo" href="#/treino">Continuar treino</a>
    </section>`;
  } else {
    const plano = planoAtivo();
    if (!plano) {
      cardTreino = `<section class="card">
        <p class="rotulo">Treino</p>
        <p>Você ainda não montou um plano de treino.</p>
        <a class="btn prim largo" href="#/novo-plano">Criar meu plano (ABC, ABCD…)</a>
      </section>`;
    } else if (!plano.dias.length) {
      cardTreino = `<section class="card"><p>O plano <b>${esc(plano.nome)}</b> não tem dias.</p><a class="btn largo" href="#/plano/${plano.id}">Editar plano</a></section>`;
    } else {
      const idx = proximoDiaIdx(plano);
      const dia = plano.dias[idx];
      const mus = musculosDe(dia.exercicios.map((e) => e.exId));
      cardTreino = `<section class="card destaque">
        <p class="rotulo">Próximo treino · ${esc(plano.nome)}</p>
        <div class="dia-linha"><span class="letra">${esc(dia.letra)}</span><div><h2>${esc(dia.nome)}</h2><p class="mudo">${dia.exercicios.length} exercícios</p></div></div>
        <div class="chips">${mus.principais.map((m) => `<span class="chip prin peq">${esc(MUSCULOS[m])}</span>`).join('')}</div>
        <button class="btn prim largo" data-a="comecar" data-p="${plano.id}" data-i="${idx}" ${dia.exercicios.length ? '' : 'disabled'}>Começar treino ${esc(dia.letra)}</button>
        ${plano.dias.length > 1 ? `<p class="mudo peq-txt">Ou escolher outro:</p><div class="chips">${plano.dias.map((d, i) =>
          `<button class="chip-btn" data-a="comecar" data-p="${plano.id}" data-i="${i}">${esc(d.letra)} · ${esc(d.nome)}</button>`).join('')}</div>` : ''}
      </section>`;
    }
  }

  // últimos 7 dias
  const dias7 = Array.from({ length: 7 }, (_, k) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - k));
    const iso = dataISO(d);
    const ss = db.sessoes.filter((s) => s.data === iso);
    const bateuAgua = aguaDia(iso) >= metaAgua();
    return `<div class="dia7 ${iso === hoje ? 'hoje' : ''} ${ss.length ? 'treinou' : ''}">
      <span class="ds">${SEMANA[d.getDay()][0].toUpperCase()}</span>
      <span class="dl">${ss.length ? esc(ss.map((s) => s.letra).join('')) : '·'}</span>
      <span class="gota ${bateuAgua ? 'on' : ''}"></span>
    </div>`;
  }).join('');
  const nSemana = db.sessoes.filter((s) => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return s.data >= dataISO(d);
  }).length;

  return {
    titulo: 'Hoje', aba: 'hoje', semBanner: !!db.treinoAtual,
    html: `
    <section class="card agua">
      <div class="agua-topo">
        <svg viewBox="0 0 120 120" class="anel">
          <circle cx="60" cy="60" r="52" class="anel-fundo"/>
          <circle cx="60" cy="60" r="52" class="anel-valor" ${total ? '' : 'style="display:none"'} stroke-dasharray="${(pct * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 60 60)"/>
          <text x="60" y="58" text-anchor="middle" class="anel-num">${litros(total)} L</text>
          <text x="60" y="76" text-anchor="middle" class="anel-meta">de ${litros(meta)} L</text>
        </svg>
        <div>
          <p class="rotulo">Água hoje</p>
          <p class="agua-falta">${falta ? `Faltam <b>${falta} ml</b><br><span class="mudo">≈ ${Math.ceil(falta / copo)} copos de ${copo} ml</span>` : '<b>Meta batida! 💧</b>'}</p>
          ${!db.perfil.pesoKg && !db.perfil.metaAguaMl ? '<p class="mudo peq-txt">Cadastre seu peso no <a href="#/perfil">Perfil</a> para a meta ser calculada (35 ml × kg).</p>' : ''}
        </div>
      </div>
      <div class="agua-btns">
        <button class="btn agua-b" data-a="agua" data-ml="250">+250 ml</button>
        <button class="btn agua-b" data-a="agua" data-ml="500">+500 ml</button>
        <button class="btn agua-b" data-a="agua" data-ml="${copo}">+copo ${copo}</button>
        <button class="btn agua-b" data-a="agua-outro">outro…</button>
      </div>
      ${registros.length ? `<div class="agua-reg"><span class="mudo">${registros.slice(-4).map((r) => `${r.hora} +${r.ml} ml`).join(' · ')}</span>
        <button class="link" data-a="agua-desfazer">desfazer último</button></div>` : ''}
    </section>
    ${cardTreino}
    <section class="card">
      <p class="rotulo">Últimos 7 dias · ${nSemana} treino${nSemana === 1 ? '' : 's'}</p>
      <div class="semana7">${dias7}</div>
    </section>`,
  };
}

function viewTreinos() {
  const ativo = planoAtivo();
  const lista = db.planos.map((p) => `
    <a class="card item-plano" href="#/plano/${p.id}">
      <div class="dia-linha">
        <span class="letra peq">${esc(p.dias.map((d) => d.letra).join(''))}</span>
        <div><h2>${esc(p.nome)}</h2><p class="mudo">${p.dias.length} dia${p.dias.length === 1 ? '' : 's'} · ${p.dias.reduce((s, d) => s + d.exercicios.length, 0)} exercícios</p></div>
        ${ativo && ativo.id === p.id ? '<span class="selo">ATIVO</span>' : ''}
      </div>
      <p class="mudo peq-txt">${p.dias.map((d) => `${esc(d.letra)}: ${esc(d.nome)}`).join(' · ')}</p>
    </a>`).join('');
  return {
    titulo: 'Treinos', aba: 'treinos',
    html: `${lista || '<p class="vazio">Nenhum plano ainda. Crie um a partir de um modelo (ABC, ABCD, ABCDE…) ou do zero.</p>'}
      <a class="btn prim largo" href="#/novo-plano">+ Novo plano</a>`,
  };
}

function viewNovoPlano() {
  const cards = MODELOS.map((m) => `
    <section class="card">
      <h2>${esc(m.nome)}</h2>
      <p class="mudo">${esc(m.descricao)}</p>
      <ul class="lista-dias">${m.dias.map((d, i) => `<li><b>${LETRAS[i]}</b> ${esc(d.nome)} <span class="mudo">(${d.ex.length})</span></li>`).join('')}</ul>
      <button class="btn prim largo" data-a="criar-modelo" data-id="${m.id}">Usar ${esc(m.nome)}</button>
    </section>`).join('');
  return {
    titulo: 'Novo plano', aba: 'treinos', voltar: '#/treinos',
    html: `<p class="mudo">Os modelos já vêm com exercícios sugeridos. Depois você troca, tira, adiciona e muda séries e repetições como quiser.</p>
      <section class="card">
        <h2>Montar do zero</h2>
        <label class="campo-bloco">Nome do plano<input id="zero-nome" placeholder="Ex.: Meu treino de hipertrofia"></label>
        <label class="campo-bloco">Quantos treinos diferentes (A, B, C…)?
          <select id="zero-dias">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<option value="${n}" ${n === 3 ? 'selected' : ''}>${n} – ${LETRAS.slice(0, n).split('').join('')}</option>`).join('')}</select>
        </label>
        <button class="btn prim largo" data-a="criar-zero">Criar plano vazio</button>
      </section>
      <h3 class="secao">Modelos prontos</h3>
      ${cards}`,
  };
}

function viewPlano([, id]) {
  const p = planoPorId(id);
  if (!p) return { redirect: '#/treinos' };
  const ativo = planoAtivo()?.id === p.id;
  const dias = p.dias.map((d, i) => {
    const mus = musculosDe(d.exercicios.map((e) => e.exId));
    return `<a class="card item-dia" href="#/dia/${p.id}/${i}">
      <div class="dia-linha"><span class="letra">${esc(d.letra)}</span>
        <div><h2>${esc(d.nome)}</h2><p class="mudo">${d.exercicios.length} exercícios</p></div><span class="seta">›</span></div>
      <div class="chips">${mus.principais.map((m) => `<span class="chip prin peq">${esc(MUSCULOS[m])}</span>`).join('')}</div>
    </a>`;
  }).join('');
  return {
    titulo: p.nome, aba: 'treinos', voltar: '#/treinos',
    html: `
      <label class="campo-bloco">Nome do plano<input data-c="plano-nome" data-p="${p.id}" value="${esc(p.nome)}"></label>
      ${ativo ? '<p class="selo-linha"><span class="selo">PLANO ATIVO</span> aparece na tela Hoje</p>'
        : `<button class="btn largo" data-a="ativar-plano" data-p="${p.id}">Usar como plano ativo</button>`}
      ${dias || '<p class="vazio">Sem dias. Adicione um.</p>'}
      ${p.dias.length < 7 ? `<button class="btn largo" data-a="add-dia" data-p="${p.id}">+ Adicionar treino ${LETRAS[p.dias.length]}</button>` : ''}
      <button class="btn perigo largo" data-a="excluir-plano" data-p="${p.id}">Excluir plano</button>`,
  };
}

function viewDia([, planoId, idxStr]) {
  const p = planoPorId(planoId);
  const idx = Number(idxStr);
  const d = p?.dias[idx];
  if (!d) return { redirect: p ? `#/plano/${planoId}` : '#/treinos' };
  const mus = musculosDe(d.exercicios.map((e) => e.exId));
  const lista = d.exercicios.map((it, i) => {
    const e = exPorId(it.exId);
    return `<section class="card ex-edit">
      <div class="ex-cab">
        <span class="ordem">${i + 1}</span><button class="mini-btn" data-a="ver-previa" data-id="${esc(e.id)}" aria-label="Ver como fazer">${miniatura(e)}</button>
        <a href="#/exercicio/${encodeURIComponent(e.id)}" class="ex-nome">${esc(e.nome)}</a>
        <div class="mini-btns">
          <button class="ico" data-a="ex-mover" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button>
          <button class="ico" data-a="ex-mover" data-i="${i}" data-d="1" ${i === d.exercicios.length - 1 ? 'disabled' : ''} aria-label="Descer">↓</button>
          <button class="ico perigo" data-a="ex-remover" data-i="${i}" aria-label="Remover">✕</button>
        </div>
      </div>
      <div class="chips">${chipsMusculos(e, true)}</div>
      <div class="ex-campos">
        <label>Séries<input type="number" min="1" max="12" inputmode="numeric" data-c="ex-campo" data-k="series" data-i="${i}" value="${esc(it.series)}"></label>
        <label>${{ min: 'Minutos', seg: 'Segundos', reps: 'Repetições' }[unidade(e)]}<input data-c="ex-campo" data-k="reps" data-i="${i}" value="${esc(it.reps)}" placeholder="10-12"></label>
        <label>Descanso<select data-c="ex-campo" data-k="descansoSeg" data-i="${i}">
          ${DESCANSOS.map((s) => `<option value="${s}" ${Number(it.descansoSeg) === s ? 'selected' : ''}>${s < 60 ? s + ' s' : (s / 60).toString().replace('.', ',') + ' min'}</option>`).join('')}
        </select></label>
      </div>
      <label class="campo-obs"><input data-c="ex-campo" data-k="obs" data-i="${i}" value="${esc(it.obs)}" placeholder="Observação (ex.: drop-set na última, pegada aberta)"></label>
    </section>`;
  }).join('');
  return {
    titulo: `Treino ${d.letra}`, aba: 'treinos', voltar: `#/plano/${p.id}`,
    html: `
      <label class="campo-bloco">Nome do treino ${esc(d.letra)}<input data-c="dia-nome" value="${esc(d.nome)}" placeholder="Ex.: Peito e Tríceps"></label>
      ${d.exercicios.length ? `<section class="card"><p class="rotulo">Músculos deste treino</p>${corpoSVG(mus.principais, mus.secundarios)}</section>` : ''}
      ${lista || '<p class="vazio">Nenhum exercício. Toque em “Adicionar exercício”.</p>'}
      <a class="btn prim largo" href="#/catalogo?add=${p.id}.${idx}">+ Adicionar exercício</a>
      ${d.exercicios.length ? `<button class="btn largo" data-a="comecar" data-p="${p.id}" data-i="${idx}">▶ Começar este treino agora</button>` : ''}
      <button class="btn perigo largo" data-a="excluir-dia">Excluir treino ${esc(d.letra)}</button>`,
    ctx: { plano: p, dia: d, idx },
  };
}

function modoCatalogo(params) {
  const add = params.add || '';
  if (add === 'treino') return { tipo: 'treino-add' };
  if (add.startsWith('troca.')) return { tipo: 'treino-troca', i: Number(add.split('.')[1]) };
  if (add) {
    const [planoId, idx] = add.split('.');
    const plano = planoPorId(planoId);
    const dia = plano?.dias[Number(idx)];
    if (dia) return { tipo: 'dia', plano, dia, idx: Number(idx) };
  }
  return { tipo: 'ver' };
}

function listaCatalogo(modo) {
  const q = semAcento(filtroCat.q.trim());
  const m = filtroCat.musculo;
  const itens = todosExercicios().filter((e) =>
    (!q || semAcento(e.nome).includes(q) || (e.img && e.img.toLowerCase().replace(/_/g, ' ').includes(q))) &&
    (!filtroCat.equip || e.equipamento === filtroCat.equip) &&
    (!filtroCat.cat || (e.categoria || 'musculacao') === filtroCat.cat) &&
    (!m || (m === 'cardio' || m === 'alongamento' ? e.grupo === m : e.principais.includes(m) || e.secundarios.includes(m)))
  );
  if (!itens.length) return '<p class="vazio">Nada encontrado.</p>';
  const jaNoDia = modo.tipo === 'dia' ? new Set(modo.dia.exercicios.map((x) => x.exId)) : new Set();
  const item = (e) => `<button class="item-ex ${jaNoDia.has(e.id) ? 'ja' : ''}" data-a="cat-item" data-id="${esc(e.id)}">
      ${miniatura(e)}
      <div class="item-ex-txt"><b>${esc(e.nome)}</b><span class="mudo peq-txt">${esc(EQUIPAMENTOS[e.equipamento] || '')}${e.personalizado ? ' · personalizado' : ''}${e.categoria && e.categoria !== 'musculacao' ? ` · ${esc(CATEGORIAS[e.categoria])}` : ''}</span>
      <div class="chips">${chipsMusculos(e, true)}</div></div>
      <span class="item-ex-acao">${modo.tipo === 'ver' ? '›' : jaNoDia.has(e.id) ? '✓' : '+'}</span>
    </button>`;

  // Ordem: por grupo (ou principal/secundário quando filtra músculo), curados primeiro, depois alfabético.
  const porMusculo = m && m !== 'cardio' && m !== 'alongamento';
  const ordemGrupo = Object.keys(GRUPOS);
  const chave = (e) => (porMusculo ? (e.principais.includes(m) ? 0 : 1) : ordemGrupo.indexOf(e.grupo));
  itens.sort((a, b) => chave(a) - chave(b) || (b.curado ? 1 : 0) - (a.curado ? 1 : 0) || (a.curado ? 0 : a.nome.localeCompare(b.nome, 'pt')));
  const titulo = (e) => (porMusculo
    ? (e.principais.includes(m) ? `Trabalham ${MUSCULOS[m]} como principal` : `Também usam ${MUSCULOS[m]} (secundário)`)
    : GRUPOS[e.grupo] || e.grupo);

  let html = `<p class="mudo peq-txt">${itens.length} exercício${itens.length === 1 ? '' : 's'}</p>`;
  let atual = null;
  for (const e of itens.slice(0, filtroCat.limite)) {
    const t = titulo(e);
    if (t !== atual) {
      atual = t;
      html += `<h3 class="secao">${esc(t)}</h3>`;
    }
    html += item(e);
  }
  if (itens.length > filtroCat.limite) {
    html += `<button class="btn largo" data-a="cat-mais">Mostrar mais (${itens.length - filtroCat.limite} restantes)</button>`;
  }
  return html;
}

function viewCatalogo(_, params) {
  const modo = modoCatalogo(params);
  let banner = '';
  let voltar;
  if (modo.tipo === 'dia') {
    voltar = `#/dia/${modo.plano.id}/${modo.idx}`;
    banner = `<div class="banner-add">Adicionando em <b>${esc(modo.dia.letra)} – ${esc(modo.dia.nome)}</b> (${modo.dia.exercicios.length})
      <a class="btn prim peq" href="${voltar}">Concluir</a></div>`;
  } else if (modo.tipo === 'treino-add') {
    voltar = '#/treino';
    banner = '<div class="banner-add">Escolha o exercício para adicionar ao treino de agora <a class="btn peq" href="#/treino">Cancelar</a></div>';
  } else if (modo.tipo === 'treino-troca') {
    voltar = '#/treino';
    const atual = exPorId(db.treinoAtual?.itens[modo.i]?.exId);
    banner = `<div class="banner-add">Trocar <b>${esc(atual.nome)}</b> por… <a class="btn peq" href="#/treino">Cancelar</a></div>`;
  }
  const muscs = Object.entries(GRUPOS);
  return {
    titulo: 'Catálogo', aba: 'catalogo', voltar,
    html: `${banner}
      <div class="busca-linha">
        <input id="busca" type="search" data-c="busca" placeholder="Buscar exercício…" value="${esc(filtroCat.q)}" autocomplete="off">
      </div>
      <div class="filtros-linha">
        <select data-c="equip-filtro" aria-label="Equipamento"><option value="">Todo equipamento</option>
          ${Object.entries(EQUIPAMENTOS).map(([k, v]) => `<option value="${k}" ${filtroCat.equip === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}
        </select>
        <select data-c="cat-filtro" aria-label="Tipo de exercício"><option value="">Todos os tipos</option>
          ${Object.entries(CATEGORIAS).map(([k, v]) => `<option value="${k}" ${filtroCat.cat === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}
        </select>
      </div>
      <div class="chips rolar">
        <button class="chip-btn ${!filtroCat.musculo ? 'on' : ''}" data-a="filtro-musc" data-m="">Todos</button>
        ${muscs.map(([k, v]) => `<button class="chip-btn ${filtroCat.musculo === k ? 'on' : ''}" data-a="filtro-musc" data-m="${k}">${esc(v)}</button>`).join('')}
      </div>
      <p class="legenda-chips"><span class="chip prin peq">principal</span> <span class="chip sec peq">secundário</span>
        <a class="link dir" href="#/novo-exercicio">+ criar exercício</a></p>
      <div id="lista-cat">${listaCatalogo(modo)}</div>`,
    ctx: { modo },
  };
}

function viewExercicio([, idEnc]) {
  const id = decodeURIComponent(idEnc || '');
  const e = todosExercicios().find((x) => x.id === id);
  if (!e) return { redirect: '#/catalogo' };
  const usos = [];
  db.planos.forEach((p) => p.dias.forEach((d) => {
    if (d.exercicios.some((x) => x.exId === id)) usos.push(`${esc(p.nome)} → ${esc(d.letra)} (${esc(d.nome)})`);
  }));
  const logs = db.sessoes.filter((s) => s.itens.some((it) => it.exId === id));
  let recorde = '';
  if (logs.length && !ehCardio(e)) {
    let melhor = { kg: 0, reps: 0 };
    logs.forEach((s) => s.itens.filter((it) => it.exId === id).forEach((it) => it.series.forEach((sr) => {
      if (sr.kg > melhor.kg || (sr.kg === melhor.kg && sr.reps > melhor.reps)) melhor = sr;
    })));
    recorde = `<p>🏆 Recorde: <b>${fmtNum(melhor.kg)} kg × ${melhor.reps}</b></p>`;
  }
  return {
    titulo: e.nome, aba: 'catalogo', voltar: '#/catalogo',
    html: `
      <section class="card">
        ${previa(e)}
        <a class="btn largo video" href="${linkVideo(e)}" target="_blank" rel="noopener">▶ Ver vídeo de como fazer (YouTube)</a>
      </section>
      <section class="card">
        ${corpoSVG(e.principais, e.secundarios)}
        <p class="rotulo">Músculo principal</p><div class="chips">${e.principais.map((m) => `<span class="chip prin">${esc(MUSCULOS[m])}</span>`).join('')}</div>
        ${e.secundarios.length ? `<p class="rotulo">Secundários (ajudam)</p><div class="chips">${e.secundarios.map((m) => `<span class="chip sec">${esc(MUSCULOS[m])}</span>`).join('')}</div>` : ''}
        <div class="info-linha">
          <div><p class="rotulo">Equipamento</p><p>${esc(EQUIPAMENTOS[e.equipamento] || '—')}</p></div>
          <div><p class="rotulo">Tipo</p><p>${esc(CATEGORIAS[e.categoria] || 'Musculação')}</p></div>
          ${e.nivel ? `<div><p class="rotulo">Nível</p><p>${esc(NIVEIS[e.nivel])}</p></div>` : ''}
        </div>
        ${e.dica ? `<p class="rotulo">Dica</p><p>${esc(e.dica)}</p>` : ''}
        ${instrucoesURL(e) ? '<div id="instrucoes"><p class="mudo peq-txt">Carregando passo a passo…</p></div>' : ''}
      </section>
      ${usos.length ? `<section class="card"><p class="rotulo">Está nos seus treinos</p><ul class="lista-dias">${usos.map((u) => `<li>${u}</li>`).join('')}</ul></section>` : ''}
      ${logs.length ? `<section class="card">${recorde}<p class="mudo">Feito em ${logs.length} treino${logs.length === 1 ? '' : 's'}.</p>
        <a class="btn largo" href="#/evolucao/${encodeURIComponent(id)}">📈 Ver evolução</a></section>` : ''}
      <button class="btn prim largo" data-a="sheet-add-ex" data-id="${esc(id)}">+ Adicionar a um treino</button>
      ${e.personalizado ? `<button class="btn perigo largo" data-a="excluir-exercicio" data-id="${esc(id)}">Excluir exercício personalizado</button>` : ''}`,
    depois: () => carregarInstrucoes(e),
  };
}

// Passo a passo traduzido (data/passos-pt.json, baixado uma vez). Se faltar, usa o original em inglês.
let passosPT = null;
function carregarPassosPT() {
  passosPT ||= fetch('data/passos-pt.json').then((r) => r.json()).catch(() => ({}));
  return passosPT;
}
async function carregarInstrucoes(e) {
  const url = instrucoesURL(e);
  if (!url) return;
  let html;
  const pt = (await carregarPassosPT())[e.img];
  if (pt?.length) {
    html = `<p class="rotulo">Passo a passo</p><ol class="passos-lista">${pt.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>`;
  } else {
    try {
      const dados = await (await fetch(url)).json();
      const passos = dados.instructions || [];
      if (!passos.length) throw new Error('vazio');
      const texto = passos.map((p, i) => `${i + 1}. ${p}`).join('\n');
      html = `<details class="passos"><summary>Passo a passo detalhado (em inglês)</summary>
        <ol>${passos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
        <a class="link" href="https://translate.google.com/?sl=en&tl=pt&op=translate&text=${encodeURIComponent(texto)}" target="_blank" rel="noopener">Traduzir para o português ↗</a>
      </details>`;
    } catch {
      html = navigator.onLine
        ? '<p class="mudo peq-txt">Este exercício não tem passo a passo escrito — veja o vídeo acima.</p>'
        : '<p class="mudo peq-txt">Passo a passo indisponível sem internet.</p>';
    }
  }
  const alvo = document.getElementById('instrucoes');
  if (alvo && decodeURIComponent(rota().partes[1] || '') === e.id) alvo.innerHTML = html;
}

function viewNovoExercicio() {
  novoEx ||= { nome: '', principais: [], secundarios: [], equipamento: 'halter', dica: '' };
  const estado = (m) => (novoEx.principais.includes(m) ? 'prin' : novoEx.secundarios.includes(m) ? 'sec' : '');
  return {
    titulo: 'Novo exercício', aba: 'catalogo', voltar: '#/catalogo',
    html: `
      <label class="campo-bloco">Nome<input data-c="nx" data-k="nome" value="${esc(novoEx.nome)}" placeholder="Ex.: Remada no TRX"></label>
      <label class="campo-bloco">Equipamento<select data-c="nx" data-k="equipamento">
        ${Object.entries(EQUIPAMENTOS).map(([k, v]) => `<option value="${k}" ${novoEx.equipamento === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}
      </select></label>
      <p class="rotulo">Músculos — toque 1× = principal, 2× = secundário, 3× = tira</p>
      <div class="chips">${Object.entries(MUSCULOS).map(([k, v]) => `<button class="chip-btn musc-${estado(k)}" data-a="nx-musc" data-m="${k}">${esc(v)}</button>`).join('')}</div>
      <section class="card">${corpoSVG(novoEx.principais, novoEx.secundarios)}</section>
      <label class="campo-bloco">Dica de execução (opcional)<textarea data-c="nx" data-k="dica" rows="3">${esc(novoEx.dica)}</textarea></label>
      <button class="btn prim largo" data-a="nx-salvar">Salvar exercício</button>`,
  };
}

function viewTreino() {
  const t = db.treinoAtual;
  if (!t) return { redirect: '#/hoje' };
  const itens = t.itens.map((it, i) => {
    const e = exPorId(it.exId);
    const cardio = ehCardio(e);
    const feitas = it.series.filter((s) => s.feita).length;
    const series = it.series.map((s, j) => {
      const ph = sugestao(it, j);
      return `
      <div class="serie ${s.feita ? 'ok' : ''}">
        <span class="n">${j + 1}</span>
        ${cardio ? '' : `<label class="campo"><input data-c="serie" data-i="${i}" data-j="${j}" data-k="kg" inputmode="decimal" value="${esc(s.kg)}" placeholder="${esc(ph.kg || '0')}"><span>kg</span></label>`}
        <label class="campo"><input data-c="serie" data-i="${i}" data-j="${j}" data-k="reps" inputmode="numeric" value="${esc(s.reps)}" placeholder="${esc(ph.reps)}"><span>${unidade(e)}</span></label>
        <button class="check" data-a="serie-ok" data-i="${i}" data-j="${j}" aria-label="Marcar série feita">✓</button>
      </div>`;
    }).join('');
    return `<section class="card treino-ex ${feitas === it.series.length ? 'completo' : ''}">
      <div class="ex-cab"><span class="ordem">${i + 1}</span><button class="mini-btn" data-a="ver-previa" data-id="${esc(e.id)}" aria-label="Ver como fazer">${miniatura(e)}</button><a class="ex-nome" href="#/exercicio/${encodeURIComponent(e.id)}">${esc(e.nome)}</a>
        <span class="mudo peq-txt">${feitas}/${it.series.length}</span></div>
      <div class="chips">${chipsMusculos(e, true)}</div>
      <p class="mudo peq-txt">Meta: ${it.alvoSeries} × ${esc(it.alvoReps)}${it.descansoSeg ? ` · descanso ${it.descansoSeg < 60 ? it.descansoSeg + ' s' : fmtNum(it.descansoSeg / 60) + ' min'}` : ''}${it.obs ? ` · ${esc(it.obs)}` : ''}</p>
      ${textoUltimaVez(it.exId, cardio, unidade(e))}
      <div class="series">${series}</div>
      <div class="mini-acoes">
        <button class="link" data-a="serie-add" data-i="${i}">+ série</button>
        <button class="link" data-a="serie-del" data-i="${i}" ${it.series.length <= 1 ? 'disabled' : ''}>− série</button>
        <a class="link" href="#/catalogo?add=troca.${i}">trocar</a>
        <button class="link perigo" data-a="treino-ex-del" data-i="${i}">remover</button>
      </div>
    </section>`;
  }).join('');
  const min = Math.floor((Date.now() - t.inicio) / 60000);
  return {
    titulo: `Treino ${t.letra}`, aba: 'hoje', semBanner: true,
    html: `
      <div class="treino-topo"><div><h2>${esc(t.nomeDia)}</h2><p class="mudo">${esc(t.nomePlano)} · começou ${hora(t.inicio)}</p></div>
        <span class="cronometro" id="cronometro">${min} min</span></div>
      <p class="mudo peq-txt">Os números cinza são o que você fez da última vez. Digite o que fez agora (ou deixe igual) e toque em ✓.</p>
      ${itens || '<p class="vazio">Sem exercícios.</p>'}
      <a class="btn largo" href="#/catalogo?add=treino">+ Adicionar exercício</a>
      <button class="btn prim largo" data-a="finalizar">✔ Finalizar treino</button>
      <button class="btn perigo largo" data-a="cancelar-treino">Descartar treino</button>`,
  };
}

function viewSessao([, id]) {
  const s = db.sessoes.find((x) => x.id === id);
  if (!s) return { redirect: '#/historico' };
  const dur = s.fim ? Math.round((s.fim - s.inicio) / 60000) : null;
  let volume = 0;
  const itens = s.itens.map((it) => {
    const e = exPorId(it.exId);
    const cardio = ehCardio(e);
    it.series.forEach((sr) => { if (!cardio) volume += sr.kg * sr.reps; });
    return `<a class="card sessao-ex" href="#/evolucao/${encodeURIComponent(it.exId)}">
      <b>${esc(e.nome)}</b>
      <div class="chips">${chipsMusculos(e, true)}</div>
      <p>${it.series.map((sr) => (cardio ? `${sr.reps} ${unidade(e)}` : `${fmtNum(sr.kg)} kg × ${sr.reps}`)).join(' · ')}</p>
    </a>`;
  }).join('');
  const mus = musculosDe(s.itens.map((it) => it.exId));
  return {
    titulo: `Treino ${s.letra}`, aba: 'historico', voltar: '#/historico',
    html: `<section class="card">
        <h2>${esc(s.nomeDia)}</h2>
        <p class="mudo">${fmtData(s.data, true)} · ${esc(s.nomePlano || '')}${dur !== null ? ` · ${dur} min` : ''}</p>
        <p>${s.itens.length} exercícios · ${s.itens.reduce((a, it) => a + it.series.length, 0)} séries · volume ${fmtNum(Math.round(volume))} kg</p>
        ${corpoSVG(mus.principais, mus.secundarios)}
      </section>
      ${itens}
      <button class="btn perigo largo" data-a="excluir-sessao" data-id="${s.id}">Excluir este registro</button>`,
  };
}

function viewHistorico(_, params) {
  const hoje = dataISO();
  const mesStr = /^\d{4}-\d{2}$/.test(params.m || '') ? params.m : hoje.slice(0, 7);
  const [ano, mes] = mesStr.split('-').map(Number);
  const primeiro = new Date(ano, mes - 1, 1);
  const nDias = new Date(ano, mes, 0).getDate();
  const meta = metaAgua();
  const ant = new Date(ano, mes - 2, 1), prox = new Date(ano, mes, 1);
  const mesISO = (d) => dataISO(d).slice(0, 7);

  let celulas = '';
  for (let k = 0; k < primeiro.getDay(); k++) celulas += '<span class="cel vazia"></span>';
  let treinosMes = 0, aguaMes = 0;
  for (let dia = 1; dia <= nDias; dia++) {
    const iso = `${mesStr}-${String(dia).padStart(2, '0')}`;
    const ss = db.sessoes.filter((s) => s.data === iso);
    const agua = aguaDia(iso) >= meta;
    treinosMes += ss.length;
    if (agua) aguaMes++;
    celulas += `<button class="cel ${iso === hoje ? 'hoje' : ''} ${ss.length ? 'treinou' : ''} ${iso === diaSelHist ? 'sel' : ''}" data-a="hist-dia" data-d="${iso}">
      <span class="num">${dia}</span>${ss.length ? `<span class="let">${esc(ss.map((s) => s.letra).join(''))}</span>` : ''}${agua ? '<span class="gota on"></span>' : ''}
    </button>`;
  }

  let detalhe = '';
  if (diaSelHist) {
    const ss = db.sessoes.filter((s) => s.data === diaSelHist);
    const a = aguaDia(diaSelHist);
    detalhe = `<section class="card">
      <p class="rotulo">${fmtData(diaSelHist, true)}</p>
      <p>💧 Água: <b>${litros(a)} L</b> ${a >= meta ? '(meta batida)' : ''}</p>
      ${ss.map((s) => `<a class="linha-sessao" href="#/sessao/${s.id}"><span class="letra peq">${esc(s.letra)}</span><span>${esc(s.nomeDia)}<br><span class="mudo peq-txt">${s.itens.length} exercícios</span></span><span class="seta">›</span></a>`).join('') || '<p class="mudo">Sem treino neste dia.</p>'}
    </section>`;
  }

  // exercícios com registro, do mais recente
  const vistos = new Map();
  sessoesOrdenadas().forEach((s) => s.itens.forEach((it) => { if (!vistos.has(it.exId)) vistos.set(it.exId, s.data); }));
  const evol = [...vistos.entries()].map(([exId, data]) => {
    const e = exPorId(exId);
    return `<a class="linha-sessao" href="#/evolucao/${encodeURIComponent(exId)}"><span>${esc(e.nome)}<br><span class="mudo peq-txt">último: ${fmtData(data)}</span></span><span class="seta">›</span></a>`;
  }).join('');

  const recentes = sessoesOrdenadas().slice(0, 8).map((s) =>
    `<a class="linha-sessao" href="#/sessao/${s.id}"><span class="letra peq">${esc(s.letra)}</span><span>${esc(s.nomeDia)}<br><span class="mudo peq-txt">${fmtData(s.data, true)}</span></span><span class="seta">›</span></a>`).join('');

  return {
    titulo: 'Histórico', aba: 'historico',
    html: `<section class="card">
        <div class="mes-nav">
          <button class="ico" data-a="mes" data-m="${mesISO(ant)}" aria-label="Mês anterior">‹</button>
          <b>${MESES[mes - 1]} ${ano}</b>
          <button class="ico" data-a="mes" data-m="${mesISO(prox)}" aria-label="Próximo mês">›</button>
        </div>
        <div class="cal">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => `<span class="cal-cab">${d}</span>`).join('')}${celulas}</div>
        <p class="mudo peq-txt">${treinosMes} treino${treinosMes === 1 ? '' : 's'} no mês · ${aguaMes} dia${aguaMes === 1 ? '' : 's'} com a meta de água <span class="gota on inline"></span></p>
      </section>
      ${detalhe}
      ${recentes ? `<section class="card"><p class="rotulo">Treinos recentes</p>${recentes}</section>` : '<p class="vazio">Nenhum treino registrado ainda.</p>'}
      ${evol ? `<section class="card"><p class="rotulo">📈 Evolução por exercício</p>${evol}</section>` : ''}`,
    ctx: { mesStr },
  };
}

function viewEvolucao([, idEnc]) {
  const id = decodeURIComponent(idEnc || '');
  const e = exPorId(id);
  const cardio = ehCardio(e);
  const regs = [...db.sessoes].sort((a, b) => a.inicio - b.inicio)
    .map((s) => ({ s, series: s.itens.filter((it) => it.exId === id).flatMap((it) => it.series) }))
    .filter((r) => r.series.length);
  if (!regs.length) {
    return { titulo: e.nome, aba: 'historico', voltar: '#/historico', html: '<p class="vazio">Ainda sem registros deste exercício.</p>' };
  }
  const semCarga = regs.every((r) => r.series.every((sr) => !sr.kg));
  let graficos;
  if (cardio) {
    graficos = `<p class="rotulo">Tempo por treino (${unidade(e)})</p>${graficoSVG(regs.map((r) => ({ data: r.s.data, y: r.series.reduce((a, sr) => a + sr.reps, 0) })), { unidade: unidade(e) })}`;
  } else if (semCarga) {
    graficos = `<p class="rotulo">Máximo de repetições numa série</p>${graficoSVG(regs.map((r) => ({ data: r.s.data, y: Math.max(...r.series.map((sr) => sr.reps)) })), { unidade: 'reps' })}`;
  } else {
    graficos = `<p class="rotulo">Maior carga do dia</p>${graficoSVG(regs.map((r) => ({ data: r.s.data, y: Math.max(...r.series.map((sr) => sr.kg)) })), { unidade: 'kg' })}
      <p class="rotulo">Força estimada (1RM = carga × (1 + reps/30))</p>${graficoSVG(regs.map((r) => ({ data: r.s.data, y: Math.round(Math.max(...r.series.map((sr) => e1rm(sr.kg, sr.reps)))) })), { unidade: 'kg', classe: 'serie-2' })}`;
  }
  const tabela = [...regs].reverse().map((r) => `<tr><td>${fmtData(r.s.data)}</td><td>${r.series.map((sr) => (cardio ? `${sr.reps} ${unidade(e)}` : `${fmtNum(sr.kg)}×${sr.reps}`)).join(' · ')}</td></tr>`).join('');
  return {
    titulo: e.nome, aba: 'historico', voltar: '#/historico',
    html: `<section class="card"><div class="chips">${chipsMusculos(e, true)}</div>${graficos}</section>
      <section class="card"><p class="rotulo">Todas as vezes</p><table class="tab">${tabela}</table></section>`,
  };
}

function viewPerfil() {
  const p = db.perfil;
  const pesos = [...db.pesos].sort((a, b) => b.data.localeCompare(a.data));
  const auto = !p.metaAguaMl;
  const metaAuto = p.pesoKg ? Math.round((p.pesoKg * 35) / 50) * 50 : 2000;
  return {
    titulo: 'Perfil', aba: 'perfil',
    html: `
      <label class="campo-bloco">Seu nome<input data-c="perfil" data-k="nome" value="${esc(p.nome)}" placeholder="Opcional"></label>
      <section class="card">
        <p class="rotulo">Peso corporal</p>
        <p class="peso-atual">${p.pesoKg ? `<b>${fmtNum(p.pesoKg)} kg</b>` : 'Ainda não registrado'}</p>
        <div class="linha-form">
          <input id="peso-kg" inputmode="decimal" placeholder="kg" aria-label="Peso em kg">
          <input id="peso-data" type="date" value="${dataISO()}" aria-label="Data">
          <button class="btn prim" data-a="add-peso">Registrar</button>
        </div>
        ${pesos.length ? graficoSVG(db.pesos.map((x) => ({ data: x.data, y: x.kg })), { unidade: 'kg', classe: 'serie-3' }) : ''}
        ${pesos.length ? `<table class="tab">${pesos.slice(0, 12).map((x) => `<tr><td>${fmtData(x.data, true)}</td><td><b>${fmtNum(x.kg)} kg</b></td><td><button class="ico perigo" data-a="del-peso" data-d="${x.data}" aria-label="Apagar">✕</button></td></tr>`).join('')}</table>` : ''}
      </section>
      <section class="card">
        <p class="rotulo">Meta de água</p>
        <label class="check-linha"><input type="checkbox" data-ch="meta-auto" ${auto ? 'checked' : ''}> Calcular pelo peso (35 ml × kg = ${metaAuto} ml)</label>
        ${auto ? '' : `<label class="campo-bloco">Meta manual (ml)<input inputmode="numeric" data-c="perfil" data-k="metaAguaMl" value="${esc(p.metaAguaMl)}"></label>`}
        <label class="campo-bloco">Tamanho do seu copo/garrafa (ml)<input inputmode="numeric" data-c="perfil" data-k="copoMl" value="${esc(p.copoMl)}"></label>
      </section>
      ${promptInstalar ? '<button class="btn prim largo" data-a="instalar">📲 Instalar o app no celular</button>' : ''}
      <section class="card">
        <p class="rotulo">Backup</p>
        <p class="mudo peq-txt">Seus dados ficam só neste aparelho. Exporte de vez em quando para não perder (troca de celular, limpar dados do navegador…).</p>
        <button class="btn largo" data-a="exportar">⬇ Exportar backup (.json)</button>
        <label class="btn largo">⬆ Importar backup<input type="file" accept="application/json,.json" data-ch="importar" hidden></label>
        <button class="btn perigo largo" data-a="apagar-tudo">Apagar todos os dados</button>
      </section>`,
  };
}

const VIEWS = {
  hoje: viewHoje,
  treinos: viewTreinos,
  'novo-plano': viewNovoPlano,
  plano: viewPlano,
  dia: viewDia,
  catalogo: viewCatalogo,
  exercicio: viewExercicio,
  'novo-exercicio': viewNovoExercicio,
  treino: viewTreino,
  sessao: viewSessao,
  historico: viewHistorico,
  evolucao: viewEvolucao,
  perfil: viewPerfil,
};

// ---------------------------------------------------------------- render

function rota() {
  const h = location.hash.replace(/^#\/?/, '');
  const [caminho, qs = ''] = h.split('?');
  return { partes: caminho.split('/').filter(Boolean), params: Object.fromEntries(new URLSearchParams(qs)) };
}

let ctx = {};
function render() {
  const { partes, params } = rota();
  const fn = VIEWS[partes[0]] || viewHoje;
  let v;
  try {
    v = fn(partes, params);
  } catch (err) {
    console.error(err);
    v = { titulo: 'Ops', html: `<p class="vazio">Algo deu errado nesta tela.<br><small>${esc(err.message)}</small></p><a class="btn largo" href="#/hoje">Voltar ao início</a>` };
  }
  if (v.redirect) {
    location.replace(v.redirect);
    return;
  }
  ctx = v.ctx || {};
  document.title = `${v.titulo} · OASIS`;
  $('#titulo').textContent = v.titulo;
  const bv = $('#voltar');
  bv.hidden = !v.voltar;
  bv.dataset.href = v.voltar || '';
  main.innerHTML = v.html;
  document.querySelectorAll('#abas a').forEach((a) => a.classList.toggle('on', a.dataset.aba === v.aba));
  const banner = $('#banner-treino');
  if (db.treinoAtual && !v.semBanner) {
    banner.innerHTML = `<a href="#/treino">🏋️ Treino ${esc(db.treinoAtual.letra)} em andamento · <b>continuar</b></a>`;
    banner.hidden = false;
  } else {
    banner.hidden = true;
  }
  v.depois?.();
}

// ---------------------------------------------------------------- sheet

function abrirSheet(html) {
  const s = $('#sheet');
  s.innerHTML = `<div class="sheet-fundo" data-a="fechar-sheet"></div><div class="sheet-caixa">${html}<button class="btn largo" data-a="fechar-sheet">Fechar</button></div>`;
  s.hidden = false;
}
function fecharSheet() {
  $('#sheet').hidden = true;
  $('#sheet').innerHTML = '';
}

// ---------------------------------------------------------------- ações (cliques)

const ACOES = {
  'fechar-sheet': fecharSheet,

  agua: (el) => addAgua(Number(el.dataset.ml)),
  'agua-outro': () => {
    const v = prompt('Quantos ml?', '200');
    if (v !== null) addAgua(num(v));
  },
  'agua-desfazer': () => {
    const l = db.agua[dataISO()];
    if (l?.length) {
      const r = l.pop();
      commit();
      toast(`Removido ${r.ml} ml`);
    }
  },

  comecar: (el) => comecarTreino(el.dataset.p, Number(el.dataset.i)),

  'criar-modelo': (el) => {
    const m = MODELOS.find((x) => x.id === el.dataset.id);
    const plano = {
      id: uid(), nome: m.nome, divisao: m.nome,
      dias: m.dias.map((d, i) => ({
        letra: LETRAS[i], nome: d.nome,
        exercicios: d.ex.map(([exId, series, reps]) => ({ exId, series, reps: String(reps), descansoSeg: series >= 4 ? 90 : 60, obs: '' })),
      })),
    };
    db.planos.push(plano);
    if (!planoPorId(db.planoAtivoId)) db.planoAtivoId = plano.id;
    gravar();
    toast(`Plano ${m.nome} criado`);
    ir(`#/plano/${plano.id}`);
  },
  'criar-zero': () => {
    const n = Number($('#zero-dias').value) || 3;
    const nome = $('#zero-nome').value.trim() || `Meu treino ${LETRAS.slice(0, n)}`;
    const plano = {
      id: uid(), nome, divisao: LETRAS.slice(0, n),
      dias: Array.from({ length: n }, (_, i) => ({ letra: LETRAS[i], nome: `Treino ${LETRAS[i]}`, exercicios: [] })),
    };
    db.planos.push(plano);
    if (!planoPorId(db.planoAtivoId)) db.planoAtivoId = plano.id;
    gravar();
    ir(`#/plano/${plano.id}`);
  },
  'ativar-plano': (el) => {
    db.planoAtivoId = el.dataset.p;
    commit();
    toast('Plano ativo atualizado');
  },
  'add-dia': (el) => {
    const p = planoPorId(el.dataset.p);
    if (p.dias.length >= 7) return;
    const letra = LETRAS[p.dias.length];
    p.dias.push({ letra, nome: `Treino ${letra}`, exercicios: [] });
    gravar();
    ir(`#/dia/${p.id}/${p.dias.length - 1}`);
  },
  'excluir-plano': (el) => {
    const p = planoPorId(el.dataset.p);
    if (!confirm(`Excluir o plano "${p.nome}"? (o histórico de treinos continua)`)) return;
    db.planos = db.planos.filter((x) => x.id !== p.id);
    if (db.planoAtivoId === p.id) db.planoAtivoId = db.planos[0]?.id || null;
    gravar();
    ir('#/treinos');
  },
  'excluir-dia': () => {
    const { plano, idx, dia } = ctx;
    if (!confirm(`Excluir o treino ${dia.letra} – ${dia.nome}?`)) return;
    plano.dias.splice(idx, 1);
    plano.dias.forEach((d, i) => { d.letra = LETRAS[i]; });
    plano.divisao = plano.dias.map((d) => d.letra).join('');
    gravar();
    ir(`#/plano/${plano.id}`);
  },
  'ex-mover': (el) => {
    const l = ctx.dia.exercicios;
    const i = Number(el.dataset.i), j = i + Number(el.dataset.d);
    if (j < 0 || j >= l.length) return;
    [l[i], l[j]] = [l[j], l[i]];
    commit();
  },
  'ex-remover': (el) => {
    const i = Number(el.dataset.i);
    const nome = exPorId(ctx.dia.exercicios[i].exId).nome;
    if (!confirm(`Tirar "${nome}" deste treino?`)) return;
    ctx.dia.exercicios.splice(i, 1);
    commit();
  },

  'cat-mais': () => {
    filtroCat.limite += 60;
    $('#lista-cat').innerHTML = listaCatalogo(ctx.modo);
  },
  'pausar-previa': (el) => el.classList.toggle('pausada'),
  'ver-previa': (el) => {
    const e = exPorId(el.dataset.id);
    abrirSheet(`<p class="sheet-plano">${esc(e.nome)}</p>${previa(e)}
      <div class="chips">${chipsMusculos(e, true)}</div>
      ${e.dica ? `<p class="peq-txt">${esc(e.dica)}</p>` : ''}
      <a class="btn largo video" href="${linkVideo(e)}" target="_blank" rel="noopener">▶ Ver vídeo (YouTube)</a>`);
  },
  'filtro-musc': (el) => {
    filtroCat.musculo = el.dataset.m;
    filtroCat.limite = 60;
    document.querySelectorAll('[data-a="filtro-musc"]').forEach((b) => b.classList.toggle('on', b === el));
    $('#lista-cat').innerHTML = listaCatalogo(ctx.modo);
  },
  'cat-item': (el) => {
    const id = el.dataset.id;
    const modo = ctx.modo;
    if (modo.tipo === 'dia') {
      modo.dia.exercicios.push({ exId: id, series: 3, reps: { cardio: '20', alongamento: '30' }[exPorId(id).tipo] || '10-12', descansoSeg: 60, obs: '' });
      gravar();
      toast(`✓ ${exPorId(id).nome} adicionado`);
      render();
    } else if (modo.tipo === 'treino-add' && db.treinoAtual) {
      db.treinoAtual.itens.push(novoItemTreino(id, 3, '10'));
      gravar();
      ir('#/treino');
    } else if (modo.tipo === 'treino-troca' && db.treinoAtual?.itens[modo.i]) {
      const velho = db.treinoAtual.itens[modo.i];
      db.treinoAtual.itens[modo.i] = novoItemTreino(id, velho.alvoSeries, velho.alvoReps, velho.descansoSeg, velho.obs);
      gravar();
      ir('#/treino');
    } else {
      ir(`#/exercicio/${encodeURIComponent(id)}`);
    }
  },
  'sheet-add-ex': (el) => {
    const id = el.dataset.id;
    if (!db.planos.length) {
      abrirSheet('<p>Você ainda não tem plano de treino.</p><a class="btn prim largo" href="#/novo-plano" data-a="fechar-sheet">Criar plano</a>');
      return;
    }
    abrirSheet(`<p class="rotulo">Adicionar em qual treino?</p>${db.planos.map((p) => `
      <p class="sheet-plano">${esc(p.nome)}</p>
      ${p.dias.map((d, i) => `<button class="item-ex" data-a="add-ex-dia" data-p="${p.id}" data-i="${i}" data-id="${esc(id)}">
        <span class="letra peq">${esc(d.letra)}</span><span class="item-ex-txt">${esc(d.nome)}</span>
        <span class="item-ex-acao">${d.exercicios.some((x) => x.exId === id) ? '✓' : '+'}</span></button>`).join('')}`).join('')}`);
  },
  'add-ex-dia': (el) => {
    const p = planoPorId(el.dataset.p);
    const d = p.dias[Number(el.dataset.i)];
    d.exercicios.push({ exId: el.dataset.id, series: 3, reps: '10-12', descansoSeg: 60, obs: '' });
    gravar();
    fecharSheet();
    toast(`Adicionado ao treino ${d.letra} (${p.nome})`);
    render();
  },
  'excluir-exercicio': (el) => {
    if (!confirm('Excluir este exercício personalizado?')) return;
    db.exerciciosPersonalizados = db.exerciciosPersonalizados.filter((x) => x.id !== el.dataset.id);
    gravar();
    ir('#/catalogo');
  },
  'nx-musc': (el) => {
    const m = el.dataset.m;
    const p = novoEx.principais, s = novoEx.secundarios;
    if (p.includes(m)) {
      novoEx.principais = p.filter((x) => x !== m);
      s.push(m);
    } else if (s.includes(m)) {
      novoEx.secundarios = s.filter((x) => x !== m);
    } else {
      p.push(m);
    }
    render();
  },
  'nx-salvar': () => {
    const nome = novoEx.nome.trim();
    if (!nome) return toast('Dê um nome ao exercício');
    if (!novoEx.principais.length) return toast('Marque pelo menos 1 músculo principal');
    const e = {
      id: 'p-' + uid(), nome, grupo: novoEx.principais[0], principais: novoEx.principais, secundarios: novoEx.secundarios,
      equipamento: novoEx.equipamento, dica: novoEx.dica.trim(), tipo: novoEx.equipamento === 'cardio' ? 'cardio' : 'forca', personalizado: true,
    };
    db.exerciciosPersonalizados.push(e);
    novoEx = null;
    gravar();
    toast('Exercício criado');
    ir(`#/exercicio/${encodeURIComponent(e.id)}`);
  },

  'serie-ok': (el) => {
    const it = db.treinoAtual.itens[Number(el.dataset.i)];
    const j = Number(el.dataset.j);
    const s = it.series[j];
    s.feita = !s.feita;
    if (s.feita) {
      const ph = sugestao(it, j);
      if (s.kg === '') s.kg = ph.kg || '0';
      if (s.reps === '') s.reps = ph.reps || '';
      if (s.reps === '') {
        s.feita = false;
        toast('Digite as repetições');
      }
    }
    commit();
  },
  'serie-add': (el) => {
    const it = db.treinoAtual.itens[Number(el.dataset.i)];
    const ult = it.series[it.series.length - 1];
    it.series.push({ kg: '', reps: '', feita: false, phKg: ult?.kg || ult?.phKg || '', phReps: ult?.reps || ult?.phReps || '' });
    commit();
  },
  'serie-del': (el) => {
    const it = db.treinoAtual.itens[Number(el.dataset.i)];
    if (it.series.length > 1) it.series.pop();
    commit();
  },
  'treino-ex-del': (el) => {
    const i = Number(el.dataset.i);
    if (!confirm(`Tirar "${exPorId(db.treinoAtual.itens[i].exId).nome}" do treino de hoje?`)) return;
    db.treinoAtual.itens.splice(i, 1);
    commit();
  },
  finalizar: () => {
    const t = db.treinoAtual;
    const itens = t.itens
      .map((it) => ({ exId: it.exId, series: it.series.filter((s) => s.feita).map((s) => ({ kg: num(s.kg), reps: num(s.reps) })) }))
      .filter((it) => it.series.length);
    if (!itens.length) {
      toast('Marque ✓ nas séries que você fez');
      return;
    }
    const pendentes = t.itens.reduce((a, it) => a + it.series.filter((s) => !s.feita).length, 0);
    if (pendentes && !confirm(`${pendentes} série(s) sem ✓ não serão salvas. Finalizar?`)) return;
    const sessao = { id: t.id, data: t.data, inicio: t.inicio, fim: Date.now(), planoId: t.planoId, letra: t.letra, nomeDia: t.nomeDia, nomePlano: t.nomePlano, itens };
    db.sessoes.push(sessao);
    db.treinoAtual = null;
    gravar();
    toast('💪 Treino salvo!');
    ir(`#/sessao/${sessao.id}`);
  },
  'cancelar-treino': () => {
    if (!confirm('Descartar este treino? Nada será salvo.')) return;
    db.treinoAtual = null;
    gravar();
    ir('#/hoje');
  },
  'excluir-sessao': (el) => {
    if (!confirm('Excluir este treino do histórico?')) return;
    db.sessoes = db.sessoes.filter((s) => s.id !== el.dataset.id);
    gravar();
    ir('#/historico');
  },

  mes: (el) => {
    diaSelHist = null;
    ir(`#/historico?m=${el.dataset.m}`);
  },
  'hist-dia': (el) => {
    diaSelHist = diaSelHist === el.dataset.d ? null : el.dataset.d;
    render();
  },

  'add-peso': () => {
    const kg = num($('#peso-kg').value);
    const data = $('#peso-data').value || dataISO();
    if (!(kg > 20 && kg < 400)) return toast('Digite um peso válido em kg');
    db.pesos = db.pesos.filter((x) => x.data !== data);
    db.pesos.push({ data, kg });
    atualizarPesoAtual();
    commit();
    toast(`Peso ${fmtNum(kg)} kg registrado`);
  },
  'del-peso': (el) => {
    db.pesos = db.pesos.filter((x) => x.data !== el.dataset.d);
    atualizarPesoAtual();
    commit();
  },
  instalar: async () => {
    if (!promptInstalar) return;
    promptInstalar.prompt();
    await promptInstalar.userChoice;
    promptInstalar = null;
    render();
  },
  exportar: () => {
    const blob = new Blob([exportarJSON(db)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `treino-backup-${dataISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  },
  'apagar-tudo': () => {
    if (!confirm('Apagar TODOS os dados (treinos, histórico, água, peso)?')) return;
    if (!confirm('Tem certeza? Isso não pode ser desfeito. Exportou o backup?')) return;
    db = padrao();
    commit();
    toast('Dados apagados');
  },
};

function atualizarPesoAtual() {
  const ult = [...db.pesos].sort((a, b) => b.data.localeCompare(a.data))[0];
  db.perfil.pesoKg = ult ? ult.kg : null;
}

// ---------------------------------------------------------------- campos (digitação)

const CAMPOS = {
  busca: (el) => {
    filtroCat.q = el.value;
    filtroCat.limite = 60;
    $('#lista-cat').innerHTML = listaCatalogo(ctx.modo);
  },
  'equip-filtro': (el) => {
    filtroCat.equip = el.value;
    filtroCat.limite = 60;
    $('#lista-cat').innerHTML = listaCatalogo(ctx.modo);
  },
  'cat-filtro': (el) => {
    filtroCat.cat = el.value;
    filtroCat.limite = 60;
    $('#lista-cat').innerHTML = listaCatalogo(ctx.modo);
  },
  'plano-nome': (el) => {
    const p = planoPorId(el.dataset.p);
    p.nome = el.value;
    $('#titulo').textContent = el.value;
    gravar();
  },
  'dia-nome': (el) => {
    ctx.dia.nome = el.value;
    gravar();
  },
  'ex-campo': (el) => {
    const it = ctx.dia.exercicios[Number(el.dataset.i)];
    const k = el.dataset.k;
    it[k] = k === 'series' ? Math.max(1, Math.min(12, parseInt(el.value, 10) || 1)) : k === 'descansoSeg' ? Number(el.value) : el.value;
    gravar();
  },
  serie: (el) => {
    const s = db.treinoAtual.itens[Number(el.dataset.i)].series[Number(el.dataset.j)];
    s[el.dataset.k] = el.value.replace(/[^\d.,]/g, '');
    gravar();
  },
  perfil: (el) => {
    const k = el.dataset.k;
    if (k === 'nome') db.perfil.nome = el.value;
    else db.perfil[k] = parseInt(el.value, 10) || null;
    if (k === 'copoMl' && !db.perfil.copoMl) db.perfil.copoMl = 300;
    gravar();
  },
  nx: (el) => {
    novoEx[el.dataset.k] = el.value;
  },
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-a]');
  if (el && ACOES[el.dataset.a] && !el.disabled) {
    if (el.tagName === 'A' && el.dataset.a === 'fechar-sheet') {
      fecharSheet();
      return;
    }
    ev.preventDefault();
    ACOES[el.dataset.a](el, ev);
  }
});
document.addEventListener('input', (ev) => {
  const el = ev.target.closest('[data-c]');
  if (el && CAMPOS[el.dataset.c]) CAMPOS[el.dataset.c](el);
});
document.addEventListener('change', async (ev) => {
  const el = ev.target.closest('[data-ch]');
  if (!el) return;
  if (el.dataset.ch === 'meta-auto') {
    db.perfil.metaAguaMl = el.checked ? null : metaAgua();
    commit();
  } else if (el.dataset.ch === 'importar') {
    const f = el.files[0];
    if (!f) return;
    try {
      const novo = importarJSON(await f.text());
      if (!confirm('Substituir os dados deste aparelho pelos do backup?')) return;
      db = novo;
      commit();
      toast('Backup importado');
    } catch (err) {
      alert('Não deu para importar: ' + err.message);
    }
  }
});
$('#voltar').addEventListener('click', () => {
  const alvo = $('#voltar').dataset.href;
  if (alvo) ir(alvo);
});
window.addEventListener('hashchange', () => {
  fecharSheet();
  render();
  window.scrollTo(0, 0);
});

// prévia do exercício: alterna posição inicial e final
setInterval(() => {
  document.querySelectorAll('.previa.anima:not(.pausada)').forEach((p) => p.classList.toggle('fim'));
}, 1200);

// atualiza cronômetro do treino
setInterval(() => {
  const c = $('#cronometro');
  if (c && db.treinoAtual) c.textContent = `${Math.floor((Date.now() - db.treinoAtual.inicio) / 60000)} min`;
}, 15000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && rota().partes[0] !== 'treino') {
    db = carregar();
    render();
  }
});

window.addEventListener('beforeinstallprompt', (ev) => {
  ev.preventDefault();
  promptInstalar = ev;
  if (rota().partes[0] === 'perfil') render();
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch((err) => console.warn('SW:', err));
}

if (!location.hash) location.replace('#/hoje');
render();
