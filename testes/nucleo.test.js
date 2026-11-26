const test = require('node:test');
const assert = require('node:assert');
require('../js/dados.js');
require('../js/nucleo.js');
require('../js/financas.js');
const RL = globalThis.RL;

function melhorFoguete() {
  const jogo = RL.jogoNovo();
  for (const q of RL.PESQUISAS) jogo.pesquisa[q.id] = q.niveis;
  const build = {
    bico: 'bico9', capsula: 'capsula9', escudo: 'escudo9', enfeite: 'enfeite9', modulos: ['gerador9', 'antena9', 'ima9'],
    estagios: [0, 1, 2, 3].map(() => ({ tanques: ['tanque9', 'tanque9', 'tanque9', 'tanque9'], motor: 'motor9', aletas: 'aleta9', lateral: 'lateral9' })),
  };
  return { jogo, build };
}

test('são 360 peças, 24 por categoria, e toda pesquisa tem 20 níveis', () => {
  assert.strictEqual(Object.keys(RL.PECAS).length, 360);
  for (const t of Object.keys(RL.TIPOS)) assert.strictEqual(RL.PECAS_POR_TIPO[t].length, 24, t);
  assert.strictEqual(new Set(Object.values(RL.PECAS).map((p) => p.nome)).size, 360, 'nomes repetidos');
  assert.ok(Object.values(RL.PECAS).every((p) => Number.isFinite(p.preco) && p.preco >= 0 && Number.isFinite(p.massa) && p.requerKm >= 0));
  assert.ok(RL.PESQUISAS.every((q) => q.niveis === 20));
  const niveis = RL.PESQUISAS.reduce((t, q) => t + q.niveis, 0);
  assert.ok(niveis >= 400, `niveis=${niveis}`);
});

test('o primeiro foguete decola e faz poucos km', () => {
  const jogo = RL.jogoNovo();
  const s = RL.simular(RL.atributos(jogo.foguete, jogo));
  assert.ok(s.h > 0.5 && s.h < 6, `h=${s.h}`);
  assert.strictEqual(s.fim, 'combustivel');
});

test('o melhor foguete chega à Lua entre 32 e 60 minutos', () => {
  const { jogo, build } = melhorFoguete();
  jogo.pesquisa.dobra = 0;
  const s = RL.simular(RL.atributos(build, jogo));
  assert.strictEqual(s.fim, 'lua');
  const min = s.t / 60;
  assert.ok(min >= 32 && min <= 60, `min=${min}`);
});

test('voar sem combustível desacelera e encerra', () => {
  const jogo = RL.jogoNovo();
  const a = RL.atributos(jogo.foguete, jogo);
  const s = RL.novoVoo(a);
  for (let i = 0; i < 6000 && !s.fim; i++) RL.passo(s, a, 0.1, {});
  assert.strictEqual(s.fim, 'combustivel');
  assert.ok(s.comb[0] === 0);
});

test('foguete pesado demais não sai do chão', () => {
  const jogo = RL.jogoNovo();
  const build = RL.buildInicial();
  build.modulos = ['carga9'];
  const s = RL.simular(RL.atributos(build, jogo));
  assert.strictEqual(s.h, 0);
  assert.strictEqual(s.fim, 'semforca');
});

test('soltar estágio deixa o foguete mais leve e liga o próximo motor', () => {
  const jogo = RL.jogoNovo();
  const build = RL.buildInicial();
  build.estagios.push({ tanques: ['tanque0'], motor: 'motor0', aletas: null, lateral: null });
  const a = RL.atributos(build, jogo);
  const s = RL.novoVoo(a);
  const antes = RL.massaAtual(s, a);
  assert.ok(RL.soltarEstagio(s, a));
  assert.ok(RL.massaAtual(s, a) < antes);
  assert.ok(RL.ligado(s, a));
  assert.strictEqual(RL.soltarEstagio(s, a), false);
});

test('encaixar e ler funcionam em qualquer caminho', () => {
  const b = RL.buildInicial();
  RL.encaixar(b, 'e1.t2', 'tanque3');
  assert.strictEqual(RL.ler(b, 'e1.t2'), 'tanque3');
  RL.encaixar(b, 'mod1', 'ima2');
  assert.strictEqual(RL.ler(b, 'mod1'), 'ima2');
  RL.encaixar(b, 'escudo', 'escudo1');
  assert.strictEqual(RL.ler(b, 'escudo'), 'escudo1');
  RL.encaixar(b, 'e1.t2', null);
  assert.strictEqual(b.estagios.length, 1);
});

