/* Gera godot/dados/dados.json a partir do JS, para os dois jogos usarem os mesmos números e textos.
   Também gera godot/testes/paridade.json: voos simulados na versão web, para conferir as regras no Godot. */
const fs = require('fs');
const path = require('path');
globalThis.window = globalThis;
globalThis.document = { createElement: () => ({ getContext: () => ({}) }) };
for (const f of ['dados', 'nucleo', 'financas']) require(`../js/${f}.js`);
const RL = globalThis.RL;
RL.Desenho = {};
RL.Sprite = () => null;
for (const f of ['personagens', 'objetos']) require(`../js/${f}.js`);
const FORA = require('path').join(__dirname, '../godot');
const semFuncao = (o) => JSON.parse(JSON.stringify(o));
const pesquisas = RL.PESQUISAS.map((q) => ({ ...semFuncao(q), efeitos: Array.from({ length: q.niveis + 1 }, (_, n) => q.efeito(n)) }));
const dados = {
  KM_LUA: RL.KM_LUA, KM_FIM: RL.KM_FIM, PECAS: RL.PECAS,
  PECAS_POR_TIPO: Object.fromEntries(Object.entries(RL.PECAS_POR_TIPO).map(([k, l]) => [k, l.map((p) => p.id)])),
  TIPOS: RL.TIPOS, RAMOS: RL.RAMOS, PESQUISAS: pesquisas, NIVEIS_TEMPO: RL.NIVEIS_TEMPO, MARCOS: RL.MARCOS, VELOCIDADES: RL.VELOCIDADES, FAIXAS: RL.FAIXAS, EVENTOS: RL.EVENTOS,
  MARCAS: RL.MARCAS, ROUPAS: RL.ROUPAS, ESQUEMAS: RL.ESQUEMAS, PALETA: RL.PALETA, PADROES: RL.PADROES, RASTROS: RL.RASTROS, ADESIVOS: RL.ADESIVOS,
  PRECO_PADRAO: Object.fromEntries(RL.PADROES.map((p) => [p, RL.precoPadrao(p)])),
  CONQUISTAS: RL.CONQUISTAS.map((c) => ({ id: c.id, nome: c.nome, desc: c.desc, premio: c.premio, libera: c.libera || null })),
  OBJ: RL.OBJ, PERIGOS_POR_FAIXA: RL.PERIGOS_POR_FAIXA, FALAS: RL.Personagens.FALAS, TATU: RL.Personagens.TATU,
};
fs.writeFileSync(path.join(FORA, 'dados/dados.json'), JSON.stringify(dados));

/* Paridade: vários foguetes e níveis de pesquisa. */
const casos = [];
const pesq = [{}, { empuxo: 4, combustivel: 6, peso: 3 }, { empuxo: 10, combustivel: 15, peso: 10, arrasto: 10, estagios: 10, empilhar: 14 }, { empuxo: 20, combustivel: 20, peso: 20, arrasto: 20, pagamento: 12, moeda: 7, estagios: 20, empilhar: 20 }];
const est = (t, m, l) => ({ tanques: t, motor: m, aletas: null, lateral: l });
const builds = [
  RL.buildInicial(),
  { bico: 'bico3', capsula: 'capsula2', escudo: 'escudo1', enfeite: 'enfeite5', modulos: ['antena2', 'ima1'], estagios: [est(['tanque2', 'tanque3'], 'motor3', 'lateral1')] },
  { bico: 'bico7', capsula: 'capsula5', escudo: 'escudo4', enfeite: 'enfeite23', modulos: ['carga4', 'gerador3'], estagios: [est(['tanque7', 'tanque6', 'tanque7'], 'motor7', 'lateral3'), est(['tanque6', 'tanque6'], 'motor6', 'lateral2')] },
  { bico: 'bico9', capsula: 'capsula9', escudo: 'escudo9', enfeite: 'enfeite19', modulos: ['gerador9', 'antena9', 'cofre6'], estagios: [est(['tanque9', 'tanque9', 'tanque9'], 'motor9', 'lateral9'), est(['tanque9', 'tanque8', 'tanque9'], 'motor9', 'lateral9'), est(['tanque9', 'tanque9'], 'motor8', 'lateral8')] },
];
for (const b of builds) for (const p of pesq) {
  const j = RL.jogoNovo();
  j.pesquisa = p;
  const a = RL.atributos(b, j);
  const s = RL.simular(a);
  casos.push({ build: b, pesquisa: p, km: s.h, t: s.t, vMax: s.vMax, fim: s.fim, casco: a.casco, controle: a.controle, pagamento: a.pagamento, moeda: a.moeda, arrasto: a.arrasto, raioIma: a.raioIma, massa: RL.massaAtual(RL.novoVoo(a), a), pagKm: RL.pagamentoDistancia(1234, a), moedaKm: RL.valorMoeda(1234, a), custo: Object.fromEntries(['empuxo', 'pagamento', 'estagios'].map((k) => { const jj = { ...j, pesquisa: p }; return [k, RL.custoPesquisa(jj, k)]; })) });
}
fs.writeFileSync(path.join(FORA, 'testes/paridade.json'), JSON.stringify(casos));
console.log('dados', fs.statSync(path.join(FORA, 'dados/dados.json')).size, 'casos', casos.length);
