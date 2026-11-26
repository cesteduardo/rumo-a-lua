const test = require('node:test');
const assert = require('node:assert');
require('../js/dados.js');
require('../js/nucleo.js');
require('../js/financas.js');
const RL = globalThis.RL;

function voo(h, extra) {
  const j = RL.jogoNovo();
  RL.completarContratos(j, () => 0.5);
  const a = RL.atributos(j.foguete, j);
  const s = RL.novoVoo(a);
  s.h = h;
  s.fim = 'combustivel';
  Object.assign(s, extra || {});
  return { j, a, s };
}

test('combo multiplica moedas e para em 5x', () => {
  const { a, s } = voo(10);
  const v1 = RL.pegarMoeda(s, a);
  assert.strictEqual(v1.mult, 1);
  s.combo = 8;
  assert.strictEqual(RL.pegarMoeda(s, a).mult, 2);
  s.combo = 500;
  assert.strictEqual(RL.pegarMoeda(s, a).mult, 5);
  assert.strictEqual(s.comboMax, 5);
});

test('voo sem bater paga bônus; com batida não', () => {
  const a = voo(100);
  const b = voo(100, { batidas: 1 });
  assert.ok(RL.fechamento(a.s, a.a, a.j).limpo > 0);
  assert.strictEqual(RL.fechamento(b.s, b.a, b.j).limpo, 0);
});

test('recorde paga bônus só sobre o que passou', () => {
  const { j, a, s } = voo(100);
  j.recorde = 50;
  const f = RL.fechamento(s, a, j);
  assert.ok(f.bonusRecorde > 0);
  j.recorde = 200;
  assert.strictEqual(RL.fechamento(s, a, j).bonusRecorde, 0);
});

test('vaquinha cresce quando o recorde não vem e zera ao bater', () => {
  const { j, a, s } = voo(10);
  j.recorde = 100;
  j.semRecorde = 0;
  assert.strictEqual(RL.fechamento(s, a, j).vaquinha, 0);
  j.semRecorde = 3;
  const f = RL.fechamento(s, a, j);
  assert.ok(f.vaquinha > 0);
  RL.aplicarFechamento(j, f, s);
  assert.strictEqual(j.semRecorde, 4);
  s.h = 500;
  RL.aplicarFechamento(j, RL.fechamento(s, a, j), s);
  assert.strictEqual(j.semRecorde, 0);
});

test('o total é a soma dos itens menos a parcela', () => {
  const { j, a, s } = voo(100, { moedas: 50 });
  j.banco.divida = 100;
  const f = RL.fechamento(s, a, j);
  const soma = f.itens.reduce((t, i) => t + i[1], 0);
  assert.strictEqual(f.total, soma - f.parcela);
  assert.ok(f.parcela > 0 && f.parcela <= 100);
});

test('contrato cumprido paga, sai da lista e vem outro', () => {
  const { j, a, s } = voo(5000);
  j.contratos = [{ tipo: 'distancia', x: 100, premio: 777, texto: 't', de: 'd' }];
  const f = RL.fechamento(s, a, j);
  assert.strictEqual(f.ganhoContratos, 777);
  RL.aplicarFechamento(j, f, s);
  assert.strictEqual(j.contratos.length, 3);
  assert.ok(j.contratos.every((c) => c.premio !== 777));
  assert.strictEqual(j.estat.contratos, 1);
});

test('todo modelo de contrato gera prêmio válido', () => {
  const j = RL.jogoNovo();
  j.recorde = 1000;
  for (let i = 0; i < 300; i++) {
    const c = RL.gerarContrato(j);
    assert.ok(c.premio >= 40 && Number.isFinite(c.premio) && c.texto, JSON.stringify(c));
  }
});

test('contratos oferecidos não repetem o tipo', () => {
  const j = RL.jogoNovo();
  RL.completarContratos(j);
  assert.strictEqual(new Set(j.contratos.map((c) => c.tipo)).size, 3);
});

test('trocar contrato custa moedas e exige saldo', () => {
  const j = RL.jogoNovo();
  RL.completarContratos(j);
  assert.strictEqual(RL.trocarContrato(j, 0), false);
  j.moedas = 1e6;
  const antes = j.moedas;
  assert.ok(RL.trocarContrato(j, 0));
  assert.ok(j.moedas < antes);
});

test('empréstimo tem limite, cobra juros e desconta do pagamento até zerar', () => {
  const j = RL.jogoNovo();
  j.melhorPago = 1000;
  assert.strictEqual(RL.pegarEmprestimo(j, 1e7), false);
  assert.ok(RL.pegarEmprestimo(j, 1000));
  assert.strictEqual(j.moedas, 1000);
  assert.strictEqual(j.banco.divida, 1200);
  j.moedas = 500;
  assert.ok(RL.pagarDivida(j, 200));
  assert.strictEqual(j.banco.divida, 1000);
  assert.strictEqual(j.moedas, 300);
  assert.ok(RL.disponivelEmprestimo(j) < 3000);
});

