/* Simula uma partida inteira comprando o que mais rende, e mostra o ritmo. */
require('../js/dados.js');
require('../js/nucleo.js');
require('../js/financas.js');
const RL = globalThis.RL;

const jogo = RL.jogoNovo();
RL.completarContratos(jogo);
const clone = (x) => JSON.parse(JSON.stringify(x));

function encaixes(build, jogo) {
  const l = RL.limites(jogo);
  const c = ['bico', 'capsula', 'escudo', 'enfeite'];
  for (let m = 0; m < l.modulos; m++) c.push('mod' + m);
  for (let e = 0; e < l.estagios; e++) {
    for (let t = 0; t < l.tanques; t++) c.push(`e${e}.t${t}`);
    c.push(`e${e}.motor`, `e${e}.aletas`, `e${e}.lateral`);
  }
  return c;
}

function valor(build, jogo) {
  if (RL.problemasDoBuild(build).length) return 0;
  const a = RL.atributos(build, jogo);
  const s = RL.simular(a);
  return s.h * Math.sqrt(a.pagamento) * (1 + 0.1 * Math.min(1, a.casco / 300));
}

/* Melhor foguete possível só com as peças que já tem. */
function otimizarBuild(jogo) {
  let build = jogo.foguete;
  let melhor = valor(build, jogo);
  for (let volta = 0; volta < 3; volta++) {
    for (const c of encaixes(build, jogo)) {
      for (const tipo of RL.aceita(c)) {
        for (const p of RL.PECAS_POR_TIPO[tipo].filter((q) => jogo.pecas.includes(q.id)).slice(-3)) {
          const b = clone(build);
          RL.encaixar(b, c, p.id);
          const v = valor(b, jogo);
          if (v > melhor * 1.0001) {
            melhor = v;
            build = b;
          }
        }
      }
    }
  }
  /* Estágio novo só vale com tanque e motor juntos: testa a cópia do estágio de baixo. */
  const l = RL.limites(jogo);
  while (build.estagios.length < l.estagios) {
    const b = clone(build);
    b.estagios.push(clone(b.estagios[0]));
    const v = valor(b, jogo);
    if (v <= melhor) break;
    melhor = v;
    build = b;
  }
  jogo.foguete = build;
  return melhor;
}

function comprar(jogo) {
  let comprou = true;
  let guarda = 0;
  while (comprou && guarda++ < 80) {
    comprou = false;
    const base = otimizarBuild(jogo);
    let alvo = null;
    let nota = 0;
    for (const q of RL.PESQUISAS) {
      const custo = RL.custoPesquisa(jogo, q.id);
      if (!isFinite(custo) || custo > jogo.moedas || (q.requerLua && !jogo.chegouLua)) continue;
      const j2 = clone(jogo);
      j2.pesquisa[q.id] = (j2.pesquisa[q.id] || 0) + 1;
      const ganho = otimizarSimples(j2) / Math.max(base, 0.01);
      const n = (ganho - 1 + 0.002) / custo;
      if (n > nota) {
        nota = n;
        alvo = ['pesquisa', q.id];
      }
    }
    const candidatas = Object.values(RL.PECAS_POR_TIPO).flatMap((l) => l.filter((p) => !jogo.pecas.includes(p.id) && RL.pecaLiberada(jogo, p) && p.preco <= jogo.moedas).slice(-1));
    for (const p of candidatas) {
      const j2 = clone(jogo);
      j2.pecas.push(p.id);
      const ganho = otimizarSimples(j2) / Math.max(base, 0.01);
      const n = (ganho - 1 + 0.002) / Math.max(1, p.preco);
      if (n > nota) {
        nota = n;
        alvo = ['peca', p.id];
      }
    }
    if (alvo) {
      if (alvo[0] === 'peca') RL.comprarPeca(jogo, alvo[1]);
      else RL.comprarPesquisa(jogo, alvo[1]);
      comprou = true;
    }
  }
  otimizarBuild(jogo);
}

function otimizarSimples(j) {
  const b0 = j.foguete;
  let build = clone(b0);
  let melhor = valor(build, j);
  for (const c of encaixes(build, j)) {
    for (const tipo of RL.aceita(c)) {
      const donos = RL.PECAS_POR_TIPO[tipo].filter((p) => j.pecas.includes(p.id));
      for (const p of donos.slice(-2)) {
        const b = clone(build);
        RL.encaixar(b, c, p.id);
        const v = valor(b, j);
        if (v > melhor) {
          melhor = v;
          build = b;
        }
      }
    }
  }
  const l = RL.limites(j);
  while (build.estagios.length < l.estagios) {
    const b = clone(build);
    b.estagios.push(clone(b.estagios[0]));
    const v = valor(b, j);
    if (v <= melhor) break;
    melhor = v;
    build = b;
  }
  return melhor;
}

