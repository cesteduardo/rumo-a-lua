/* Dinheiro e recompensas: bônus do voo, contratos, banco, caixas e conquistas. Sem DOM. */
(function (raiz) {
  const RL = raiz.RL;

  const JUROS_EMPRESTIMO = 0.2;
  const PARCELA = 0.3;
  const RENDIMENTO = 0.03;

  /* Base de pagamento sem multiplicadores do foguete. */
  const pagBase = (km) => 48 * Math.max(km, 1) ** 0.5;

  function redondo(x) {
    if (x < 10) return Math.max(1, Math.round(x));
    const p = 10 ** Math.floor(Math.log10(x));
    return Math.round(x / (p / 2)) * (p / 2);
  }

  /* ---------- Combo e por um triz ---------- */
  const multCombo = (n) => Math.min(5, 1 + Math.floor(n / 8));

  function pegarMoeda(s, a) {
    const m = multCombo(s.combo || 0);
    const v = RL.valorMoeda(s.h, a) * m * (s.surto ? 2 : 1);
    s.moedas += v;
    s.moedasN = (s.moedasN || 0) + 1;
    if (s.queda) s.moedasQueda = (s.moedasQueda || 0) + 1;
    s.combo = (s.combo || 0) + 1;
    s.comboMax = Math.max(s.comboMax || 1, multCombo(s.combo));
    return { valor: v, mult: m };
  }

  function quaseBateu(s, a) {
    const v = RL.valorMoeda(s.h, a) * 6;
    s.trizes = (s.trizes || 0) + 1;
    s.ganhoTriz = (s.ganhoTriz || 0) + v;
    return v;
  }

  /* ---------- Caixas surpresa ---------- */
  const COSMETICOS = { padroes: 'padrão', adesivos: 'adesivo', rastros: 'rastro' };

  function cosmeticosTrancados(jogo) {
    const lista = [];
    const todos = { padroes: RL.PADROES, adesivos: RL.ADESIVOS, rastros: RL.RASTROS.map((r) => r.id) };
    for (const tipo of Object.keys(todos)) {
      for (const id of todos[tipo]) if (!jogo.libera[tipo].includes(id)) lista.push({ tipo, id });
    }
    return lista;
  }

  function abrirCaixa(s, a, jogo, r) {
    r = r || Math.random;
    s.caixas = s.caixas || [];
    const ja = new Set(s.caixas.filter((c) => c.tipo !== 'moedas').map((c) => c.tipo + c.id));
    const trancados = cosmeticosTrancados(jogo).filter((c) => !ja.has(c.tipo + c.id));
    let item;
    if (trancados.length && r() < 0.35) {
      item = trancados[Math.floor(r() * trancados.length)];
    } else {
      item = { tipo: 'moedas', valor: Math.ceil(RL.valorMoeda(s.h, a) * (25 + r() * 35) * a.sorte) };
      s.ganhoCaixas = (s.ganhoCaixas || 0) + item.valor;
    }
    s.caixas.push(item);
    return item;
  }

  /* ---------- Contratos ---------- */
  const MODELOS = {
    distancia: {
      gerar: (rec, r) => { const x = redondo(Math.max(3, rec * (1.25 + r() * 0.6))); return { x, premio: pagBase(x) * 0.9, texto: `Chegue a ${x.toLocaleString('pt-BR')} km.` }; },
      ok: (c, s) => s.h >= c.x,
    },
    limpo: {
      gerar: (rec, r) => { const x = redondo(Math.max(1, rec * (0.45 + r() * 0.3))); return { x, premio: pagBase(x) * 1.1, texto: `Chegue a ${x.toLocaleString('pt-BR')} km sem bater em nada.` }; },
      ok: (c, s) => s.h >= c.x && !s.batidas,
    },
    moedas: {
      gerar: (rec, r, j) => { const x = 12 + Math.floor(r() * 18) + Math.min(40, j.voos); return { x, premio: pagBase(rec) * 0.6, texto: `Pegue ${x} moedas em um voo.` }; },
      ok: (c, s) => (s.moedasN || 0) >= c.x,
    },
    combo: {
      gerar: (rec, r) => { const x = 2 + Math.floor(r() * 4); return { x, premio: pagBase(rec) * (0.3 + x * 0.12), texto: `Faça um combo de ${x}x.` }; },
      ok: (c, s) => (s.comboMax || 1) >= c.x,
    },
    triz: {
      /* só existe perigo depois da Linha de Kármán */
      minimo: 100,
      gerar: (rec, r) => { const x = 2 + Math.floor(r() * 5); return { x, premio: pagBase(rec) * (0.3 + x * 0.1), texto: `Passe por um triz ${x} vezes em um voo.` }; },
      ok: (c, s) => (s.trizes || 0) >= c.x,
    },
    semTurbo: {
      gerar: (rec, r) => { const x = redondo(Math.max(1, rec * (0.5 + r() * 0.25))); return { x, premio: pagBase(x) * 0.9, texto: `Chegue a ${x.toLocaleString('pt-BR')} km sem usar o turbo.` }; },
      ok: (c, s) => s.h >= c.x && !s.usouTurbo,
    },
    absurdo: {
      minimo: 100,
      gerar: (rec) => ({ x: 1, premio: pagBase(rec) * 0.9, texto: 'Encoste em alguma coisa que não devia estar no espaço.' }),
      ok: (c, s) => (s.absurdos || 0) >= c.x,
    },
    entrega: {
      minimo: 4,
      gerar: (rec, r) => { const x = redondo(Math.max(2, rec * (0.4 + r() * 0.3))); return { x, premio: pagBase(x) * 1.3, texto: `Leve uma carga até ${x.toLocaleString('pt-BR')} km.` }; },
      ok: (c, s, a) => s.h >= c.x && a.temCarga,
    },
  };

  function gerarContrato(jogo, r, excluir) {
    r = r || Math.random;
    const rec = Math.max(jogo.recorde, 2);
    const tipos = Object.keys(MODELOS).filter((t) => rec >= (MODELOS[t].minimo || 0) && !(excluir || []).includes(t));
    const tipo = tipos[Math.floor(r() * tipos.length)];
    const dados = MODELOS[tipo].gerar(rec, r, jogo);
    const usadas = jogo.contratos.map((c) => c.marca);
    const livres = RL.MARCAS.filter((q) => !usadas.includes(q.id));
    const m = livres[Math.floor(r() * livres.length)];
    return { tipo, x: dados.x, texto: dados.texto, premio: Math.max(40, redondo(dados.premio * 0.55)), de: m.nome, marca: m.id };
  }

  function completarContratos(jogo, r) {
    while (jogo.contratos.length < 3) jogo.contratos.push(gerarContrato(jogo, r, jogo.contratos.map((c) => c.tipo)));
    return jogo.contratos;
  }

  const contratoCumprido = (c, s, a) => MODELOS[c.tipo].ok(c, s, a);

  const custoTrocar = (c) => Math.ceil(c.premio * 0.1);

  function trocarContrato(jogo, i, r) {
    const c = jogo.contratos[i];
    if (!c || jogo.moedas < custoTrocar(c)) return false;
    jogo.moedas -= custoTrocar(c);
    jogo.contratos[i] = gerarContrato(jogo, r, jogo.contratos.map((x) => x.tipo));
    return true;
  }

  /* ---------- Conquistas ---------- */
  const marco = (km) => (x) => x.km >= km;
  RL.CONQUISTAS = [
    { id: 'primeiro', nome: 'Saiu do chão', desc: 'Termine o primeiro voo.', premio: 40, libera: ['adesivos', 'caveira'], ok: (x) => x.km > 0 },
    { id: 'chao', nome: 'Pelo menos tentou', desc: 'Lance um foguete que não sai do chão.', premio: 50, libera: ['adesivos', 'banana'], ok: (x) => x.s.fim === 'semforca' },
    { id: 'km12', nome: 'Oi, aeromoça', desc: 'Chegue a 12 km.', premio: 150, libera: ['padroes', 'bolinhas'], ok: marco(12) },
    { id: 'km100', nome: 'Sem placa nenhuma', desc: 'Chegue à linha de Kármán.', premio: 1200, libera: ['rastros', 'estrelas'], ok: marco(100) },
    { id: 'km408', nome: 'Ninguém abriu a porta', desc: 'Chegue à Estação Espacial.', premio: 4000, libera: ['padroes', 'chamas'], ok: marco(408) },
    { id: 'km20k', nome: 'Recalculando a rota', desc: 'Chegue aos satélites de GPS.', premio: 30000, libera: ['adesivos', 'lua'], ok: marco(20200) },
    { id: 'km100k', nome: 'Muito longe de casa', desc: 'Chegue a 100.000 km.', premio: 90000, libera: ['rastros', 'confete'], ok: marco(100000) },
    { id: 'lua', nome: 'É menor do que parecia', desc: 'Chegue na Lua.', premio: 500000, libera: ['adesivos', 'capivara'], ok: marco(RL.KM_LUA) },
    { id: 'limpo', nome: 'Nem um arranhão', desc: 'Chegue a 200 km sem bater.', premio: 500, libera: ['padroes', 'faixa'], ok: (x) => x.km >= 200 && !x.s.batidas },
    { id: 'limpo2', nome: 'Motorista de vó', desc: 'Chegue a 5.000 km sem bater.', premio: 15000, libera: ['padroes', 'xadrez'], ok: (x) => x.km >= 5000 && !x.s.batidas },
    { id: 'batidas', nome: 'Imã de problema', desc: 'Bata 8 vezes em um voo.', premio: 200, libera: ['padroes', 'remendos'], ok: (x) => (x.s.batidas || 0) >= 8 },
    { id: 'casco', nome: 'O casco desistiu', desc: 'Destrua o foguete.', premio: 80, libera: ['adesivos', 'alvo'], ok: (x) => x.s.fim === 'casco' },
    { id: 'combo5', nome: 'Mão boa', desc: 'Faça um combo de 5x.', premio: 400, libera: ['rastros', 'arcoiris'], ok: (x) => (x.s.comboMax || 1) >= 5 },
    { id: 'moedas100', nome: 'Bolso furado não', desc: 'Pegue 100 moedas em um voo.', premio: 700, libera: ['rastros', 'bolhas'], ok: (x) => (x.s.moedasN || 0) >= 100 },
    { id: 'triz5', nome: 'Foi por pouco', desc: 'Passe por um triz 5 vezes em um voo.', premio: 500, libera: ['padroes', 'dentes'], ok: (x) => (x.s.trizes || 0) >= 5 },
    { id: 'absurdo', nome: 'Ninguém explica', desc: 'Encoste em algo absurdo.', premio: 2500, libera: ['adesivos', 'olho'], ok: (x) => (x.s.absurdos || 0) >= 1 },
    { id: 'caixa', nome: 'O que será que tem?', desc: 'Pegue uma caixa surpresa.', premio: 120, libera: ['adesivos', 'chama'], ok: (x) => (x.s.caixas || []).length >= 1 },
    { id: 'caixas25', nome: 'Acumuladora', desc: 'Pegue 25 caixas no total.', premio: 8000, libera: ['adesivos', 'numero7'], ok: (x) => x.j.estat.caixas + (x.s.caixas || []).length >= 25 },
    { id: 'contratos10', nome: 'Pessoa de negócios', desc: 'Cumpra 10 contratos.', premio: 3000, ok: (x) => x.j.estat.contratos + x.contratos.length >= 10 },
    { id: 'contratos50', nome: 'Empresa de uma capivara', desc: 'Cumpra 50 contratos.', premio: 60000, ok: (x) => x.j.estat.contratos + x.contratos.length >= 50 },
    { id: 'divida', nome: 'Nome limpo', desc: 'Pague um empréstimo até o fim.', premio: 600, ok: (x) => x.j.banco.divida > 0 && x.parcela >= x.j.banco.divida },
    { id: 'ricao', nome: 'Tem dinheiro, sim', desc: 'Ganhe 1.000.000 de moedas no total.', premio: 50000, ok: (x) => x.j.estat.ganho + x.total >= 1e6 },
    { id: 'voos50', nome: 'Isso virou emprego', desc: 'Faça 50 voos.', premio: 5000, ok: (x) => x.j.voos + 1 >= 50 },
    { id: 'marte', nome: 'Ninguém em casa', desc: 'Chegue a Marte.', premio: 3000000, ok: marco(54600000) },
    { id: 'plutao', nome: 'Nem é mais planeta', desc: 'Chegue a Plutão, o fim da viagem.', premio: 900000000, ok: marco(5000000000) },
    { id: 'queda100', nome: 'Pegou tudo na descida', desc: 'Pegue 60 moedas durante uma queda.', premio: 2000, ok: (x) => (x.s.moedasQueda || 0) >= 60 },
    { id: 'jupiter', nome: 'É bem maior mesmo', desc: 'Chegue a Júpiter.', premio: 30000000, ok: marco(588000000) },
    { id: 'saturno', nome: 'Devia ter posto um anel', desc: 'Chegue a Saturno.', premio: 90000000, ok: marco(1200000000) },
    { id: 'netuno', nome: 'O chefe parou de ligar', desc: 'Chegue a Netuno.', premio: 400000000, ok: marco(4300000000) },
    { id: 'km1000', nome: 'Já não dá para voltar a pé', desc: 'Chegue a 1.000 km.', premio: 5000, ok: marco(1000) },
    { id: 'km10m', nome: 'Faltou gasolina, sobrou espaço', desc: 'Chegue a 10 milhões de km.', premio: 1500000, ok: marco(10000000) },
    { id: 'moedas250', nome: 'Pesou o bolso', desc: 'Pegue 250 moedas em um voo.', premio: 6000, ok: (x) => (x.s.moedasN || 0) >= 250 },
    { id: 'moedas1000', nome: 'Isso não é mais um emprego', desc: 'Pegue 1.000 moedas em um voo.', premio: 60000, ok: (x) => (x.s.moedasN || 0) >= 1000 },
    { id: 'total5000', nome: 'Colecionador de troco', desc: 'Pegue 5.000 moedas no total.', premio: 25000, ok: (x) => x.j.estat.moedas + (x.s.moedasN || 0) >= 5000 },
    { id: 'triz20', nome: 'Raspou a tinta', desc: 'Passe por um triz 20 vezes em um voo.', premio: 12000, ok: (x) => (x.s.trizes || 0) >= 20 },
    { id: 'batidas100', nome: 'Seguro não cobre mais', desc: 'Bata 100 vezes no total.', premio: 8000, ok: (x) => x.j.estat.batidas + (x.s.batidas || 0) >= 100 },
    { id: 'semturbo', nome: 'No braço', desc: 'Chegue a 1.000 km sem usar o turbo.', premio: 9000, ok: (x) => x.km >= 1000 && !x.s.usouTurbo },
    { id: 'soturbo', nome: 'Pé no fundo', desc: 'Use o turbo e chegue a 100 km.', premio: 900, ok: (x) => x.km >= 100 && x.s.usouTurbo },
    { id: 'contratos5', nome: 'Assinei sem ler', desc: 'Cumpra 5 contratos.', premio: 700, ok: (x) => x.j.estat.contratos + x.contratos.length >= 5 },
    { id: 'contratos150', nome: 'Multinacional', desc: 'Cumpra 150 contratos.', premio: 900000, ok: (x) => x.j.estat.contratos + x.contratos.length >= 150 },
    { id: 'marcas3', nome: 'Vendido', desc: 'Assine com 3 marcas.', premio: 1500, ok: (x) => x.j.assinadas.length >= 3 },
    { id: 'marcasTodas', nome: 'Outdoor ambulante', desc: 'Assine com todas as marcas.', premio: 400000, ok: (x) => x.j.assinadas.length >= RL.MARCAS.length },
    { id: 'roupas5', nome: 'Capivara de estilo', desc: 'Tenha 10 itens no guarda-roupa.', premio: 3000, ok: (x) => x.j.roupas.length >= 10 },
    { id: 'pecas50', nome: 'Ferro-velho particular', desc: 'Tenha 50 peças na oficina.', premio: 20000, ok: (x) => x.j.pecas.length >= 50 },
    { id: 'pecas150', nome: 'Falta só o manual', desc: 'Tenha 300 peças na oficina.', premio: 5000000, ok: (x) => x.j.pecas.length >= 300 },
    { id: 'voos10', nome: 'Pegando o jeito', desc: 'Faça 10 voos.', premio: 400, ok: (x) => x.j.voos + 1 >= 10 },
    { id: 'voos200', nome: 'Aposentadoria especial', desc: 'Faça 200 voos.', premio: 700000, ok: (x) => x.j.voos + 1 >= 200 },
    { id: 'ganho100m', nome: 'Rica sem saber', desc: 'Ganhe 100.000.000 de moedas no total.', premio: 5000000, ok: (x) => x.j.estat.ganho + x.total >= 1e8 },
    { id: 'poupanca', nome: 'Pensando no futuro', desc: 'Guarde 100.000 moedas na poupança.', premio: 10000, ok: (x) => x.j.banco.poupanca >= 100000 },
    { id: 'rapido', nome: 'Nem deu tempo de pensar', desc: 'Chegue na Lua em menos de 45 minutos.', premio: 250000, ok: (x) => x.km >= RL.KM_LUA && x.s.t < 2700 },
    { id: 'maxq', nome: 'Nariz reto', desc: 'Passe da pressão máxima sem perder casco.', premio: 900, ok: (x) => x.km >= 24 && !x.s.apertou && !x.s.batidas },
    { id: 'tempestade', nome: 'Raio não cai duas vezes', desc: 'Atravesse a tempestade sem levar raio.', premio: 500, ok: (x) => x.km >= 10 && !x.s.raios },
    { id: 'muralha', nome: 'Achei a brecha', desc: 'Atravesse a muralha de satélites sem bater.', premio: 40000, ok: (x) => x.km >= 37000 && !x.s.batidas },
    { id: 'pouso', nome: 'Pé na Lua', desc: 'Faça um pouso perfeito na Lua.', premio: 300000, ok: (x) => x.s.pousoNota === 'perfeito' },
    { id: 'pousoDuro', nome: 'Pousar é modo de dizer', desc: 'Chegue na Lua de um jeito que ninguém chamaria de pouso.', premio: 20000, ok: (x) => x.s.pousoNota === 'duro' },
    /* Segredos: o nome e o caminho só aparecem depois de achar. */
    { id: 's_resposta', segredo: true, nome: 'A resposta', desc: 'Passou pelo km 42.', premio: 420, ok: (x) => x.km >= 42 },
    { id: 's_bota', segredo: true, nome: 'Alguém esqueceu', desc: 'Passou pelo km 1.969.', premio: 1969, ok: (x) => x.km >= 1969 },
    { id: 's_pobreza', segredo: true, nome: 'Voto de pobreza', desc: 'Chegou ao espaço sem pegar moeda nenhuma.', premio: 3000, ok: (x) => x.km >= 100 && !x.s.moedasN },
    { id: 's_filho', segredo: true, nome: 'A família reunida', desc: 'Encostou no pato gigante levando o patinho de borracha.', premio: 15000, ok: (x) => (x.j.segredos || []).includes('filho') },
    { id: 's_avisou', segredo: true, nome: 'Ele avisou', desc: 'Encontrou o tatu no vácuo.', premio: 25000, ok: (x) => (x.j.segredos || []).includes('avisou') },
    { id: 's_nome', segredo: true, nome: 'Batismo suspeito', desc: 'Deu ao foguete um nome que o tatu reconhece.', premio: 300, ok: (x) => (x.j.segredos || []).includes('nome') },
    { id: 's_cutucou', segredo: true, nome: 'Para de cutucar', desc: 'Cutucou o tatu até ele reclamar.', premio: 200, ok: (x) => (x.j.segredos || []).includes('cutucou') },
    { id: 's_lua', segredo: true, nome: 'Ela te viu', desc: 'Cutucou a Lua na tela de abertura.', premio: 200, ok: (x) => (x.j.segredos || []).includes('lua') },
    { id: 's_codigo', segredo: true, nome: 'Código antigo', desc: 'Digitou o código de sempre: cima, cima, baixo, baixo...', premio: 500, ok: (x) => (x.j.segredos || []).includes('codigo') },
    { id: 's_janela', segredo: true, nome: 'Nada mudou', desc: 'Ficou um minuto olhando a pausa.', premio: 60, ok: (x) => (x.j.segredos || []).includes('janela') },
  ];

  /* ---------- Fechamento do voo ---------- */
  const baseFechamento = RL.fechamento;

  function fechamento(s, a, jogo) {
    const f = baseFechamento(s, a, jogo);
    const km = f.km;
    const eraRecorde = f.recorde;
    f.limpo = !s.batidas && km >= 1 ? Math.floor(f.distancia * 0.25) : 0;
    f.triz = Math.floor(s.ganhoTriz || 0);
    f.caixas = Math.floor(s.ganhoCaixas || 0);
    f.bonusRecorde = eraRecorde && jogo.recorde > 0 ? Math.floor((RL.pagamentoDistancia(km, a) - RL.pagamentoDistancia(jogo.recorde, a)) * 0.35) : 0;
    f.vaquinha = !eraRecorde && jogo.semRecorde >= 2 ? Math.floor(f.distancia * Math.min(1, 0.25 * (jogo.semRecorde - 1))) : 0;
    f.contratos = jogo.contratos.filter((c) => contratoCumprido(c, s, a));
    f.ganhoContratos = f.contratos.reduce((t, c) => t + c.premio, 0);

    f.itens = [
      ['Distância', f.distancia], ['Moedas', f.moedas], ['Eventos', f.eventos], ['Caixas', f.caixas],
      ['Por um triz', f.triz], ['Voo sem bater', f.limpo], ['Bônus de recorde', f.bonusRecorde], ['Vaquinha dos vizinhos', f.vaquinha],
      ['Seguro', f.seguro], ['Marcos novos', f.premios], ['Contratos', f.ganhoContratos],
    ];
    const bruto = f.itens.reduce((t, i) => t + i[1], 0);
    f.parcela = jogo.banco.divida > 0 ? Math.min(jogo.banco.divida, Math.floor(bruto * PARCELA)) : 0;
    f.total = bruto - f.parcela;

    const ctx = { s, km, j: jogo, total: bruto, parcela: f.parcela, contratos: f.contratos };
    f.conquistas = RL.CONQUISTAS.filter((c) => !jogo.conquistas.includes(c.id) && c.ok(ctx));
    f.ganhoConquistas = f.conquistas.reduce((t, c) => t + c.premio, 0);
    if (f.ganhoConquistas) f.itens.push(['Conquistas', f.ganhoConquistas]);
    f.total += f.ganhoConquistas;
    f.bruto = bruto + f.ganhoConquistas;
    f.caixasItens = s.caixas || [];
    return f;
  }

  const baseAplicar = RL.aplicarFechamento;

  function liberar(jogo, tipo, id) {
    if (!jogo.libera[tipo].includes(id)) jogo.libera[tipo].push(id);
  }

  function aplicarFechamento(jogo, f, s, r) {
    const novoRecorde = f.km > jogo.recorde;
    jogo.semRecorde = novoRecorde ? 0 : (jogo.semRecorde || 0) + 1;

    jogo.banco.divida = Math.max(0, jogo.banco.divida - f.parcela);
    f.rendimento = Math.floor(Math.min(jogo.banco.poupanca * RENDIMENTO, Math.max(50, jogo.melhorPago * 0.5)));
    jogo.banco.poupanca += f.rendimento;
    jogo.melhorPago = Math.max(jogo.melhorPago, f.bruto);

    for (const c of f.conquistas) {
      jogo.conquistas.push(c.id);
      if (c.libera) liberar(jogo, c.libera[0], c.libera[1]);
    }
    for (const c of f.caixasItens) if (c.tipo !== 'moedas') liberar(jogo, c.tipo, c.id);

    jogo.estat.ganho += f.bruto;
    jogo.estat.moedas += s.moedasN || 0;
    jogo.estat.batidas += s.batidas || 0;
    jogo.estat.caixas += f.caixasItens.length;
    jogo.estat.contratos += f.contratos.length;

    const hoje = placarHoje(jogo, Date.now());
    hoje.voos++;
    hoje.ganho += f.bruto;
    hoje.marcos += f.novos.length;
    hoje.segundos += s.t || 0;

    baseAplicar(jogo, f, s);

    f.novasMarcas = [];
    for (const c of f.contratos) {
      if (c.marca && !jogo.assinadas.includes(c.marca)) {
        jogo.assinadas.push(c.marca);
        f.novasMarcas.push(RL.MARCA[c.marca]);
      }
    }
    jogo.contratos = jogo.contratos.filter((c) => !f.contratos.includes(c));
    completarContratos(jogo, r);

    jogo.extrato.unshift({ voo: jogo.voos, km: f.km, total: f.total, parcela: f.parcela, rendimento: f.rendimento });
    jogo.extrato.length = Math.min(jogo.extrato.length, 12);
    return jogo;
  }

  /* ---------- Patrocínio no casco ---------- */
  const limiteMarcas = (jogo) => 1 + Math.floor(RL.nivelPesquisa(jogo, 'pagamento') / 6);

  function alternarMarca(jogo, id) {
    const l = jogo.pintura.marcas;
    const i = l.indexOf(id);
    if (i >= 0) {
      l.splice(i, 1);
      return true;
    }
    if (!jogo.assinadas.includes(id) || l.length >= limiteMarcas(jogo)) return false;
    l.push(id);
    return true;
  }

  /* ---------- Volta ao jogo ---------- */
  /* Enquanto você esteve fora, as marcas no casco e a poupança pagaram. Nunca pune quem some:
     chega ao teto em 8 horas, sem sequência de dias e sem nada que se perca por não voltar. */
  const HORAS_TETO_FORA = 8;
  function pagamentoFora(jogo, agora) {
    if (!jogo.visto || !jogo.voos) return { horas: 0, valor: 0 };
    const horas = Math.min(HORAS_TETO_FORA, Math.max(0, (agora - jogo.visto) / 3600000));
    if (horas < 0.25) return { horas, valor: 0 };
    const cotas = 1 + 0.25 * (jogo.pintura.marcas || []).length;
    return { horas, valor: Math.floor(jogo.melhorPago * 0.12 * horas * cotas) };
  }

  function receberFora(jogo, agora) {
    const f = pagamentoFora(jogo, agora);
    jogo.visto = agora;
    if (f.valor > 0) {
      jogo.moedas += f.valor;
      jogo.estat.ganho += f.valor;
    }
    return f;
  }

  /* Placar de hoje: quanto andou nesta sentada. Dá sentido a parar também. */
  function diaDe(agora) {
    const d = new Date(agora);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function placarHoje(jogo, agora) {
    const dia = diaDe(agora);
    if (!jogo.hoje || jogo.hoje.dia !== dia) jogo.hoje = { dia, voos: 0, ganho: 0, kmInicio: jogo.recorde, marcos: 0, segundos: 0 };
    return jogo.hoje;
  }

  /* ---------- Banco ---------- */
  const limiteEmprestimo = (jogo) => Math.max(300, Math.floor(jogo.melhorPago * 3));
  const disponivelEmprestimo = (jogo) => Math.max(0, Math.floor((limiteEmprestimo(jogo) - jogo.banco.divida) / (1 + JUROS_EMPRESTIMO)));

  function pegarEmprestimo(jogo, valor) {
    valor = Math.floor(valor);
    if (valor <= 0 || valor > disponivelEmprestimo(jogo)) return false;
    jogo.moedas += valor;
    jogo.banco.divida += Math.ceil(valor * (1 + JUROS_EMPRESTIMO));
    return true;
  }

  function pagarDivida(jogo, valor) {
    valor = Math.min(Math.floor(valor), jogo.banco.divida, jogo.moedas);
    if (valor <= 0) return false;
    jogo.moedas -= valor;
    jogo.banco.divida -= valor;
    return true;
  }

  function depositar(jogo, valor) {
    valor = Math.min(Math.floor(valor), jogo.moedas);
    if (valor <= 0) return false;
    jogo.moedas -= valor;
    jogo.banco.poupanca += valor;
    return true;
  }

  function sacar(jogo, valor) {
    valor = Math.min(Math.floor(valor), jogo.banco.poupanca);
    if (valor <= 0) return false;
    jogo.banco.poupanca -= valor;
    jogo.moedas += valor;
    return true;
  }

  Object.assign(RL, {
    pagamentoFora, receberFora, placarHoje, multCombo, pegarMoeda, quaseBateu, abrirCaixa, gerarContrato, completarContratos, contratoCumprido, custoTrocar, trocarContrato,
    limiteMarcas, alternarMarca, fechamento, aplicarFechamento, limiteEmprestimo, disponivelEmprestimo, pegarEmprestimo, pagarDivida, depositar, sacar, cosmeticosTrancados,
    COSMETICOS, JUROS_EMPRESTIMO, PARCELA, RENDIMENTO,
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