test('build sem motor aponta o problema', () => {
  const b = RL.buildInicial();
  RL.encaixar(b, 'e0.motor', null);
  assert.ok(RL.problemasDoBuild(b).some((x) => x.includes('motor')));
});

test('compras respeitam moedas e liberação', () => {
  const j = RL.jogoNovo();
  j.moedas = 1e9;
  assert.strictEqual(RL.comprarPeca(j, 'motor5'), false, 'não liberado');
  j.recorde = 1000;
  assert.ok(RL.comprarPeca(j, 'motor5'));
  assert.strictEqual(RL.comprarPeca(j, 'motor5'), false, 'já comprado');
  j.moedas = 0;
  assert.strictEqual(RL.comprarPesquisa(j, 'empuxo'), false);
  j.moedas = 1e9;
  assert.ok(RL.comprarPesquisa(j, 'empuxo'));
  assert.strictEqual(j.pesquisa.empuxo, 1);
});

test('fechamento paga marcos só na primeira vez', () => {
  const j = RL.jogoNovo();
  const a = RL.atributos(j.foguete, j);
  const s = RL.novoVoo(a);
  s.h = 150;
  s.fim = 'combustivel';
  const f1 = RL.fechamento(s, a, j);
  assert.ok(f1.premios > 0 && f1.recorde);
  RL.aplicarFechamento(j, f1, s);
  const f2 = RL.fechamento(s, a, j);
  assert.strictEqual(f2.premios, 0);
  assert.strictEqual(f2.recorde, false);
});

test('jogo salvo volta igual, inclusive com armazenamento ruim', () => {
  const mem = { d: {}, setItem(k, v) { this.d[k] = v; }, getItem(k) { return this.d[k] ?? null; }, removeItem(k) { delete this.d[k]; } };
  const j = RL.jogoNovo();
  j.moedas = 77;
  assert.ok(RL.salvar(j, mem));
  assert.strictEqual(RL.carregar(mem).moedas, 77);
  RL.apagar(mem);
  assert.strictEqual(RL.carregar(mem), null);
  mem.setItem('rumoalua.v1', '{quebrado');
  assert.strictEqual(RL.carregar(mem), null);
  const ruim = { setItem() { throw new Error('x'); }, getItem() { throw new Error('x'); } };
  assert.strictEqual(RL.salvar(j, ruim), false);
  assert.strictEqual(RL.carregar(ruim), null);
});

test('com a dobra o foguete passa da Lua e chega ao fim da viagem', () => {
  const { jogo, build } = melhorFoguete();
  const s = RL.simular(RL.atributos(build, jogo));
  assert.strictEqual(s.fim, 'plutao');
  assert.ok(s.h >= RL.KM_FIM);
  const min = s.t / 60;
  assert.ok(min >= 20 && min <= 70, `min=${min}`);
});

test('no jogo o fim do combustível marca o ápice em vez de encerrar', () => {
  const jogo = RL.jogoNovo();
  const a = RL.atributos(jogo.foguete, jogo);
  const s = RL.novoVoo(a);
  for (let i = 0; i < 6000 && !s.apice; i++) RL.passo(s, a, 0.1, { comQueda: true });
  assert.ok(s.apice);
  assert.strictEqual(s.fim, null);
});

test('o pagamento usa a altura máxima, não a da queda', () => {
  const jogo = RL.jogoNovo();
  const a = RL.atributos(jogo.foguete, jogo);
  const s = RL.novoVoo(a);
  s.h = 1; s.hMax = 500; s.fim = 'pousou';
  assert.strictEqual(RL.fechamento(s, a, jogo).km, 500);
});

test('turbo não gasta combustível', () => {
  const jogo = RL.jogoNovo();
  const a = RL.atributos(jogo.foguete, jogo);
  const c = RL.novoVoo(a), n = RL.novoVoo(a);
  for (let i = 0; i < 20; i++) { RL.passo(c, a, 0.1, { turbo: true }); RL.passo(n, a, 0.1, {}); }
  assert.strictEqual(c.comb[0], n.comb[0]);
  assert.ok(c.turbo < 1);
  assert.ok(c.v > n.v);
});