const historico = [];
let vooLua = 0;
const ATE_PLUTAO = process.argv.includes('--tudo');
/* Tempo real: o jogador acelera metade do voo quando tem o recurso. */
const minutosReais = (min, a) => (a.tempoMax > 1 ? min * (0.5 + 0.5 / a.tempoMax) : min) + 0.5;
for (let voo = 1; voo <= 700; voo++) {
  const antes = jogo.pecas.length + Object.values(jogo.pesquisa).reduce((x, y) => x + y, 0);
  comprar(jogo);
  const compras = jogo.pecas.length + Object.values(jogo.pesquisa).reduce((x, y) => x + y, 0) - antes;
  const a = RL.atributos(jogo.foguete, jogo);
  const s = RL.simular(a);
  /* Jogador mediano: moedas valem 55% da distância, bate um pouco, pega combo e uma caixa. Estimativa: nenhuma pessoa jogou ainda. */
  s.moedas = RL.pagamentoDistancia(s.h, a) * 0.55;
  s.moedasN = 30; s.comboMax = 3; s.trizes = 2; s.batidas = voo % 3 === 0 ? 0 : 2;
  s.ganhoTriz = RL.valorMoeda(s.h, a) * 12;
  RL.abrirCaixa(s, a, jogo);
  const f = RL.fechamento(s, a, jogo);
  RL.aplicarFechamento(jogo, f, s);
  historico.push({ voo, km: s.h, min: s.t / 60, real: minutosReais(s.t / 60, a), pago: f.total, vMax: s.vMax, compras });
  if (s.h >= RL.KM_LUA && !vooLua) { vooLua = voo; if (!ATE_PLUTAO) break; }
  if (s.fim === 'plutao') break;
}

const PASSO = Math.max(1, Math.round(historico.length / 16));
for (const h of historico) {
  if (h.voo <= 3 || h.voo % PASSO === 0 || h === historico[historico.length - 1]) {
    console.log(`voo ${String(h.voo).padStart(3)}  ${h.km.toFixed(1).padStart(12)} km  ${h.min.toFixed(1).padStart(5)} min (real ${h.real.toFixed(1).padStart(5)})  ${h.vMax.toFixed(1).padStart(8)} km/s  pago ${String(h.pago).padStart(10)}  compras ${h.compras}`);
  }
}
const voosAte = (km) => { const h = historico.find((x) => x.km >= km); return h ? h.voo : '-'; };
const horasAte = (km) => { let t = 0; for (const h of historico) { t += h.real; if (h.km >= km) break; } return (t / 60).toFixed(1); };
console.log('\nATOS  100 km: voo', voosAte(100), `(${horasAte(100)} h)`, '| 36 mil km: voo', voosAte(36000), `(${horasAte(36000)} h)`, '| Lua: voo', voosAte(RL.KM_LUA), `(${horasAte(RL.KM_LUA)} h)`);
const semCompra = historico.filter((h) => h.compras === 0).length;
console.log(`voos sem nenhuma compra: ${semCompra} de ${historico.length}. Maior voo: ${Math.max(...historico.map((h) => h.min)).toFixed(0)} min.`);
const totalMin = historico.reduce((t, h) => t + h.real, 0);
console.log(`voos: ${historico.length}  chegou: ${jogo.chegouLua}  horas reais: ${(totalMin / 60).toFixed(1)}  peças: ${jogo.pecas.length}  níveis: ${Object.values(jogo.pesquisa).reduce((a, b) => a + b, 0)}`);
console.log('foguete:', JSON.stringify(jogo.foguete));

/* Metas do jogo: se a calibragem sair daqui, o teste falha em vez de passar despercebido. */
if (!ATE_PLUTAO) {
  const vMax = historico.find((h) => h.vMax >= 149.9);
  const metas = [
    ['espaço (100 km) entre os voos 25 e 40', voosAte(100) >= 25 && voosAte(100) <= 40],
    ['geoestacionária (36 mil km) entre os voos 55 e 85', voosAte(36000) >= 55 && voosAte(36000) <= 85],
    ['Lua entre os voos 90 e 150', vooLua >= 90 && vooLua <= 150],
    ['velocidade máxima só depois do voo 55', vMax && vMax.voo > 55],
    ['nenhum voo acima de 65 minutos', Math.max(...historico.map((h) => h.min)) <= 65],
    ['no máximo 5% dos voos sem compra', semCompra / historico.length <= 0.05],
  ];
  let falhou = false;
  for (const [nome, ok] of metas) { console.log((ok ? 'ok    ' : 'FALHA ') + nome); if (!ok) falhou = true; }
  if (falhou) process.exitCode = 1;
}