test('dívida paga por parcela nunca fica negativa', () => {
  const { j, a, s } = voo(1000);
  j.banco.divida = 5;
  const f = RL.fechamento(s, a, j);
  assert.strictEqual(f.parcela, 5);
  RL.aplicarFechamento(j, f, s);
  assert.strictEqual(j.banco.divida, 0);
  assert.ok(j.conquistas.includes('divida'));
});

test('poupança rende por voo com teto, e saque devolve', () => {
  const { j, a, s } = voo(10);
  j.moedas = 1000;
  assert.ok(RL.depositar(j, 1000));
  assert.strictEqual(j.moedas, 0);
  RL.aplicarFechamento(j, RL.fechamento(s, a, j), s);
  assert.strictEqual(j.banco.poupanca, 1030);
  j.banco.poupanca = 1e9;
  j.melhorPago = 100;
  const f = RL.fechamento(s, a, j);
  RL.aplicarFechamento(j, f, s);
  assert.ok(f.rendimento <= Math.max(50, f.bruto));
  assert.ok(RL.sacar(j, 500));
  assert.strictEqual(RL.sacar(j, -1), false);
});

test('caixa dá moedas ou item trancado, nunca item repetido', () => {
  const { j, a, s } = voo(1000);
  for (let i = 0; i < 80; i++) RL.abrirCaixa(s, a, j);
  const itens = s.caixas.filter((c) => c.tipo !== 'moedas').map((c) => c.tipo + c.id);
  assert.strictEqual(new Set(itens).size, itens.length);
  assert.ok(s.ganhoCaixas > 0);
  const f = RL.fechamento(s, a, j);
  RL.aplicarFechamento(j, f, s);
  assert.ok(j.libera.adesivos.length + j.libera.padroes.length + j.libera.rastros.length > 8);
});

test('conquista paga uma vez e libera a recompensa', () => {
  const { j, a, s } = voo(150);
  const f = RL.fechamento(s, a, j);
  assert.ok(f.conquistas.some((c) => c.id === 'km100'));
  RL.aplicarFechamento(j, f, s);
  assert.ok(j.libera.rastros.includes('estrelas'));
  const f2 = RL.fechamento(s, a, j);
  assert.ok(!f2.conquistas.some((c) => c.id === 'km100'));
});

test('todo cosmético é liberável por conquista ou caixa, e ids existem', () => {
  const validos = { padroes: RL.PADROES, adesivos: RL.ADESIVOS, rastros: RL.RASTROS.map((r) => r.id) };
  for (const c of RL.CONQUISTAS) if (c.libera) assert.ok(validos[c.libera[0]].includes(c.libera[1]), c.id);
});

test('jogo salvo antigo ganha os campos novos', () => {
  const mem = { d: {}, getItem(k) { return this.d[k] ?? null; } };
  mem.d['rumoalua.v1'] = JSON.stringify({ moedas: 9, recorde: 3 });
  const j = RL.carregar(mem);
  assert.strictEqual(j.moedas, 9);
  assert.strictEqual(j.banco.divida, 0);
  assert.ok(j.libera.padroes.includes('liso'));
});

test('contrato cumprido assina a marca; marca no casco paga mais e respeita o limite', () => {
  const { j, a, s } = voo(5000);
  const m = RL.MARCAS[0].id, n = RL.MARCAS[1].id;
  assert.strictEqual(RL.alternarMarca(j, m), false, 'não assinada');
  j.contratos = [{ tipo: 'distancia', x: 100, premio: 77, texto: 't', de: 'd', marca: m }];
  const f = RL.fechamento(s, a, j);
  RL.aplicarFechamento(j, f, s);
  assert.ok(j.assinadas.includes(m));
  assert.strictEqual(f.novasMarcas[0].id, m);
  const antes = RL.atributos(j.foguete, j).pagamento;
  assert.ok(RL.alternarMarca(j, m));
  assert.ok(RL.atributos(j.foguete, j).pagamento > antes);
  j.assinadas.push(n);
  assert.strictEqual(RL.alternarMarca(j, n), false, 'sem vaga');
  j.pesquisa.pagamento = 6;
  assert.ok(RL.alternarMarca(j, n));
  assert.ok(RL.alternarMarca(j, m), 'tirar sempre pode');
  assert.deepStrictEqual(j.pintura.marcas, [n]);
});

test('contratos do mural vêm de marcas diferentes', () => {
  const j = RL.jogoNovo();
  RL.completarContratos(j);
  assert.strictEqual(new Set(j.contratos.map((c) => c.marca)).size, 3);
});

test('adesivos novos existem e têm preço crescente', () => {
  assert.ok(RL.ADESIVOS.length >= 30);
  assert.ok(RL.precoAdesivo('f_bico0') > RL.precoAdesivo('f_tatu'));
});
