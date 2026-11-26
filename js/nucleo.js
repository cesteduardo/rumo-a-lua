/* Regras puras do jogo: sem DOM, testáveis no Node. */
(function (raiz) {
  const RL = raiz.RL;
  const VERSAO = 1;
  /* o modo de teste (abrir teste-lua.html) tem jogo salvo próprio e nunca toca no de verdade */
  const MODO_DEV = typeof location !== 'undefined' && location.hash === '#dev';
  const CHAVE = MODO_DEV ? 'rumoalua.dev' : 'rumoalua.v1';

  /* 384.400 km a 150 km/s dá 43 minutos, mais os minutos da atmosfera. */
  const V_MAX = 150;
  const V_MAX_TURBO = 170;
  const K_ESPACO = 0.025;
  const K_DESLIGADO = 0.05;
  const K_AR = 0.05;
  /* Nenhum voo queima por mais de 60 minutos: a partir daí, quem cresce é a velocidade. */
  const TETO_QUEIMA = 3600;
  const G0 = 0.00981;
  const G_MIN = 0.003;
  const RAIO_TERRA = 6371;

  /* ---------- Jogo novo e limites ---------- */

  function jogoNovo() {
    return {
      versao: VERSAO, moedas: 0, recorde: 0, voos: 0, tempoJogado: 0, chegouLua: false,
      pecas: ['bico0', 'capsula0', 'tanque0', 'motor0', 'lateral0'],
      pesquisa: {}, marcos: [],
      foguete: buildInicial(), pintura: { pecas: {}, rastro: 'fogo', corRastro: '#E08A3C', adesivos: [], nome: '', marcas: [], marcaPos: {} }, assinadas: [],
      piloto: { chapeu: 'nenhum', oculos: 'nenhum', pescoco: 'nenhum', pelo: 'castanho', traje: 'creme' }, roupas: ['chapeu:nenhum', 'oculos:nenhum', 'pescoco:nenhum', 'pelo:castanho', 'traje:creme'],
      hangar: [null, null, null, null, null, null],
      opcoes: { volume: 0.6, musica: 0.5, som: true, controle: 'auto', movimentoReduzido: false, teclas: teclasPadrao() },
      dicas: {}, vooAtivo: null, abertura: false, visto: 0, hoje: null, vistos: {}, chefe: 0, bolhas: { qtd: 1, compradas: 0 },
      capitulo: 0, segredos: [], banco: { poupanca: 0, divida: 0 }, contratos: [], conquistas: [], extrato: [], semRecorde: 0, melhorPago: 0,
      libera: { padroes: ['liso', 'listras', 'diagonal'], adesivos: ['nenhum', 'estrela', 'raio', 'coracao'], rastros: ['fogo', 'fumaca'] },
      estat: { ganho: 0, moedas: 0, batidas: 0, caixas: 0, contratos: 0 },
    };
  }

  function teclasPadrao() {
    return { esquerda: 'ArrowLeft', direita: 'ArrowRight', turbo: 'ArrowUp', soltar: 'KeyS', autopiloto: 'KeyQ', tempo: 'KeyE', escudo: 'KeyF', pausa: 'Escape' };
  }

  function buildInicial() {
    return {
      bico: 'bico0', capsula: 'capsula0', escudo: null, enfeite: null, modulos: [],
      estagios: [{ tanques: ['tanque0'], motor: 'motor0', aletas: null, lateral: 'lateral0' }],
    };
  }

  const nivelPesquisa = (jogo, id) => (jogo.pesquisa && jogo.pesquisa[id]) || 0;

  function limites(jogo) {
    return {
      estagios: 1 + Math.floor(nivelPesquisa(jogo, 'estagios') / 5),
      /* três tanques por estágio bastam: mais que isso o foguete vira agulha na tela */
      tanques: Math.min(3, 1 + Math.floor(nivelPesquisa(jogo, 'empilhar') / 5)),
      /* no fim cabem 7 módulos: um de cada tipo, dá para ter de tudo */
      modulos: 1 + Math.floor(nivelPesquisa(jogo, 'modulos') / 3),
    };
  }

  /* ---------- Encaixes: caminho de texto <-> peça ---------- */

  const TIPOS_MODULO = ['gerador', 'antena', 'ima', 'carga', 'cofre', 'radar', 'paraquedas'];

  function aceita(caminho) {
    if (caminho === 'bico' || caminho === 'capsula' || caminho === 'escudo' || caminho === 'enfeite') return [caminho];
    if (caminho.startsWith('mod')) return TIPOS_MODULO;
    const m = caminho.match(/^e\d+\.(t\d+|motor|aletas|lateral)$/);
    if (!m) return [];
    if (m[1] === 'motor') return ['motor'];
    if (m[1] === 'aletas') return ['aleta'];
    if (m[1] === 'lateral') return ['lateral'];
    return ['tanque'];
  }

  function ler(build, caminho) {
    if (caminho.startsWith('mod')) return build.modulos[+caminho.slice(3)] || null;
    if (!caminho.startsWith('e') || caminho === 'escudo' || caminho === 'enfeite') return build[caminho] || null;
    const [e, c] = caminho.split('.');
    const est = build.estagios[+e.slice(1)];
    if (!est) return null;
    return c[0] === 't' ? est.tanques[+c.slice(1)] || null : est[c] || null;
  }

  function vazioEstagio() {
    return { tanques: [], motor: null, aletas: null, lateral: null };
  }

  function encaixar(build, caminho, id) {
    if (caminho.startsWith('mod')) {
      build.modulos[+caminho.slice(3)] = id;
    } else if (!caminho.startsWith('e') || caminho === 'escudo' || caminho === 'enfeite') {
      build[caminho] = id;
    } else {
      const [e, c] = caminho.split('.');
      const i = +e.slice(1);
      while (build.estagios.length <= i) build.estagios.push(vazioEstagio());
      const est = build.estagios[i];
      if (c[0] === 't') est.tanques[+c.slice(1)] = id;
      else est[c] = id;
    }
    return limpar(build);
  }

  function limpar(build) {
    build.modulos = build.modulos.map((x) => x || null);
    for (const e of build.estagios) e.tanques = Array.from(e.tanques, (x) => x || null);
    while (build.estagios.length > 1) {
      const u = build.estagios[build.estagios.length - 1];
      if (u.motor || u.aletas || u.lateral || u.tanques.some(Boolean)) break;
      build.estagios.pop();
    }
    return build;
  }

  function problemasDoBuild(build) {
    const p = [];
    if (!build.capsula) p.push('Falta a cápsula: a capivara precisa sentar em algum lugar.');
    if (!build.bico) p.push('Falta o bico.');
    build.estagios.forEach((e, i) => {
      const nome = build.estagios.length > 1 ? ` no estágio ${i + 1}` : '';
      if (!e.motor) p.push(`Falta o motor${nome}.`);
      if (!e.tanques.some(Boolean)) p.push(`Falta um tanque${nome}.`);
    });
    return p;
  }

  /* ---------- Atributos do foguete montado ---------- */

  function atributos(build, jogo) {
    const n = (id) => nivelPesquisa(jogo, id);
    const pes = (id) => {
      const q = RL.PESQUISA[id];
      const niv = n(id);
      return (q.por || 0) * (q.salta && !q.multiplica ? niv + 2.5 * RL.saltosPesquisa(niv) : niv);
    };
    const salto = (id) => 1.5 ** RL.saltosPesquisa(n(id));
    const mPeso = 1 - pes('peso');
    const P = (id) => (id ? RL.PECAS[id] : null);
    const a = {
      massaTopo: 0, casco: 0, controle: 0, arrasto: 1, raioIma: 0, sorteP: 0, queda: 0, pagamento: 0, moeda: 0, regen: 0,
      recarga: 0.015, reducao: 0, estagios: [],
    };

    for (const id of [build.bico, build.capsula, build.escudo, build.enfeite, ...build.modulos]) {
      const p = P(id);
      if (!p) continue;
      a.massaTopo += p.massa * mPeso;
      a.casco += p.casco || 0;
      a.controle += p.controle || 0;
      if (p.tipo === 'bico') a.arrasto = p.arrasto;
      if (p.reducao) a.reducao = Math.max(a.reducao, p.reducao);
      a.raioIma = Math.max(a.raioIma, p.raio || 0);
      a.pagamento += p.pagamento || 0;
      a.moeda += p.moeda || 0;
      a.sorteP += p.sorte || 0;
      a.queda += p.queda || 0;
      a.regen += p.regen || 0;
      a.recarga += p.recarga || 0;
      a.empuxoPct = (a.empuxoPct || 0) + (p.empuxoPct || 0);
      a.combPct = (a.combPct || 0) + (p.combPct || 0);
      a.arrastoPct = (a.arrastoPct || 0) + (p.arrastoPct || 0);
    }

    const arrastoExtra = [];
    for (const e of build.estagios) {
      const est = { seca: 0, combustivel: 0, empuxo: 0, queima: 0, lateral: null };
      for (const id of e.tanques) {
        const p = P(id);
        if (!p) continue;
        est.seca += p.massa * mPeso;
        est.combustivel += p.combustivel * (1 + pes('combustivel') + (a.combPct || 0));
        a.casco += p.casco;
      }
      const m = P(e.motor);
      if (m) {
        est.seca += m.massa * mPeso;
        est.empuxo = m.empuxo * (1 + pes('empuxo') + (a.empuxoPct || 0));
        est.queima = m.queima;
      }
      const al = P(e.aletas);
      if (al) {
        est.seca += al.massa * mPeso;
        a.controle += al.controle;
        arrastoExtra.push(al.arrastoExtra);
      }
      const la = P(e.lateral);
      if (la) {
        est.lateral = { massa: la.massa * mPeso, empuxo: la.empuxo * (1 + pes('turbo')) };
      }
      a.estagios.push(est);
    }

    a.arrasto = (a.arrasto + arrastoExtra.reduce((s, x) => s + x, 0)) * (1 - pes('arrasto')) * (1 - (a.arrastoPct || 0));
    a.casco = Math.max(1, a.casco * (1 + pes('casco')));
    a.controle = Math.max(0.6, a.controle) * (1 + pes('controle'));
    a.raioIma *= 1 + pes('ima');
    a.regen += pes('reparo');
    a.recarga *= 1 + pes('recargaTurbo');
    const cotas = ((jogo.pintura && jogo.pintura.marcas) || []).length * 0.04;
    a.pagamento = (1 + a.pagamento + cotas) * (1 + pes('pagamento')) * salto('pagamento');
    a.moeda = (1 + a.moeda) * (1 + pes('moeda')) * salto('moeda');
    a.sorte = 1 + pes('sorte') + a.sorteP;
    a.seguro = pes('seguro');
    a.galoes = 1 + pes('galoes');
    a.temCarga = build.modulos.some((id) => id && RL.PECAS[id].tipo === 'carga');
    a.dobra = 2.6 ** (n('dobra') / 2);
    a.kmFim = n('dobra') > 0 ? RL.KM_FIM : RL.KM_LUA;
    /* decisão de Eduardo: o autopiloto só existe para quem já terminou o jogo uma vez */
    a.autopiloto = jogo.chegouLua ? RL.nivelAutopiloto(n('autopiloto')) : 0;
    a.tempoMax = RL.NIVEIS_TEMPO[RL.indiceTempo(n('tempo'))];
    const queimaTotal = a.estagios.reduce((t, e) => t + (e.queima ? e.combustivel / e.queima : 0), 0);
    if (queimaTotal > TETO_QUEIMA) for (const e of a.estagios) e.queima *= queimaTotal / TETO_QUEIMA;
    return a;
  }

  function massaAtual(s, a) {
    let m = a.massaTopo;
    for (let i = s.estagio; i < a.estagios.length; i++) {
      const e = a.estagios[i];
      m += e.seca + s.comb[i];
      if (e.lateral) m += e.lateral.massa;
    }
    return Math.max(0.05, m);
  }

  /* ---------- Física ---------- */

  function novoVoo(a) {
    return {
      h: 0, v: 0, t: 0, estagio: 0, casco: a.casco, turbo: 1, theta: 0, fim: null, vMax: 0, parado: 0,
      comb: a.estagios.map((e) => e.combustivel),
      moedas: 0, eventos: 0, ganhosEvento: 0, semMotor: 0, decolou: false,
      batidas: 0, moedasN: 0, combo: 0, comboMax: 1, trizes: 0, ganhoTriz: 0, caixas: [], ganhoCaixas: 0, absurdos: 0, usouTurbo: false,
    };
  }

  function soltarEstagio(s, a) {
    if (s.estagio >= a.estagios.length - 1) return false;
    s.estagio++;
    s.semMotor = 0;
    return true;
  }

  /* O ar segura o foguete: abaixo da Linha de Kármán a velocidade tem teto, e por isso sair
     da atmosfera é uma travessia de minutos, em todo voo. Bico e cera encurtam, mas nunca anulam. */
  const KM_ESPACO = 100;
  /* A partir daqui a gravidade da Lua vence a da Terra: quem chega neste ponto é puxado até lá. */
  const KM_PUXA_LUA = 326000;
  const AR_BASE = 0.13, AR_POR_KM = 0.0105;
  function tetoAr(h, a) {
    if (h >= KM_ESPACO) return Infinity;
    const liso = Math.max(1, Math.min(1.8, 1 / Math.max(a.arrasto, 0.3) ** 0.55));
    return (AR_BASE + AR_POR_KM * h) * liso;
  }

  const gravidade = (h) => Math.max(G_MIN, G0 * (RAIO_TERRA / (RAIO_TERRA + h)) ** 2);

  function ligado(s, a) {
    const e = a.estagios[s.estagio];
    return !!e && e.empuxo > 0 && s.comb[s.estagio] > 0;
  }

  function passo(s, a, dt, ctrl) {
    if (s.fim) return s;
    ctrl = ctrl || {};
    s.t += dt;
    const e = a.estagios[s.estagio];
    let empuxo = 0;
    let motorLigado = false;

    let auxiliares = false;
    if (e && e.empuxo > 0 && s.comb[s.estagio] > 0) {
      motorLigado = true;
      empuxo = e.empuxo;
      s.comb[s.estagio] = Math.max(0, s.comb[s.estagio] - e.queima * dt);
    }
    /* motores auxiliares das laterais: independem do motor principal e do combustível; só gastam a barra de turbo */
    if (ctrl.turbo && s.turbo > 0 && e && e.lateral) {
      auxiliares = true;
      empuxo += e.lateral.empuxo;
      s.usouTurbo = true;
      s.turbo = Math.max(0, s.turbo - dt * 0.18);
    }
    if (!auxiliares) s.turbo = Math.min(1, s.turbo + a.recarga * dt);

    if (!motorLigado) {
      s.semMotor += dt;
      if (s.estagio < a.estagios.length - 1 && (s.semMotor > 3 || ctrl.autoSoltar)) soltarEstagio(s, a);
    } else {
      s.semMotor = 0;
    }

    const empurrando = empuxo > 0;
    const inclina = Math.cos(s.theta || 0);
    const m = massaAtual(s, a);
    const acel = (empuxo / m / 1000) * inclina * (a.dobra || 1);
    const k = (empurrando ? K_ESPACO * a.arrasto : K_DESLIGADO) + K_AR * a.arrasto * Math.exp(-s.h / 8);
    const g = gravidade(s.h);

    if (!s.decolou && acel <= g) {
      s.parado += dt;
      if (!empurrando) s.fim = 'semforca';
      return s;
    }
    s.decolou = true;

    const puxado = s.h >= KM_PUXA_LUA && s.h < RL.KM_LUA && s.v > 0 && !s.queda;
    if (puxado) s.v = Math.max(s.v, Math.min(60, s.v + 0.4 * dt));
    else s.v += (acel - g - k * s.v) * dt;
    const teto = (ctrl.turbo && s.turbo > 0 ? V_MAX_TURBO : V_MAX) * (a.dobra || 1);
    if (s.v > teto) s.v = Math.max(teto, s.v - (s.v - teto) * Math.min(1, dt));
    const ar = tetoAr(s.h, a);
    if (s.v > ar) {
      s.v = ar;
      s.segurado = true;
    } else s.segurado = false;
    s.h = Math.max(0, s.h + s.v * dt);
    if (s.v > s.vMax) s.vMax = s.v;

    if (a.regen > 0 && s.casco > 0) s.casco = Math.min(a.casco, s.casco + a.regen * dt);

    const kmFim = a.kmFim || RL.KM_LUA;
    if (s.h >= kmFim) {
      s.h = kmFim;
      s.fim = kmFim === RL.KM_LUA ? 'lua' : 'plutao';
    } else if ((!empurrando && s.v <= 0 && s.estagio >= a.estagios.length - 1) || (s.decolou && s.h <= 0 && s.v < 0)) {
      /* no jogo o foguete vira e despenca; na simulação o voo acaba aqui */
      if (ctrl.comQueda) s.apice = true;
      else s.fim = 'combustivel';
    }
    return s;
  }

  function danificar(s, a, dano) {
    s.casco -= dano * (1 - a.reducao);
    if (s.casco <= 0) {
      s.casco = 0;
      s.fim = s.fim || 'casco';
    }
  }

  function simular(a, opcoes) {
    const o = opcoes || {};
    const s = novoVoo(a);
    let guarda = 0;
    while (!s.fim && guarda++ < 40000) {
      const dt = s.v > 2 ? 2 : 0.25;
      passo(s, a, dt, { autoSoltar: true });
      if (o.limiteT && s.t > o.limiteT) break;
      if (s.parado > 60) {
        s.fim = 'semforca';
        break;
      }
    }
    return s;
  }

  /* ---------- Pagamento ---------- */

  function pagamentoDistancia(km, a) {
    return Math.floor(48 * km ** 0.5 * a.pagamento);
  }

  function valorMoeda(km, a) {
    return Math.max(1, Math.round((1 + 0.25 * km ** 0.42) * a.moeda));
  }

  function fechamento(s, a, jogo) {
    const km = Math.max(s.h, s.hMax || 0);
    const distancia = pagamentoDistancia(km, a);
    const moedas = Math.floor(s.moedas);
    const eventos = Math.floor(s.ganhosEvento);
    const seguro = s.fim === 'casco' ? Math.floor(distancia * a.seguro) : 0;
    const novos = RL.MARCOS.filter((m) => km >= m.km && !jogo.marcos.includes(m.km));
    const premios = novos.reduce((t, m) => t + m.premio, 0);
    const recorde = km > jogo.recorde;
    return { km, distancia, moedas, eventos, seguro, premios, novos, recorde, total: distancia + moedas + eventos + seguro + premios };
  }

  function aplicarFechamento(jogo, f, s) {
    jogo.moedas += f.total;
    jogo.voos++;
    if (s && s.t) jogo.tempoJogado += s.t;
    for (const m of f.novos) jogo.marcos.push(m.km);
    if (f.km > jogo.recorde) jogo.recorde = f.km;
    if (f.km >= RL.KM_LUA) jogo.chegouLua = true;
    jogo.vooAtivo = null;
    return jogo;
  }

  /* ---------- Compras ---------- */

  function pecaLiberada(jogo, p) {
    return jogo.recorde >= p.requerKm;
  }

  function comprarPeca(jogo, id) {
    const p = RL.PECAS[id];
    if (!p || jogo.pecas.includes(id) || !pecaLiberada(jogo, p) || jogo.moedas < p.preco) return false;
    jogo.moedas -= p.preco;
    jogo.pecas.push(id);
    return true;
  }

  function comprarRoupa(jogo, tipo, id) {
    const chave = tipo + ':' + id;
    const r = RL.ROUPA[chave];
    if (!r) return false;
    if (!jogo.roupas.includes(chave)) {
      if (jogo.moedas < r.preco) return false;
      jogo.moedas -= r.preco;
      jogo.roupas.push(chave);
    }
    jogo.piloto[tipo] = id;
    return true;
  }

  function custoPesquisa(jogo, id) {
    const q = RL.PESQUISA[id];
    const n = nivelPesquisa(jogo, id);
    if (n >= q.niveis) return Infinity;
    return Math.round(q.base * q.fator ** n);
  }

  function comprarPesquisa(jogo, id) {
    const c = custoPesquisa(jogo, id);
    if (jogo.moedas < c) return false;
    jogo.moedas -= c;
    jogo.pesquisa[id] = nivelPesquisa(jogo, id) + 1;
    return true;
  }

  /* ---------- Comprar espaço direto na oficina: paga os níveis que faltam até o próximo encaixe ---------- */
  const ESPACOS = { modulos: { passo: 3, nome: 'módulo' }, empilhar: { passo: 5, nome: 'tanque' }, estagios: { passo: 5, nome: 'estágio' } };

  function custoEspaco(jogo, id) {
    const n = nivelPesquisa(jogo, id), passo = ESPACOS[id].passo;
    const alvo = (Math.floor(n / passo) + 1) * passo;
    if (alvo > RL.PESQUISA[id].niveis || (id === 'empilhar' && alvo > 10)) return Infinity;
    let total = 0;
    for (let i = n; i < alvo; i++) total += Math.round(RL.PESQUISA[id].base * RL.PESQUISA[id].fator ** i);
    return total;
  }

  function comprarEspaco(jogo, id) {
    const c = custoEspaco(jogo, id);
    if (!isFinite(c) || jogo.moedas < c) return false;
    jogo.moedas -= c;
    jogo.pesquisa[id] = (Math.floor(nivelPesquisa(jogo, id) / ESPACOS[id].passo) + 1) * ESPACOS[id].passo;
    return true;
  }

  /* ---------- Escudo de bolha: gasta uma carga e o casco não sente nada por alguns segundos ---------- */
  const BOLHA_SEG = 4;
  const custoBolha = (jogo) => Math.round(150 * 1.32 ** jogo.bolhas.compradas);

  function comprarBolha(jogo) {
    const c = custoBolha(jogo);
    if (jogo.moedas < c) return false;
    jogo.moedas -= c;
    jogo.bolhas.qtd++;
    jogo.bolhas.compradas++;
    return true;
  }

  function usarBolha(jogo) {
    if (jogo.bolhas.qtd <= 0) return false;
    jogo.bolhas.qtd--;
    return true;
  }

  /* ---------- Segredos ---------- */
  function revelar(jogo, id) {
    jogo.segredos = jogo.segredos || [];
    if (jogo.segredos.includes(id)) return false;
    jogo.segredos.push(id);
    return true;
  }

  /* ---------- Pouso ---------- */
  const POUSO = { alt: 1200, v: 60, g: 22, freio: 54, gasto: 0.085, perfeito: 6, bom: 14 };
  function passoPouso(p, freando, dt) {
    p.frea = !!(freando && p.reserva > 0);
    if (p.frea) p.reserva = Math.max(0, p.reserva - POUSO.gasto * dt);
    p.v += (POUSO.g - (p.frea ? POUSO.freio : 0)) * dt;
    if (p.v < 0) p.v = 0;
    p.alt -= p.v * dt;
    if (p.alt <= 0) {
      p.alt = 0;
      p.nota = p.v <= POUSO.perfeito ? 'perfeito' : p.v <= POUSO.bom ? 'bom' : 'duro';
    }
    return p;
  }
  /* autopiloto: mira tocar o chão a 10 m/s. Pousa sempre, mas nunca faz um pouso perfeito */
  const pousoDeveFrear = (p) => p.v > 10 && (p.v * p.v - 100) / (2 * (POUSO.freio - POUSO.g)) >= p.alt - 12;
  const premioPouso = { perfeito: 0.5, bom: 0.25, duro: 0 };

  /* ---------- Faixas ---------- */

  function indiceFaixa(h) {
    let i = 0;
    RL.FAIXAS.forEach((f, j) => {
      if (h >= f.de) i = j;
    });
    return i;
  }

  /* ---------- Jogo salvo ---------- */

  function completar(j) {
    const novo = jogoNovo();
    const r = { ...novo, ...j };
    r.opcoes = { ...novo.opcoes, ...(j.opcoes || {}) };
    r.opcoes.teclas = { ...novo.opcoes.teclas, ...((j.opcoes && j.opcoes.teclas) || {}) };
    r.pintura = { ...novo.pintura, ...(j.pintura || {}) };
    r.piloto = { ...novo.piloto, ...(j.piloto || {}) };
    r.roupas = j.roupas || novo.roupas;
    r.assinadas = j.assinadas || [];
    r.banco = { ...novo.banco, ...(j.banco || {}) };
    r.libera = { ...novo.libera, ...(j.libera || {}) };
    r.estat = { ...novo.estat, ...(j.estat || {}) };
    r.bolhas = { ...novo.bolhas, ...(j.bolhas || {}) };
    r.vistos = j.vistos || {};
    return r;
  }

  function salvar(jogo, armazenamento) {
    try {
      armazenamento.setItem(CHAVE, JSON.stringify(jogo));
      return true;
    } catch (e) {
      return false;
    }
  }

  function carregar(armazenamento) {
    try {
      const t = armazenamento.getItem(CHAVE);
      return t ? completar(JSON.parse(t)) : null;
    } catch (e) {
      return null;
    }
  }

  function apagar(armazenamento) {
    try {
      armazenamento.removeItem(CHAVE);
    } catch (e) {
      /* sem armazenamento, nada a apagar */
    }
  }

  Object.assign(RL, {
    MODO_DEV, KM_ESPACO, KM_PUXA_LUA, tetoAr, revelar, POUSO, passoPouso, pousoDeveFrear, premioPouso, jogoNovo, buildInicial, limites, aceita, ler, encaixar, limpar, problemasDoBuild, atributos, novoVoo, passo, soltarEstagio,
    danificar, simular, ligado, massaAtual, gravidade, valorMoeda, pagamentoDistancia, fechamento, aplicarFechamento,
    ESPACOS, custoEspaco, comprarEspaco, BOLHA_SEG, custoBolha, comprarBolha, usarBolha, pecaLiberada, comprarPeca, comprarRoupa, custoPesquisa, comprarPesquisa, nivelPesquisa, indiceFaixa, salvar, carregar, apagar, teclasPadrao, TIPOS_MODULO,
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