test('turbo funciona de tanque vazio', () => {
  const jogo = RL.jogoNovo();
  const a = RL.atributos(jogo.foguete, jogo);
  const c = RL.novoVoo(a), n = RL.novoVoo(a);
  for (const s of [c, n]) { s.decolou = true; s.h = 5; s.v = 0.5; s.comb[0] = 0; }
  for (let i = 0; i < 10; i++) { RL.passo(c, a, 0.1, { turbo: true }); RL.passo(n, a, 0.1, {}); }
  assert.strictEqual(c.comb[0], 0);
  assert.ok(c.turbo < 1, 'a barra de turbo é o único gasto');
  assert.ok(c.v > n.v, 'empurra sem combustível');
});

test('turbo depende dos motores auxiliares das laterais', () => {
  const jogo = RL.jogoNovo();
  const b = RL.buildInicial();
  b.estagios[0].lateral = null;
  const a = RL.atributos(b, jogo);
  const s = RL.novoVoo(a);
  for (let i = 0; i < 10; i++) RL.passo(s, a, 0.1, { turbo: true });
  assert.strictEqual(s.turbo, 1);
  assert.strictEqual(s.usouTurbo, false);
});

test('efeito de toda pesquisa funciona do nível 0 ao 20', () => {
  for (const q of RL.PESQUISAS) for (let n = 0; n <= 20; n++) assert.ok(String(q.efeito(n)).length > 0, q.id);
});

test('cada enfeite dá um bônus próprio', () => {
  const l = RL.PECAS_POR_TIPO.enfeite;
  assert.equal(new Set(l.map((p) => p.bonus)).size, l.length);
  const j = RL.jogoNovo();
  for (const p of l) {
    const b = RL.buildInicial();
    b.enfeite = p.id;
    const a = RL.atributos(b, j), a0 = RL.atributos(RL.buildInicial(), j);
    assert.notDeepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(a0)), p.id);
  }
});

test('escudo gasta carga e fica mais caro a cada compra', () => {
  const j = RL.jogoNovo();
  j.moedas = 1e6;
  const c0 = RL.custoBolha(j), q0 = j.bolhas.qtd;
  assert.ok(RL.comprarBolha(j));
  assert.ok(RL.custoBolha(j) > c0);
  assert.equal(j.bolhas.qtd, q0 + 1);
  assert.ok(RL.usarBolha(j));
  j.bolhas.qtd = 0;
  assert.ok(!RL.usarBolha(j));
});

test('pagamento fora chega ao teto e não pune quem some', () => {
  const j = RL.jogoNovo();
  j.voos = 5; j.melhorPago = 1000; j.visto = 1000;
  const h8 = RL.pagamentoFora(j, 1000 + 8 * 3600000).valor, h80 = RL.pagamentoFora(j, 1000 + 80 * 3600000).valor;
  assert.ok(h8 > 0);
  assert.equal(h8, h80);
});

test('autopiloto sempre pousa a salvo, em qualquer taxa de quadros', () => {
  for (const dt of [1 / 144, 1 / 60, 1 / 30, 0.05]) {
    const p = { alt: RL.POUSO.alt, v: RL.POUSO.v, reserva: 1 };
    for (let t = 0; t < 200 && !p.nota; t += dt) RL.passoPouso(p, RL.pousoDeveFrear(p), dt);
    assert.ok(p.nota === 'bom' || p.nota === 'perfeito', `dt=${dt} nota=${p.nota} v=${p.v}`);
  }
});

test('autopiloto só existe depois de terminar o jogo', () => {
  const j = RL.jogoNovo();
  j.pesquisa.autopiloto = 20;
  assert.strictEqual(RL.atributos(j.foguete, j).autopiloto, 0);
  j.chegouLua = true;
  assert.strictEqual(RL.atributos(j.foguete, j).autopiloto, 3);
});

test('o primeiro nível do autopiloto já pilota', () => {
  assert.strictEqual(RL.nivelAutopiloto(0), 0);
  assert.strictEqual(RL.nivelAutopiloto(1), 1);
  assert.strictEqual(RL.nivelAutopiloto(5), 2);
  assert.strictEqual(RL.nivelAutopiloto(10), 3);
});
