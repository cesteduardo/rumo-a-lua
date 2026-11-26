/* A cena de voo: canvas para o mundo, HTML para o painel. */
(function () {
  const RL = window.RL;
  const D = () => RL.Desenho;
  const lerp = (a, b, t) => a + (b - a) * t;
  const limitar = (x, a, b) => Math.max(a, Math.min(b, x));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const fmt = (n, d) => n.toLocaleString('pt-BR', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
    const BATIDAS = ['POW!', 'BONK!', 'CRÁS!', 'TUM!', 'AI!', 'PLOFT!'];

  RL.fmtKm = function (km) {
    if (km < 10) return fmt(km, 2);
    if (km < 1000) return fmt(km, 1);
    return fmt(Math.floor(km));
  };

  function criar(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function iniciar(raiz, opcoes) {
    const { jogo, aoTerminar, aoSalvar, aoOpcoes } = opcoes;
    const build = jogo.foguete;
    const a = RL.atributos(build, jogo);
    const retomado = jogo.vooAtivo && jogo.vooAtivo.s;
    const s = retomado ? jogo.vooAtivo.s : RL.novoVoo(a);
    const calmo = () => jogo.opcoes.movimentoReduzido || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const caixa = criar('div', 'voo');
    const canvas = criar('canvas');
    caixa.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const hud = montarPainel(caixa, a);
    raiz.appendChild(caixa);
    /* céu, nuvens, Terra, Lua, chama, fumaça e papel em WebGPU (os mesmos shaders da página do jogo) */
    const gpu = RL.CenaGPU && RL.CenaGPU.ok ? RL.CenaGPU.camada(caixa, canvas) : null;
    const usaGPU = () => !!(gpu && gpu.ativa);

    /* Modo de teste: sem dano e sem faltar combustível. Só existe abrindo teste-lua.html. */
    if (RL.MODO_DEV) {
      a.reducao = 1;
      a.autopiloto = 3;
      a.tempoMax = RL.NIVEIS_TEMPO[RL.NIVEIS_TEMPO.length - 1];
    }
    function devPular(km) {
      s.h = km;
      s.hMax = Math.max(s.hMax || 0, km);
      s.v = Math.max(s.v, km >= RL.KM_PUXA_LUA ? 60 : 5);
      s.decolou = true;
      est.ignicao = 0;
      est.torre = 1;
      est.scroll = Math.max(est.scroll, 9000);
      est.hZona = km;
      est.ultimoH = km;
      est.obj = [];
    }

    let W = 0, H = 0;
    /* anéis só existem perto da velocidade máxima; passar pelos três pula este tanto de voo */
    /* com um grupo por minuto ou dois, pegar todos tira uns 3 minutos do voo: a Lua continua acima de 32 min */
    const VEL_ANEIS = 130, SEG_ESTILINGUE = 8;
    /* o foguete nunca some atrás da régua da direita */
    const X_MIN = 60, X_MARGEM_DIR = 120;
    function medir() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = caixa.clientWidth;
      H = caixa.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (gpu) gpu.medir(canvas.width, canvas.height, dpr);
    }
    medir();
    window.addEventListener('resize', medir);

    const fx = RL.Efeitos.criar();
    /* o foguete não muda durante o voo: uma montagem por estágio basta */
    const cacheL = new Map();
    const LL = (desde) => {
      let l = cacheL.get(desde);
      if (!l) { l = D().layout(build, null, desde ? { desde } : {}); cacheL.set(desde, l); }
      return l;
    };
    const est = {
      x: W / 2, scroll: retomado ? 99999 : 0, obj: [], soltos: [], textos: [], nuvens: [], proxGrupo: 500,
      inv: 0, tremor: 0, fator: 1, fatorGuardado: 1, auto: a.autopiloto > 0, semMao: 9, evento: null,
      proxEvento: rnd(30, 60), chefeEm: rnd(12, 25), chefeFeito: false, respostaEm: 0, resposta: null, radioEm: rnd(50, 90), cadeia: 0, aneisVistos: false, rel: 0, pausado: false, fimT: 0, salvar: 0, humor: null, humorT: 0, ignicao: retomado ? 0 : 1.5,
      mx: W / 2, my: H * 0.3, modo: 'teclado', teclas: {}, turboMouse: false, ultimoH: s.h, marcosVistos: new Set(jogo.marcos),
      faixa: RL.indiceFaixa(s.h), acabou: false, dica: 0, particula: 0, vs: 0, comboT: 0, flash: 0, olhar: 0, feitos: new Set(),
      motorAntes: true, torre: retomado ? 1 : 0, decolouFx: !!retomado, explodiu: false, tossiu: 0,
      estagioVisto: s.estagio, kick: 0, cam: 1, saltou: false, desce: 0, abre: 0, proxAnuncio: 3, vira: s.queda ? 1 : 0, falaAte: 0, falaProx: 0, zoom: retomado ? 1 : 1.16, para: 0, multAntes: 1, turboFalou: false, luaFalou: false,
      zonaId: null, raios: [], raioEm: 1, ventoEm: rnd(2, 4), rajada: null, muralhaEm: 0, brecha: 0.5, hZona: s.h, pouso: null, tatuVisto: false, pad: { x: 0, turbo: false, antes: {} }, marcaSecreta: new Set(), capVisto: Math.max(jogo.capitulo || 0, RL.capituloDe(jogo.recorde).i), chat: { fila: [], prox: 0, digitando: null }, proxConversa: rnd(18, 35),
      anelEm: 25, estrelas: [[], [], []], escSuave: 0, fundoY: 0, bolha: 0, surto: 0, linhas: [], linhaFeita: new Set(), recordeBateu: false, velIdx: RL.VELOCIDADES.filter((q) => s.v >= q.kms).length, para2: 0, olhaFrente: 0, travaT: 0, turboAntes: false, faixaT: 0, explodiuChao: false,
    };
    est.nuvemY = [0, 0, 0];
    est.tempK = 0;
    for (let c = 0; c < 3; c++) for (let i = 0; i < 26 + c * 18; i++) est.estrelas[c].push({ x: Math.random(), y: Math.random(), r: rnd(0.6, 1.5) * (1 - c * 0.2) });
    const molaTheta = RL.Efeitos.mola(90, 11);
    molaTheta.x = s.theta;
    const molaEsc = RL.Efeitos.mola(170, 13);
    molaEsc.alvo = 1;
    molaEsc.x = 1;
    if (jogo.opcoes.controle !== 'auto') est.modo = jogo.opcoes.controle;

    /* ---------- Entrada ---------- */
    const T = jogo.opcoes.teclas;
    const apertouTurbo = () => est.teclas[T.turbo] || est.teclas.ArrowUp || est.teclas.KeyW || est.turboMouse || est.pad.turbo;
    /* O turbo independe do combustível: basta ter motor auxiliar neste estágio e barra de turbo. */
    const turboLigado = () => !!(apertouTurbo() && s.turbo > 0 && !s.queda && !est.pouso && a.estagios[s.estagio] && a.estagios[s.estagio].lateral);
    function aoTecla(e) {
      if (e.code === T.pausa) {
        alternarPausa();
        e.preventDefault();
        return;
      }
      if (est.pausado) return;
      if (RL.MODO_DEV && !e.repeat && !est.pouso && !s.queda) {
        if (e.code === 'KeyL') devPular(RL.KM_LUA - 3000);
        if (e.code === 'KeyN') devPular(Math.min(RL.capituloDe(s.h).ate, RL.KM_LUA - 3000) + 1);
      }
      est.teclas[e.code] = true;
      if ([T.esquerda, T.direita, T.turbo, 'KeyA', 'KeyD', 'KeyW', 'ArrowUp'].includes(e.code)) {
        if (jogo.opcoes.controle === 'auto') est.modo = 'teclado';
        est.semMao = 0;
        e.preventDefault();
      }
      if (e.repeat) return;
      if (e.code === T.soltar) soltar();
      if (e.code === T.autopiloto) alternarAuto();
      if (e.code === T.tempo) proximoTempo();
      if (e.code === T.escudo) ligarBolha();
    }
    function aoSoltarTecla(e) {
      est.teclas[e.code] = false;
    }
    function aoMover(e) {
      const r = caixa.getBoundingClientRect();
      const nx = e.clientX - r.left, ny = e.clientY - r.top;
      const moveu = Math.abs(nx - est.mx) + Math.abs(ny - est.my);
      est.mx = nx;
      est.my = ny;
      if (moveu > 2 && jogo.opcoes.controle === 'auto') est.modo = 'mouse';
      if (moveu > 2 && est.modo === 'mouse') est.semMao = 0;
    }
    function aoApertar(e) {
      RL.Som.iniciar();
      if (e.target.closest('button')) return;
      if (e.button === 0) est.turboMouse = true;
      if (e.button === 2) soltar();
    }
    const aoLargar = () => (est.turboMouse = false);
    const semMenu = (e) => e.preventDefault();
    const aoSumir = () => {
      est.teclas = {};
      est.turboMouse = false;
      if (document.hidden && !est.pausado && !est.acabou) alternarPausa();
    };
    window.addEventListener('keydown', aoTecla);
    window.addEventListener('keyup', aoSoltarTecla);
    caixa.addEventListener('pointermove', aoMover);
    caixa.addEventListener('pointerdown', aoApertar);
    window.addEventListener('pointerup', aoLargar);
    caixa.addEventListener('contextmenu', semMenu);
    document.addEventListener('visibilitychange', aoSumir);

    hud.bBolha.onclick = ligarBolha;
    hud.bSoltar.onclick = soltar;
    hud.bAuto.onclick = alternarAuto;
    hud.bTempo.onclick = proximoTempo;
    hud.bPausa.onclick = alternarPausa;
    hud.bCasa.onclick = () => {
      if (s.queda) s.fim = s.fim || 'pousou';
      else s.v = -1;
    };

    function soltar() {
      RL.soltarEstagio(s, a);
    }

    /* Chamado quando o estágio mudou, seja pelo jogador ou sozinho. */
    function efeitoSoltar(de) {
      RL.Som.soltar();
      const e = escalaFoguete();
      const L = LL(s.estagio);
      const off = (L.altura * e) / 2;
      const px = est.x - Math.sin(s.theta) * off, py = yFoguete() + Math.cos(s.theta) * off;
      est.soltos.push({ x: px, y: py + 8, vy: -30, vx: rnd(-30, 30), vr: rnd(-1.6, 1.6), r: s.theta, idade: 0, estagio: de, k: 1, fuma: 0 });
      /* parafusos explosivos: estalo, anel, gás de cada lado e pedaços da trava */
      fx.anel(px, py, 120 * e + 40);
      fx.pow(px + rnd(-20, 20), py, 'TCHAC!', '#F4F1E4');
      fx.faisca(px, py, 18, '#F0CF62', 380);
      for (const l of [-1, 1]) {
        for (let i = 0; i < 5; i++) fx.puff(px + l * rnd(10, 40), py + rnd(-6, 6), { r: rnd(7, 13), r1: rnd(18, 32), vx: l * rnd(140, 340), vy: rnd(-24, 24), vida: rnd(0.45, 0.8), atrito: 2, arrasto: 0.55 });
        for (let i = 0; i < 3; i++) fx.caco(px + l * 18, py, '#7E878C', rnd(6, 11));
      }
      /* o foguete dá um pulo para a frente e o motor novo acende */
      molaEsc.x = 0.8;
      molaEsc.v = 2.4;
      est.kick = -46;
      est.tremor = Math.max(est.tremor, 0.42);
      est.humor = 'susto';
      est.humorT = 0.7;
    }

    /* Escudo de bolha: gasta uma carga e o casco não sente nada por alguns segundos. */
    function ligarBolha() {
      if (!s.decolou || s.queda || est.acabou || est.bolha > 0) return;
      if (!RL.usarBolha(jogo)) {
        RL.Som.erro();
        return;
      }
      est.bolha = RL.BOLHA_SEG;
      RL.Som.bolha();
      fx.anel(est.x, yFoguete(), 170, '#BFE3E6');
      molaEsc.x = 1.12;
      falar('bolha', true);
    }

    function alternarAuto() {
      if (a.autopiloto < 1) return;
      est.auto = !est.auto;
      est.semMao = 9;
      RL.Som.clique();
      dica(est.auto ? 'Autopiloto ligado. Mexer nos controles assume por um segundo.' : 'Autopiloto desligado.');
    }
    function proximoTempo() {
      if (a.tempoMax <= 1 || est.evento || !s.decolou) return;
      if (RL.travaTempo(s.h)) {
        RL.Som.erro();
        dica(s.h < 100 ? 'Dentro do ar não dá para acelerar o tempo.' : 'Neste trecho não dá para acelerar o tempo.');
        return;
      }
      const niveis = RL.NIVEIS_TEMPO.filter((n) => n <= a.tempoMax);
      est.fator = niveis[(niveis.indexOf(est.fator) + 1) % niveis.length];
      if (est.fator > 1) est.obj = est.obj.filter((o) => RL.OBJ[o.nome].tipo === 'moeda');
      RL.Som.clique();
    }
    function alternarPausa() {
      if (est.acabou) return;
      est.pausado = !est.pausado;
      hud.pausa.hidden = !est.pausado;
      RL.Som.motor(0);
      clearTimeout(est.tJanela);
      hud.pTexto.textContent = 'A capivara está olhando pela janela. Nada mudou.';
      if (est.pausado) {
        aoSalvar(guardar());
        est.tJanela = setTimeout(() => {
          hud.pTexto.textContent = 'Ela continua olhando. Agora ela sabe que você está aí.';
          if (RL.revelar(jogo, 'janela')) RL.Som.marco();
        }, 60000);
      }
    }
    hud.pContinuar.onclick = alternarPausa;
    hud.pOpcoes.onclick = () => aoOpcoes();
    hud.pEncerrar.onclick = () => {
      est.pausado = false;
      hud.pausa.hidden = true;
      s.fim = s.fim || 'encerrado';
    };

    function guardar() {
      jogo.vooAtivo = { s: JSON.parse(JSON.stringify(s)) };
      return jogo;
    }

    /* ---------- Avisos ---------- */
    function aviso(titulo, texto, classe) {
      hud.aviso.className = 'aviso visivel ' + (classe || '');
      hud.avisoT.textContent = titulo;
      hud.avisoX.textContent = texto || '';
      clearTimeout(hud.tAviso);
      hud.tAviso = setTimeout(() => (hud.aviso.className = 'aviso'), 4600);
    }
    function dica(texto) {
      hud.dica.textContent = texto;
      hud.dica.className = 'dica visivel';
      clearTimeout(hud.tDica);
      hud.tDica = setTimeout(() => (hud.dica.className = 'dica'), 4200);
    }

    /* O chat da firma: os dois conversam em balões, um de cada vez. */
    function dizer(quem, texto, urgente) {
      /* urgente só encurta a espera: nunca apaga a resposta do outro. Fila longa perde as mais velhas */
      if (urgente) est.chat.prox = Math.min(est.chat.prox, est.rel + 1);
      while (est.chat.fila.length >= 5) est.chat.fila.shift();
      est.chat.fila.push({ quem, texto });
    }
    function novoBalao(quem, texto) {
      const b = criar('div', 'chat-balao ' + quem + (texto ? '' : ' digitando'));
      if (quem === 't') {
        const av = criar('img', 'chat-avatar');
        av.src = 'arte/sprites/tatu_fala.png';
        av.alt = '';
        b.appendChild(av);
      }
      const corpo = criar('div', 'chat-corpo');
      if (quem === 't') corpo.appendChild(criar('small', '', 'Chefe'));
      corpo.appendChild(criar('span', '', texto || '. . .'));
      b.appendChild(corpo);
      hud.chat.appendChild(b);
      while (hud.chat.children.length > 3) hud.chat.firstChild.remove();
      return b;
    }
    function atualizarChat() {
      const ch = est.chat;
      for (const b of [...hud.chat.children]) {
        const ate = +(b.dataset.ate || 0);
        if (ate && est.rel > ate) b.remove();
      }
      if (est.rel < ch.prox || !ch.fila.length) return;
      const m = ch.fila[0];
      /* o chefe aparece digitando por um instante */
      if (m.quem === 't' && !ch.digitando) {
        ch.digitando = novoBalao(m.quem, '');
        ch.prox = est.rel + 0.6;
        return;
      }
      if (ch.digitando) {
        ch.digitando.remove();
        ch.digitando = null;
      }
      ch.fila.shift();
      const b = novoBalao(m.quem, m.texto);
      const leitura = 2.2 + m.texto.length * 0.045;
      b.dataset.ate = est.rel + leitura + 3.2;
      if (m.quem === 'c') est.falaAte = est.rel + leitura * 0.7;
      ch.prox = est.rel + leitura;
    }
    /* Ela comenta no chat. Com intervalo, senão vira rádio. E ele responde, porque sempre responde. */
    function falar(chave, forcar) {
      if (!forcar && est.rel < est.falaProx) return;
      const lista = RL.Personagens.FALAS[chave];
      if (!lista) return;
      const P = RL.Personagens;
      dizer('c', P.sortear(lista), forcar);
      est.falaProx = est.rel + 7;
      const base = chave.startsWith('bater') ? 'bater' : chave.startsWith('marco') ? 'marco' : chave.startsWith('viu') ? 'viu' : chave.startsWith('pegou') ? 'absurdo' : chave;
      const resp = P.RESPOSTA_TATU[base];
      if (resp && Math.random() < (chave.startsWith('pouso') ? 1 : 0.55)) dizer('t', P.sortear(resp));
    }
    /* O chefe manda uma mensagem por voo, conforme ela se afasta. A rádio preenche os trechos longos. */
    function mensagens() {
      if (!s.decolou || s.queda || est.evento || est.pouso || est.chat.fila.length) return;
      const P = RL.Personagens;
      const m = P.CHEFE[jogo.chefe || 0];
      if (!est.chefeFeito && m && est.rel >= est.chefeEm && s.h >= m.km) {
        est.chefeFeito = true;
        jogo.chefe = (jogo.chefe || 0) + 1;
        dizer('t', m.txt);
        dizer('c', m.resp);
        est.proxConversa = Math.max(est.proxConversa, est.rel + 30);
        est.radioEm = Math.max(est.radioEm, est.rel + 25);
        return;
      }
      /* o chefe puxa assunto no chat, sobre o trecho em que ela está */
      const conv = P.CONVERSA[RL.capituloDe(s.h).i];
      if (conv && est.rel >= est.proxConversa) {
        est.proxConversa = est.rel + rnd(45, 80);
        const chave = 'conversa' + RL.capituloDe(s.h).i;
        const i = jogo.vistos[chave] || 0;
        jogo.vistos[chave] = i + 1;
        for (const [quem, texto] of conv[i % conv.length]) dizer(quem, texto);
        est.radioEm = Math.max(est.radioEm, est.rel + 25);
        return;
      }
      if (s.h >= 100 && est.rel >= est.radioEm) {
        est.radioEm = est.rel + rnd(45, 90);
        const doDia = P.radioDoDia();
        if (doDia && !est.radioHoje) {
          est.radioHoje = true;
          aviso('Rádio da firma', doDia, 'radio');
        } else if (Math.random() < 0.3) {
          const marca = RL.MARCAS[(Math.random() * RL.MARCAS.length) | 0];
          aviso('Rádio da firma', 'Este trecho é um oferecimento de ' + marca.nome + '. ' + marca.slogan, 'radio');
        } else aviso('Rádio da firma', P.sortear(P.RADIO), 'radio');
      }
    }

    function pintarRetrato() {
      const c = hud.retrato.getContext('2d');
      const S = hud.retrato.width;
      c.clearRect(0, 0, S, S);
      const falando = est.rel < est.falaAte;
      const turbo = turboLigado();
      const humor = est.humor || (turbo ? 'susto' : null);
      c.save();
      if (!calmo() && (RL.ligado(s, a) || turboLigado())) c.translate(Math.sin(est.rel * 23) * (turbo ? 1.8 : 0.7), Math.cos(est.rel * 19) * (turbo ? 1.8 : 0.7));
      D().rostoCapivara(c, S / 2, S * 0.46 + (est.humorT > 0 ? Math.sin(est.rel * 22) * 2 : 0), S * 0.33, {
        t: est.rel, olhar: est.olhar, humor, astronauta: true,
        boca: falando ? Math.abs(Math.sin(est.rel * 15)) : undefined,
      });
      c.restore();
    }

    /* ---------- Colocar coisas no céu ---------- */
    function novoObj(nome, x, y, extra) {
      const o = { nome, x, y: s.queda ? H - y : y, vx: 0, vy: 0, fase: rnd(0, 6.28), gira: rnd(-1.2, 1.2), menor: 1e9, ...extra };
      est.obj.push(o);
      return o;
    }
    /* Desenhos de moedas: fileira, curva, arco, losango e zigue-zague. Sempre formam caminho. */
    function fileiraMoedas() {
      const forma = Math.random();
      const x0 = rnd(120, W - 200);
      if (forma < 0.22) {
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * 6.283;
          novoObj('moeda', x0 + Math.cos(a) * 88, -150 + Math.sin(a) * 88);
        }
        return;
      }
      const n = 8 + ((Math.random() * 7) | 0);
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1);
        const x = forma < 0.42 ? x0
          : forma < 0.64 ? x0 + Math.sin(i * 0.72) * 120
          : forma < 0.82 ? x0 + Math.sin(u * 3.14) * 190 - 95
          : x0 + (i % 6 < 3 ? i % 6 : 6 - (i % 6)) * 62 - 90;
        novoObj('moeda', limitar(x, 40, W - 90), -40 - i * 40);
      }
    }
    function sortearPerigo() {
      /* no ar, os meteoros só aparecem onde queimam de verdade */
      const lista = RL.PERIGOS_POR_FAIXA[est.faixa].filter((l) => l[0] !== 'meteoro' || s.h >= 60);
      const total = lista.reduce((t, l) => t + l[1], 0);
      let n = Math.random() * total;
      for (const [nome, peso] of lista) {
        n -= peso;
        if (n <= 0) return nome;
      }
      return lista[0][0];
    }
    function perigo(nome) {
      const d = RL.OBJ[nome];
      const lateral = nome === 'aviao' || nome === 'passaro';
      const dir = Math.random() < 0.5 ? 1 : -1;
      /* tamanho varia onde faz sentido: pedra pequena, média e enorme */
      const k = nome === 'meteoro' ? (s.h < 100 ? 0.5 : [0.55, 1, 1, 1.9][(Math.random() * 4) | 0]) : nome === 'lixo' ? rnd(0.45, 1.15) : 1;
      const x = lateral ? rnd(W * 0.05, W * 0.95) : rnd(40, W - 40);
      const vx = lateral ? dir * rnd(90, 190) : nome === 'meteoro' ? rnd(-90, 90) : rnd(-20, 20);
      /* nasce acima da tela, com folga para o aviso aparecer antes */
      const y = -(d.w * k * RL.zoomObjeto(nome, escalaFoguete()) * 0.6) - 240;
      novoObj(nome, x, y, { vx, k, cor: ['#D9774A', '#5E93A8', '#E0B23C', '#8E6AA8'][(Math.random() * 4) | 0] });
      if (d.tipo === 'decor' && Math.random() < 0.35) falar('viu_' + nome);
      /* pombo é pequeno e vive em bando */
      if (nome === 'passaro') {
        const lados = 2 + ((Math.random() * 3) | 0);
        for (let q = 1; q <= lados; q++) for (const l of [-1, 1]) {
          if (Math.random() < 0.8) novoObj('passaro', x - dir * q * 34 * escalaFoguete() + rnd(-6, 6), y + l * q * 22 * escalaFoguete() + rnd(-5, 5), { vx, k });
        }
      }
    }
    /* Três anéis em fila: quem passa pelos três pula um trecho da viagem. É o que fazer na velocidade máxima. */
    function anelEstilingue() {
      const id = (est.cadeiaId = (est.cadeiaId || 0) + 1);
      const dx = rnd(90, 190) * (Math.random() < 0.5 ? 1 : -1);
      const x0 = limitar(rnd(180, W - 260), 160 + Math.abs(dx) * 2, W - 200 - Math.abs(dx) * 2);
      for (let i = 0; i < 3; i++) novoObj('anel', x0 + dx * i, -120 - i * 420, { cadeiaId: id, ordem: i, gira: 0 });
      if (!est.aneisVistos && !jogo.dicas.aneis) {
        est.aneisVistos = true;
        jogo.dicas.aneis = true;
        aviso('Anéis de estilingue', 'Passe pelos três em sequência e o foguete pula um trecho da viagem.', 'moedas');
      }
    }
    function passouAnel(o) {
      o.morto = true;
      if (est.cadeiaAtual !== o.cadeiaId || o.ordem !== est.cadeia) {
        est.cadeiaAtual = o.cadeiaId;
        est.cadeia = o.ordem === 0 ? 0 : -1;
      }
      fx.anel(o.x, o.y, 110, '#F0CF62');
      fx.faisca(o.x, o.y, 14, '#F0CF62', 300);
      RL.Som.moeda(3 + Math.max(0, est.cadeia) * 2);
      if (est.cadeia < 0) return;
      est.cadeia++;
      est.kick = -22 * est.cadeia;
      const premio = Math.ceil(RL.pagamentoDistancia(Math.max(s.h, 1), a) * [0.005, 0.01, 0.015][o.ordem] * a.sorte);
      s.ganhosEvento += premio;
      flutuar('+' + fmt(premio), o.x, o.y, '#F0CF62');
      if (est.cadeia === 3) {
        est.cadeia = 0;
        const pulo = s.v * SEG_ESTILINGUE;
        s.h += pulo;
        s.estilingues = (s.estilingues || 0) + 1;
        est.tremor = Math.max(est.tremor, 0.3);
        est.humor = 'feliz';
        est.humorT = 1.6;
        fx.anel(est.x, yFoguete(), 190, '#F0CF62');
        RL.Som.marco();
        aviso('Estilingue!', 'Pulou ' + fmt(Math.round(pulo)) + ' km de viagem.', 'moedas');
        falar('estilingue', true);
      }
    }
    function grupo() {
      const ev = est.evento;
      if (ev) {
        if (ev.tipo === 'perigo') perigo(ev.obj);
        if (ev.tipo === 'cenario') {
          perigo(ev.obj);
          if (Math.random() < 0.5) fileiraMoedas();
        }
        if (ev.tipo === 'moedas') fileiraMoedas();
        if (ev.tipo === 'absurdo' && Math.random() < 0.35) fileiraMoedas();
        est.proxGrupo = ev.tipo === 'moedas' ? rnd(160, 260) : rnd(120, 220);
        return;
      }
      est.proxAnuncio -= 1;
      if (est.proxAnuncio <= 0) anuncio();
      /* raríssimo: o tatu flutuando no vácuo */
      if (!est.tatuVisto && !s.queda && est.faixa >= 4 && Math.random() < 0.0025) {
        est.tatuVisto = true;
        novoObj('tatuVacuo', rnd(W * 0.25, W * 0.75), -90, { vy: -90 });
        return;
      }
      const n = Math.random();
      if (s.queda) {
        /* na descida quase tudo é moeda: é a hora de encher o bolso */
        if (n < 0.72) fileiraMoedas();
        else if (n < 0.92) perigo(sortearPerigo());
        else novoObj('caixa', rnd(70, W - 70), -60);
        est.proxGrupo = rnd(170, 300);
        return;
      }
      if (s.v >= VEL_ANEIS && est.rel >= (est.anelEm || 0)) {
        est.anelEm = est.rel + rnd(60, 120);
        anelEstilingue();
        est.proxGrupo = rnd(900, 1300);
        return;
      }
      if (n < 0.44) fileiraMoedas();
      else if (n < 0.82) perigo(sortearPerigo());
      else if (n < 0.82 + 0.08 * a.galoes) novoObj('galao', rnd(70, W - 70), -60);
      else if (n < 0.95) novoObj('kit', rnd(70, W - 70), -60);
      else novoObj('caixa', rnd(70, W - 70), -60);
      est.proxGrupo = rnd(260, 480) * (1.15 - est.faixa * 0.05);
    }
    /* Tem sempre alguém vendendo alguma coisa, até a 300 mil km da Terra. */
    function anuncio() {
      est.proxAnuncio = 9 + Math.floor(Math.random() * 8);
      const lista = jogo.pintura.marcas.length && Math.random() < 0.6 ? jogo.pintura.marcas : RL.MARCAS.map((m) => m.id);
      const marca = lista[Math.floor(Math.random() * lista.length)];
      const dir = Math.random() < 0.5 ? 1 : -1;
      if (est.faixa <= 2) {
        const nome = Math.random() < 0.55 ? 'faixa' : 'dirigivel';
        novoObj(nome, dir > 0 ? -420 : W + 420, -240, { vx: dir * rnd(50, 100), marca });
      } else {
        novoObj('outdoor', Math.random() < 0.5 ? rnd(120, W * 0.3) : rnd(W * 0.7, W - 120), -300, { vx: rnd(-14, 14), marca });
      }
    }

    function comecarEvento() {
      const possiveis = RL.EVENTOS.filter((e) => est.faixa >= e.de && est.faixa < e.ate);
      if (!possiveis.length) return;
      const e = possiveis[(Math.random() * possiveis.length) | 0];
      est.evento = { ...e, fim: est.rel + e.dur };
      est.fatorGuardado = est.fator;
      est.fator = 1;
      s.eventos++;
      RL.Som.evento();
      aviso(e.nome, e.texto, e.tipo);
      falar(e.tipo === 'perigo' ? 'perigo' : e.tipo === 'moedas' || e.tipo === 'cenario' ? 'moedas' : 'absurdo', true);
      if (e.tipo === 'absurdo') novoObj(e.obj, rnd(W * 0.25, W * 0.75), -90, { vy: -90 });
    }
    function terminarEvento() {
      est.evento = null;
      est.fator = est.fatorGuardado;
      /* em tempo real: contado no tempo do jogo, a 100x o próximo evento vinha em pouco mais de 1 s */
      est.proxEvento = est.rel + rnd(70, 170);
    }

    /* ---------- Atualizar ---------- */
    const yFoguete = () => {
      if (est.pouso) {
        const alvo = H * 0.82 - (LL(s.estagio).altura * escalaFoguete()) / 2;
        return lerp(est.pouso.y0, alvo, limitar(est.pouso.t / 2, 0, 1));
      }
      if (s.queda) {
        const pouso = est.saltou ? limitar(1 - (1 - s.queda.p) * s.queda.T / 2.4, 0, 1) : 0;
        return lerp(lerp(H * 0.6, H * 0.34, limitar(est.vira, 0, 1)), H * 0.86 - 150 * escalaPara(), pouso);
      }
      const t = limitar(est.scroll / 500, 0, 1);
      const esc = escalaFoguete();
      const noChao = Math.min(H * 0.82 - (LL(0).altura * esc) / 2, H * 0.72);
      const altVoo = LL(s.estagio).altura * esc;
      /* quanto mais rápido, mais baixo ele fica: sobra céu para ver o que vem */
      const base = lerp(H * 0.58, H * 0.68, limitar(est.olhaFrente, 0, 1));
      const noAr = Math.max(altVoo / 2 + H * 0.15, Math.min(base, H - altVoo / 2 - 84));
      return lerp(noChao, noAr, t * t * (3 - 2 * t));
    };
    /* de paraquedas ela segue o tamanho do foguete: cabe umas três capivaras nele */
    const escalaPara = () => Math.max(0.5, escalaFoguete() * 0.8);
    function escalaAlvo() {
      const L = LL(s.estagio);
      if (est.pouso) return Math.min(0.9, (H * 0.56) / Math.max(L.altura, 1));
      /* o foguete é o protagonista e a recompensa: nunca vira um fio. Grande demais, ele passa
         da borda de baixo da tela, como qualquer foguete grande visto de perto */
      return Math.max(0.46, limitar((H * 0.5) / Math.max(L.altura, 1), 0.66, 1.2) * est.cam);
    }
    /* suave: soltar estágio não faz o foguete pular de tamanho */
    function escalaFoguete() {
      return est.escSuave || escalaAlvo();
    }

    function pilotar(dt) {
      const manual = est.teclas[T.esquerda] || est.teclas[T.direita] || est.teclas.KeyA || est.teclas.KeyD;
      if (Math.abs(est.pad.x) > 0.2) {
        s.theta = limitar(s.theta + est.pad.x * 1.5 * a.controle * dt, -1.1, 1.1);
        est.semMao = 0;
        molaTheta.alvo = s.theta;
        molaTheta.passo(dt);
        est.x = limitar(est.x + Math.sin(s.theta) * Math.min(620, Math.max(200, est.vs * 0.9)) * dt, X_MIN, W - X_MARGEM_DIR);
        return;
      }
      const vira = 1.5 * a.controle;
      let alvo = null;
      if (est.fator > 1) alvo = 0;
      else if (est.modo === 'mouse' && !(est.auto && est.semMao > 1)) {
        const dx = est.mx - est.x, dy = s.queda ? est.my - yFoguete() : yFoguete() - est.my;
        alvo = limitar(Math.atan2(dx, Math.max(40, dy)), -1.1, 1.1);
      } else if (est.auto && est.semMao > 1 && !manual) {
        alvo = decisaoAutopiloto();
      }
      if (manual) {
        const dir = (est.teclas[T.direita] || est.teclas.KeyD ? 1 : 0) - (est.teclas[T.esquerda] || est.teclas.KeyA ? 1 : 0);
        s.theta = limitar(s.theta + dir * vira * dt, -1.1, 1.1);
      } else if (alvo !== null) {
        s.theta += limitar(alvo - s.theta, -vira * dt, vira * dt);
      } else {
        s.theta = lerp(s.theta, 0, dt * 0.7);
      }
      molaTheta.alvo = s.theta;
      molaTheta.passo(dt);
      /* no pouso o foguete quase não anda de lado */
      const v = Math.sin(s.theta) * (est.pouso ? 260 : Math.min(620, Math.max(200, est.vs * 0.9)));
      est.x = limitar(est.x + v * dt * (s.decolou ? 1 : 0), X_MIN, W - X_MARGEM_DIR);
    }

    /* O autopiloto olha o que vem pela frente, testa várias posições na largura da tela e vai para
       a melhor. Considera o que dá tempo de alcançar, e por isso não corre para um lado impossível.
       Nível 1 desvia. Nível 2 também pega moedas. Nível 3 também liga o escudo quando não tem saída. */
    function decisaoAutopiloto() {
      if (est.pouso) return limitar((est.pouso.alvo + 110 - est.x) / 300, -0.35, 0.35);
      const yf = yFoguete(), esc = escalaFoguete(), n = a.autopiloto;
      const alcance = n >= 2 ? 780 : 560;
      const raioF = (D().W / 2) * esc * 0.9;
      const lateral = Math.sin(0.9) * Math.min(620, Math.max(200, est.vs * 0.9));
      const xFim = W - X_MARGEM_DIR;
      const candidatos = [est.x];
      for (let i = 0; i <= 18; i++) candidatos.push(X_MIN + ((xFim - X_MIN) * i) / 18);
      let melhor = est.x, nota = -Infinity, perigoPerto = false;
      for (const c of candidatos) {
        let p = -Math.abs(c - est.x) * 0.012 - Math.abs(c - W / 2) * 0.003;
        let bate = false;
        for (const o of est.obj) {
          const d = RL.OBJ[o.nome];
          if (d.tipo === 'decor' || (n < 2 && d.tipo !== 'perigo')) continue;
          const dy = s.queda ? o.y - yf : yf - o.y;
          if (dy < -30 || dy > alcance) continue;
          const velO = Math.max(60, Math.min(Math.max(est.vs, 60), 900) + (o.vy || 0));
          const t = Math.max(0, dy) / velO;
          const xNoEncontro = est.x + limitar(c - est.x, -lateral * t, lateral * t);
          const zo = RL.zoomObjeto(o.nome, esc), k = o.k || 1;
          const folga = Math.abs(o.x + (o.vx || 0) * t - xNoEncontro) - ((d.hx || 0) + d.r) * zo * k - raioF;
          const perto = 1 - Math.max(0, dy) / (alcance * 1.25);
          if (d.tipo === 'perigo') {
            if (folga < 60) {
              p -= 900 * perto;
              if (t < 0.45) bate = true;
            }
          } else if (folga < 12) {
            p += (d.tipo === 'moeda' ? 6 : d.tipo === 'anel' ? 45 : 28) * perto;
          }
        }
        for (const r of est.raios) {
          if (r.t <= 0) continue;
          const xr = est.x + limitar(c - est.x, -lateral * r.t, lateral * r.t);
          if (Math.abs(r.x - xr) < 46 * esc + 36) p -= 700;
        }
        if (p > nota) {
          nota = p;
          melhor = c;
          perigoPerto = bate;
        }
      }
      if (n >= 3 && perigoPerto && est.bolha <= 0 && s.casco < a.casco * 0.6 && jogo.bolhas.qtd > 0) ligarBolha();
      const limite = est.zonaId === 'maxq' ? 0.26 : 0.9;
      return limitar((melhor - est.x) / 170, -limite, limite);
    }

    function colidir(dt) {
      const yf = yFoguete(), esc = escalaFoguete();
      const L = LL(s.estagio);
      const meio = (L.altura * esc) / 2;
      const raioC = est.saltou ? 34 : (D().W / 2) * esc * 0.9;
      /* só bate o pedaço visível: a cauda de um foguete enorme fica abaixo da tela */
      const pts = est.saltou ? [[est.x, yf - 40]] : [-0.8, -0.4, 0, 0.4, 0.8].map((f) => [est.x + Math.sin(s.theta) * meio * f, yf - Math.cos(s.theta) * meio * f]).filter((p) => p[1] < H + 30);
      let ver = null, verD = 1e9;
      for (const o of est.obj) {
        const d = RL.OBJ[o.nome];
        if (d.tipo === 'decor') continue;
        const k = o.k || 1;
        const zo = RL.zoomObjeto(o.nome, esc);
        const raioD = d.r * zo * k;
        /* satélites são compridos: a área de batida acompanha o desenho */
        const meioL = (d.hx || 0) * zo * k;
        let menor = 1e9;
        for (const [px, py] of pts) menor = Math.min(menor, Math.hypot(Math.max(0, Math.abs(px - o.x) - meioL), py - o.y));
        if (d.tipo === 'moeda') {
          const dx = est.x - o.x, dy = yf - o.y, dist = Math.hypot(dx, dy);
          if (menor < raioC + raioD + 8) {
            tocar(o, d);
            continue;
          }
          /* o ímã puxa de longe: sem ele, a moeda só entra encostando */
          if (a.raioIma > 0 && dist < a.raioIma * 3.2 + raioC) {
            const k = 1 - dist / (a.raioIma * 3.2 + raioC);
            const puxa = (420 + k * 1500 + est.vs * (s.queda ? 1.1 : 1)) * dt;
            o.x += (dx / dist) * puxa;
            o.y += (dy / dist) * puxa;
          }
        } else {
          if (menor < raioD + raioC) {
            tocar(o, d);
            continue;
          }
          if (d.tipo === 'perigo') {
            o.menor = Math.min(o.menor, menor);
            if ((s.queda ? o.y < yf - meio * 0.3 : o.y > yf + meio * 0.3) && !o.contou) {
              o.contou = true;
              if (o.menor < raioD + raioC + 30 && !o.bateu) {
                const v = RL.quaseBateu(s, a);
                flutuar('Por um triz! +' + fmt(v), est.x + (o.x > est.x ? 70 : -70), yf - 30, '#BFE3E6');
                falar('triz');
                RL.Som.moeda();
              }
            }
          }
          if (menor < verD && (s.queda ? o.y > yf : o.y < yf)) {
            ver = o;
            verD = menor;
          }
        }
      }
      est.olhar = ver && verD < 340 ? limitar((ver.x - est.x) / 150, -1, 1) : Math.sin(est.rel * 0.5) * 0.4;
      if (ver && verD < 150 && !est.humor && RL.OBJ[ver.nome].tipo === 'perigo') {
        est.humor = 'susto';
        est.humorT = 0.4;
      }
      est.obj = est.obj.filter((o) => !o.morto);
    }

    function flutuar(texto, x, y, cor) {
      const meia = texto.length * 9;
      est.textos.push({ texto, x: limitar(x, meia + 16, W - meia - 90), y: Math.max(90, y), idade: 0, cor: cor || '#F0CF62' });
    }

    /* Faixa grande, curta e no meio: os momentos que merecem parar o olho por um segundo. */
    function faixaGrande(texto, sub, classe) {
      hud.faixa.className = 'faixa-grande ' + (classe || '');
      hud.faixaT.textContent = texto;
      hud.faixaS.textContent = sub || '';
      void hud.faixa.offsetWidth;
      hud.faixa.classList.add('entra');
    }
    function festa(n) {
      const yf = yFoguete();
      for (let i = 0; i < n; i++) fx.caco(rnd(W * 0.15, W * 0.85), yf - rnd(120, 320), ['#C8513F', '#E0B23C', '#3F8F87', '#8E6AA8', '#F4F1E4', '#5E93A8'][i % 6], rnd(6, 11));
    }

    /* Bolso cheio: combo máximo dobra as moedas por um tempo e faz chover. */
    function comecarSurto() {
      est.surto = 7;
      s.surto = true;
      est.proxGrupo = 0;
      faixaGrande('BOLSO CHEIO!', 'Moedas valem o dobro', 'dourada');
      RL.Som.marco();
      falar('surto', true);
    }

    function tocar(o, d) {
      const pegar = () => {
        o.morto = true;
        fx.brilho(o.x, o.y, 20);
      };
      if (d.tipo === 'anel') {
        passouAnel(o);
      } else if (d.tipo === 'moeda') {
        const r = RL.pegarMoeda(s, a);
        est.comboT = 2.2;
        if (RL.multCombo(s.combo) >= 5 && est.surto <= 0 && est.multAntes < 5) comecarSurto();
        if (RL.multCombo(s.combo) > est.multAntes && RL.multCombo(s.combo) >= 3) falar('combo');
        est.multAntes = RL.multCombo(s.combo);
        o.morto = true;
        RL.Som.moeda(s.combo);
        const ultimo = est.textos[est.textos.length - 1];
        if (ultimo && ultimo.soma != null && ultimo.idade < 0.45) {
          ultimo.soma += r.valor;
          ultimo.texto = '+' + fmt(ultimo.soma);
          ultimo.idade = 0;
          ultimo.pulo = 1;
          ultimo.x = est.x + (est.x < W / 2 ? 120 : -120);
        } else {
          flutuar('+' + fmt(r.valor), est.x + (est.x < W / 2 ? 120 : -120), yFoguete() - 30);
          est.textos[est.textos.length - 1].soma = r.valor;
        }
        fx.brilho(o.x, o.y, 11);
        const alvo = hud.iconeMoeda.getBoundingClientRect();
        const cr = caixa.getBoundingClientRect();
        fx.moedaVoa(o.x, o.y, alvo.left - cr.left + 10, alvo.top - cr.top + 10, () => {
          hud.chipMoedas.classList.remove('bate');
          void hud.chipMoedas.offsetWidth;
          hud.chipMoedas.classList.add('bate');
        });
      } else if (d.tipo === 'galao') {
        const e = a.estagios[s.estagio];
        if (e) s.comb[s.estagio] = Math.min(e.combustivel, s.comb[s.estagio] + e.combustivel * 0.18);
        pegar();
        RL.Som.compra();
        flutuar('Combustível!', o.x, o.y, '#F4F1E4');
      } else if (d.tipo === 'kit') {
        s.casco = Math.min(a.casco, s.casco + a.casco * 0.25);
        pegar();
        RL.Som.compra();
        flutuar('Conserto!', o.x, o.y, '#F4F1E4');
      } else if (d.tipo === 'caixa') {
        const item = RL.abrirCaixa(s, a, jogo);
        pegar();
        fx.faisca(o.x, o.y, 16, '#F0CF62', 260);
        fx.anel(o.x, o.y, 60, '#F0CF62');
        for (let i = 0; i < 12; i++) fx.caco(o.x, o.y, ['#C8513F', '#E0B23C', '#3F8F87', '#8E6AA8'][i % 4], 7);
        falar('caixa');
        RL.Som.marco();
        flutuar(item.tipo === 'moedas' ? '+' + fmt(item.valor) + ' moedas' : 'Novo ' + RL.COSMETICOS[item.tipo] + '!', o.x, o.y);
        est.humor = 'feliz';
        est.humorT = 1.5;
      } else if (d.tipo === 'absurdo') {
        const familia = o.nome === 'pato' && build.enfeite === 'enfeite0';
        const premio = Math.ceil(RL.pagamentoDistancia(Math.max(s.h, 1), a) * (familia || o.nome === 'tatuVacuo' ? 0.6 : 0.18) * a.sorte);
        s.ganhosEvento += premio;
        s.absurdos = (s.absurdos || 0) + 1;
        pegar();
        if (familia) RL.revelar(jogo, 'filho');
        if (o.nome === 'tatuVacuo') {
          RL.revelar(jogo, 'avisou');
          dizer('t', 'Eu avisei.');
        }
        falar(familia ? 'filho' : 'pegou_' + o.nome, true);
        fx.faisca(o.x, o.y, 22, '#F0CF62', 340);
        fx.anel(o.x, o.y, 90, '#F0CF62');
        RL.Som.marco();
        flutuar('+' + fmt(premio) + ' moedas', o.x, o.y);
        est.humor = 'feliz';
        est.humorT = 2;
      } else if (d.tipo === 'perigo' && est.bolha > 0) {
        /* a bolha devolve a pancada: o objeto some e o combo continua */
        o.morto = true;
        fx.anel(o.x, o.y, 110, '#BFE3E6');
        fx.pow(o.x, o.y, 'PLIM!', '#BFE3E6');
        fx.faisca(o.x, o.y, 14, '#BFE3E6', 320);
        est.tremor = Math.max(est.tremor, 0.18);
        RL.Som.moeda();
      } else if (d.tipo === 'perigo' && est.inv <= 0) {
        RL.danificar(s, a, d.dano * 1.9 ** est.faixa);
        const fraco = s.casco < a.casco * 0.35;
        falar(fraco ? 'casco' : RL.Personagens.FALAS['bater_' + o.nome] ? 'bater_' + o.nome : 'bater', true);
        est.travaT = 0.07;
        s.batidas = (s.batidas || 0) + 1;
        s.combo = 0;
        s.v *= 0.93;
        o.bateu = true;
        est.inv = 1.2;
        est.tremor = 0.5;
        est.flash = 0.12;
        est.humor = 'dor';
        est.humorT = 1.2;
        molaTheta.v += (o.x > est.x ? -1 : 1) * 9;
        molaEsc.x = 0.8;
        RL.Som.batida();
        const yf = yFoguete();
        const mx = (o.x + est.x) / 2, my = (o.y + yf) / 2;
        fx.pow(mx, my, BATIDAS[(Math.random() * BATIDAS.length) | 0]);
        fx.faisca(mx, my, 12, '#F0CF62', 340);
      }
    }

    let dtGlobal = 0.016;
    function checarMarcos() {
      for (const m of RL.MARCOS) {
        if (est.ultimoH < m.km && s.h >= m.km && !est.marcosVistos.has(m.km)) {
          est.marcosVistos.add(m.km);
          aviso(m.nome, m.fato + (m.premio ? ` +${fmt(m.premio)}` : ''), 'marco');
          RL.Som.marco();
          fx.anel(est.x, yFoguete() - 30, 240, '#F0CF62');
          festa(10);
          falar(RL.Personagens.FALAS['marco_' + m.km] ? 'marco_' + m.km : 'marco', true);
          est.humor = 'feliz';
          est.humorT = 1.6;
        }
      }
      /* capítulo novo, só na primeira vez: é a sensação de ter chegado a outro lugar */
      const cap = RL.capituloDe(s.h);
      if (!s.queda && !est.pouso && cap.i > est.capVisto) {
        est.capVisto = cap.i;
        jogo.capitulo = Math.max(jogo.capitulo || 0, cap.i);
        faixaGrande('CAPÍTULO ' + (cap.i + 1), cap.nome, 'dourada');
        RL.Som.salto();
        festa(20);
      }
      /* dois quilômetros que não estão no mapa */
      for (const q of [{ km: 42, t: 'Quilômetro 42', x: 'A resposta ficava aqui. Alguém levou. A pergunta ficou em casa.' }, { km: 1969, t: 'Quilômetro 1.969', x: 'Tem uma bota boiando aqui. Alguém passou com pressa.' }]) {
        if (!s.queda && s.h >= q.km && est.ultimoH < q.km && !est.marcaSecreta.has(q.km)) {
          est.marcaSecreta.add(q.km);
          aviso(q.t, q.x, 'absurdo');
          RL.Som.marco();
        }
      }
      /* passou do próprio recorde: é o melhor momento de qualquer voo */
      if (!est.recordeBateu && jogo.recorde > 0.2 && s.h > jogo.recorde && !s.queda) {
        est.recordeBateu = true;
        faixaGrande('NOVO RECORDE!', RL.fmtKm(jogo.recorde) + ' km ficaram para trás', 'vermelha');
        RL.Som.recorde();
        festa(34);
        est.tremor = Math.max(est.tremor, 0.3);
        est.humor = 'feliz';
        est.humorT = 2.4;
        falar('recorde', true);
      }
      /* velocidades reais ultrapassadas */
      while (est.velIdx < RL.VELOCIDADES.length && s.v >= RL.VELOCIDADES[est.velIdx].kms) {
        const q = RL.VELOCIDADES[est.velIdx++];
        if (q.som && s.h < 100) {
          /* estrondo sônico */
          const yf = yFoguete();
          fx.anel(est.x, yf, 300, '#FFFDF2');
          fx.anel(est.x, yf, 190, '#FFFDF2');
          fx.pow(est.x + 90, yf - 40, 'BUM!', '#F4F1E4');
          est.tremor = Math.max(est.tremor, 0.45);
          RL.Som.bum();
          faixaGrande('BARREIRA DO SOM', 'Agora ninguém te ouve chegando');
        } else {
          hud.compara.classList.remove('bate');
          void hud.compara.offsetWidth;
          hud.compara.classList.add('bate');
          RL.Som.clique();
        }
      }
      const f = RL.indiceFaixa(s.h);
      if (f !== est.faixa) {
        est.faixa = f;
        dica('Agora: ' + RL.FAIXAS[f].nome);
      }
      est.ultimoH = s.h;
      if (est.estagioVisto !== s.estagio) {
        efeitoSoltar(est.estagioVisto);
        est.estagioVisto = s.estagio;
      }
      est.kick += (0 - est.kick) * Math.min(1, dtGlobal * 4);
      if (Math.floor(est.rel * 2) !== Math.floor((est.rel - 0.02) * 2)) {
        for (const c of jogo.contratos) {
          if (!est.feitos.has(c) && RL.contratoCumprido(c, s, a)) {
            est.feitos.add(c);
            dica(`Contrato cumprido: ${c.de}. +${fmt(c.premio)} no fim do voo.`);
            RL.Som.compra();
          }
        }
      }
    }

    function dicas() {
      if (jogo.dicas.primeiroVoo) return;
      const t = s.t;
      if (est.dica === 0 && t > 0.3) {
        dica(est.modo === 'mouse' ? 'O foguete segue o cursor. Desvie e pegue moedas.' : 'Use A e D, as setas ou o mouse para mexer. Pegue moedas em sequência para fazer combo.');
        est.dica = 1;
      }
      if (est.dica === 1 && t > 7) {
        dica('Clique esquerdo, seta para cima ou W: motores auxiliares. Não gastam combustível, só a barra de turbo.');
        est.dica = 2;
      }
      if (est.dica === 2 && t > 14) {
        dica('Lá no espaço tem lixo e meteoro: passar raspando também paga, e a tecla F liga o escudo.');
        est.dica = 3;
        jogo.dicas.primeiroVoo = true;
      }
    }

    /* Linha de chegada no céu: o próximo marco e o recorde vêm descendo até o foguete. */
    function atualizarLinhas() {
      if (s.queda || est.pouso) {
        est.linhas = [];
        return;
      }
      const yf = yFoguete();
      const velTela = Math.max(est.vs, 60);
      const alvos = [];
      const m = RL.MARCOS.find((q) => q.km > s.h);
      if (m) alvos.push({ km: m.km, nome: m.nome, rec: false });
      if (jogo.recorde > s.h && jogo.recorde > 0.2) alvos.push({ km: jogo.recorde, nome: 'Seu recorde', rec: true });
      for (const q of alvos) {
        const chave = q.km + (q.rec ? 'r' : '');
        if (est.linhaFeita.has(chave) || s.v <= 0.01) continue;
        const px = ((q.km - s.h) / s.v) * velTela;
        if (px < yf + 40) {
          est.linhaFeita.add(chave);
          est.linhas.push({ ...q, y: yf - px, passou: false });
        }
      }
      for (const l of est.linhas) {
        if (!l.passou && s.v > 0.01 && s.h < l.km) l.y = yf - ((l.km - s.h) / s.v) * velTela;
        else {
          l.passou = true;
          l.y += velTela * dtGlobal;
        }
      }
      est.linhas = est.linhas.filter((l) => l.y < H + 40);
    }

    function pintarLinhas() {
      ctx.save();
      for (const l of est.linhas) {
        const cor = l.rec ? '#E8604C' : '#F0CF62';
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = 'rgba(35,28,20,.65)';
        ctx.lineWidth = 7;
        ctx.setLineDash([26, 15]);
        ctx.beginPath();
        ctx.moveTo(0, l.y);
        ctx.lineTo(W, l.y);
        ctx.stroke();
        ctx.strokeStyle = cor;
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.setLineDash([]);
        const texto = `${l.nome} · ${RL.fmtKm(l.km)} km`;
        ctx.font = "400 24px 'Lilita One',sans-serif";
        const tw = ctx.measureText(texto).width + 28;
        const lx = est.x < W / 2 ? W * 0.72 : W * 0.28;
        ctx.fillStyle = cor;
        ctx.strokeStyle = '#33281F';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(lx - tw / 2, l.y - 19, tw, 38, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#33281F';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texto, lx, l.y + 1);
      }
      ctx.restore();
    }

    /* Triângulo na borda de cima: tem coisa vindo aí. */
    function pintarAvisosPerigo() {
      if (s.queda || est.fator > 1) return;
      ctx.save();
      for (const o of est.obj) {
        if (RL.OBJ[o.nome].tipo !== 'perigo' || o.y > -10 || o.muro) continue;
        const x = limitar(o.x, 30, W - 30);
        const piscar = Math.floor(est.rel * 10) % 2 ? 1 : 0.65;
        ctx.globalAlpha = piscar;
        ctx.fillStyle = '#C8513F';
        ctx.strokeStyle = '#33281F';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, 42);
        ctx.lineTo(x - 17, 12);
        ctx.lineTo(x + 17, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFDF2';
        ctx.font = "400 19px 'Lilita One',sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', x, 24);
      }
      ctx.restore();
    }

    function fumacaDecolagem(dt) {
      const L = LL(0);
      const base = yFoguete() + (L.altura * escalaFoguete()) / 2 + est.scroll;
      est.particula -= dt;
      if (est.particula > 0) return;
      est.particula = 0.03;
      for (const lado of [-1, 1]) {
        fx.puff(est.x + lado * rnd(0, 40), base + rnd(-6, 12), { r: rnd(16, 28), r1: rnd(34, 60), vx: lado * rnd(70, 300), vy: rnd(-26, 8), vida: rnd(0.9, 1.7), atrito: 1.1, arrasto: 1 });
      }
    }

    /* O motor apagou e a velocidade acabou: o foguete vira e vem caindo. */
    function comecarQueda() {
      s.hMax = Math.max(s.hMax || 0, s.h);
      s.queda = { p: 0, T: (16 + 3.2 * Math.log10(1 + s.hMax)) * (1 + a.queda) };
      est.fator = 1;
      est.evento = null;
      est.obj = est.obj.filter((o) => RL.OBJ[o.nome].tipo === 'decor');
      est.scroll += 200000;
      est.proxGrupo = 60;
      s.combo = 0;
      s.surto = false;
      est.surto = 0;
      est.bolha = 0;
      aviso('Lá vem o chão', 'A descida também paga. Pegue tudo o que der.', 'moedas');
      falar('semComb', true);
      RL.Som.evento();
    }

    function atualizarSalto(dt) {
      if (!est.saltou) return;
      est.abreV += (1 - est.abre) * 150 * dt - est.abreV * 11 * dt;
      est.abre = Math.max(0.1, est.abre + est.abreV * dt);
      est.desce += dt * 1100;
      /* o foguete sem piloto chega antes: estrondo lá embaixo e fumaça subindo */
      if (est.desce > H * 1.4 && !est.explodiuChao) {
        est.explodiuChao = true;
        est.tremor = Math.max(est.tremor, 0.35);
        RL.Som.batida();
        for (let i = 0; i < 9; i++) fx.puff(rnd(W * 0.2, W * 0.8), H + rnd(-10, 40), { r: rnd(18, 30), r1: rnd(50, 90), vx: rnd(-70, 70), vy: rnd(-180, -70), vida: rnd(0.9, 1.5), arrasto: 0, atrito: 0.8, cor: '#8A8378', sombra: '#6E685E' });
      }
    }

    function atualizarQueda(dt) {
      const q = s.queda;
      q.p = Math.min(1, q.p + dt / q.T);
      est.vira = Math.min(1, est.vira + dt * 1.5);
      s.h = s.hMax * (1 - q.p) ** 3;
      s.v = 0;
      if (q.p > 0.72) saltar();
      atualizarSalto(dt);
      if (q.p >= 1) {
        s.h = 0;
        s.fim = 'pousou';
      }
    }

    function atualizar(dtEntrada) {
      /* trava de impacto: a pancada para o mundo por um instante e pesa na mão */
      if (est.travaT > 0) {
        est.travaT -= dtEntrada;
        dtEntrada *= 0.12;
      }
      const dtReal = dtEntrada;
      dtGlobal = dtReal;
      const eAlvo = escalaAlvo();
      est.escSuave = est.escSuave ? est.escSuave + (eAlvo - est.escSuave) * Math.min(1, dtReal * 2.2) : eAlvo;
      est.bolha = Math.max(0, est.bolha - dtReal);
      if (est.surto > 0) {
        est.surto -= dtReal;
        if (est.surto <= 0) s.surto = false;
      }
      est.rel += dtReal;
      est.semMao += dtReal;
      est.inv = Math.max(0, est.inv - dtReal);
      est.tremor = Math.max(0, est.tremor - dtReal);
      est.flash = Math.max(0, est.flash - dtReal);
      if (est.humorT > 0) {
        est.humorT -= dtReal;
        if (est.humorT <= 0) est.humor = null;
      }
      molaEsc.passo(dtReal);
      fx.atualizar(dtReal, est.vs);

      if (est.ignicao > 0) {
        const antes = est.ignicao;
        est.ignicao -= dtReal;
        /* antecipação: o foguete agacha enquanto a contagem corre */
        molaEsc.alvo = 1 - 0.1 * (1 - limitar(est.ignicao / 1.5, 0, 1));
        est.tremor = Math.max(est.tremor, 0.08 * (1 - est.ignicao / 1.5));
        const num = (t) => (t > 1 ? '3' : t > 0.5 ? '2' : t > 0 ? '1' : '');
        if (num(antes) !== num(est.ignicao)) {
          hud.contagem.textContent = num(est.ignicao);
          hud.contagem.classList.remove('entra');
          void hud.contagem.offsetWidth;
          hud.contagem.classList.add('entra');
          RL.Som.clique();
        }
        if (est.ignicao < 0.6) fumacaDecolagem(dtReal);
        if (est.ignicao <= 0) {
          molaEsc.alvo = 1;
          molaEsc.x = 1.24;
          est.tremor = 0.8;
          falar('decolar', true);
          if (jogo.pintura.marcas.length && jogo.dicas.primeiroVoo) {
            const m = RL.MARCA[jogo.pintura.marcas[Math.floor(Math.random() * jogo.pintura.marcas.length)]];
            dica(`Este voo é um oferecimento de ${m.nome}. ${m.slogan}`);
          }
        }
        return;
      }

      const turbo = apertouTurbo();
      est.turboCd = Math.max(0, (est.turboCd || 0) - dtReal);
      if (turboLigado() && !est.turboAntes && s.decolou && est.turboCd <= 0) {
        /* com a barra vazia o turbo liga e desliga a cada quadro: sem intervalo, seriam anéis sem fim */
        est.turboCd = 0.8;
        est.kick = -34;
        est.tremor = Math.max(est.tremor, 0.2);
        fx.anel(est.x, yFoguete() + 60, 130);
        RL.Som.turbo();
      }
      est.turboAntes = turboLigado();
      molaEsc.alvo = (turboLigado() ? 1.07 : 1) + Math.min(1, nivelVel()) * 0.05;
      if (s.apice && !s.queda) comecarQueda();
      /* quem acelerou entra num trecho difícil e volta para 1x */
      if (est.fator > 1 && RL.travaTempo(s.h) && !s.queda) {
        est.fator = 1;
        est.fatorGuardado = 1;
        dica('Aqui não dá para acelerar o tempo.');
      }
      if (!est.pouso && !s.queda && a.kmFim === RL.KM_LUA && s.h >= RL.KM_LUA - 700) comecarPouso();
      lerControle();
      if (RL.MODO_DEV && a.estagios[s.estagio]) {
        s.comb[s.estagio] = a.estagios[s.estagio].combustivel;
        s.casco = a.casco;
      }
      let resto = s.queda || est.pouso ? 0 : dtReal * est.fator;
      if (s.queda) atualizarQueda(dtReal);
      while (resto > 0 && !s.fim) {
        const h = Math.min(resto, 0.08);
        RL.passo(s, a, h, { turbo: turbo && !s.queda, autoSoltar: est.auto && a.autopiloto >= 1, comQueda: true });
        resto -= h;
      }
      if (!s.decolou && s.parado > 4) s.fim = 'semforca';

      if (est.comboT > 0) {
        est.comboT -= dtReal;
        if (est.comboT <= 0) s.combo = 0;
      }

      if (est.fator > 1 && s.decolou) {
        s.moedas += RL.valorMoeda(s.h, a) * 0.5 * dtReal * est.fator;
      }

      const vi = s.v * 1000;
      if (est.pouso) atualizarPouso(dtReal);
      const alvoVs = s.v <= 0 || est.pouso ? 0 : limitar(110 + 335 * Math.log10(1 + vi / 20), 0, 2800) * (turboLigado() ? 1.45 : 1);
      est.vs += (alvoVs - est.vs) * Math.min(1, dtReal * 3.5);
      if (!s.decolou) est.vs = 0;
      if (s.queda) est.vs = est.saltou ? 240 : Math.min(800, 300 + est.vira * 500);
      if (est.fator > 1) est.vs = Math.min(3600, alvoVs * (1 + Math.log10(est.fator) * 0.6));
      est.scroll += (s.queda ? -1 : 1) * est.vs * dtReal;
      /* o céu de longe anda devagar; no espaço, quase parado. Quem corre é o que está perto. */
      est.fundoY += (s.queda ? -1 : 1) * est.vs * dtReal * lerp(0.5, 0.1, limitar(s.h / 300, 0, 1));
      if (gpu) {
        /* as três nuvens da GPU rolam em velocidades diferentes; acima delas a conta volta a zero */
        const dy = ((s.queda ? -1 : 1) * est.vs * dtReal) / Math.max(H, 1);
        if (s.h > 150) est.nuvemY.fill(0);
        else { est.nuvemY[0] += dy * 0.25; est.nuvemY[1] += dy * 0.55; est.nuvemY[2] += dy * 1.3; }
        est.tempK += ((est.zonaId === 'tempestade' ? 1 : 0) - est.tempK) * Math.min(1, dtReal * 1.5);
      }
      est.olhaFrente += (nivelVel() - est.olhaFrente) * Math.min(1, dtReal * 1.2);
      est.torre = Math.min(1, est.torre + dtReal * 0.8);

      if (s.queda) { /* sem motor, sem fumaça */ } else if (est.scroll < 700 && s.decolou) fumacaDecolagem(dtReal);
      else if (s.decolou) soltarRastro(dtReal, turbo);

      pilotar(dtReal);

      atualizarZona(dtReal);
      if (est.vs > 10 && est.fator === 1 && !est.pouso) {
        est.proxGrupo -= Math.min(est.vs, 900) * dtReal * (est.surto > 0 ? 2.4 : 1);
        if (est.proxGrupo <= 0) {
          if (est.surto > 0) {
            fileiraMoedas();
            est.proxGrupo = rnd(260, 400);
          } else grupo();
        }
      }
      if (Math.floor(est.rel * 12) !== Math.floor((est.rel - dtReal) * 12)) {
        for (const o of est.obj) {
          if (o.nome === 'meteoro') fx.puff(o.x + rnd(-8, 8), o.y - 22 * est.cam, { r: rnd(5, 9) * est.cam, r1: rnd(12, 20) * est.cam, vy: -40, vx: rnd(-20, 20), vida: 0.7, cor: '#E8A04A', sombra: '#C87A30', arrasto: 0.9 });
          else if (o.nome === 'aviao' || o.nome === 'faixa') fx.puff(o.x - Math.sign(o.vx || 1) * 100 * est.cam, o.y, { r: 3 * est.cam, r1: 9 * est.cam, vx: -o.vx * 0.2, vida: 0.8, arrasto: 0.95 });
          else if (o.nome === 'dirigivel' && Math.random() < 0.3) fx.puff(o.x + 200 * est.cam, o.y, { r: 3, r1: 11, vx: 30, vida: 0.9, arrasto: 0.28 });
          else if (o.nome === 'satelite' && Math.random() < 0.08) fx.faisca(o.x, o.y, 3, '#BFE3E6', 120);
        }
      }
      for (const o of est.obj) {
        o.y += (s.queda ? -est.vs : Math.min(est.vs, 900) + o.vy) * (RL.OBJ[o.nome].tipo === 'decor' ? 0.34 : 1) * dtReal;
        o.x += o.vx * dtReal;
      }
      est.obj = est.obj.filter((o) => o.y < H + 500 && o.y > (s.queda ? -500 : -1400) && o.x > -760 && o.x < W + 760);
      colidir(dtReal);

      for (const n of est.soltos) {
        n.vy += 300 * dtReal;
        n.y += (n.vy + est.vs * 0.7) * dtReal;
        n.x += n.vx * dtReal;
        n.r += n.vr * dtReal;
        n.idade += dtReal;
        /* vai ficando para trás e menor, soltando fumaça e tossindo o resto do fogo */
        n.k = Math.max(0.42, 1 - n.idade * 0.3);
        n.fuma -= dtReal;
        if (n.fuma <= 0) {
          n.fuma = 0.07;
          fx.puff(n.x + rnd(-10, 10), n.y + rnd(-10, 10), { r: rnd(4, 8), r1: rnd(11, 19), vx: rnd(-16, 16), vy: rnd(-30, 10), vida: rnd(0.4, 0.7), cor: '#8A8378', sombra: '#6E685E', arrasto: 0.7 });
        }
      }
      est.soltos = est.soltos.filter((n) => n.y < H + 500);

      if (est.evento && est.rel >= est.evento.fim) terminarEvento();
      if (!est.evento && s.decolou && est.rel >= est.proxEvento && s.h > 0.3 && !est.pouso && !RL.zonaEm(s.h)) comecarEvento();
      mensagens();
      atualizarChat();

      checarMarcos();
      atualizarLinhas();
      dicas();

      /* motor tossindo quando apaga */
      const ligado = RL.ligado(s, a) && !est.pouso;
      if (est.motorAntes && !ligado && s.decolou && !est.pouso) {
        const e = escalaFoguete();
        const L = LL(s.estagio);
        const px = est.x - Math.sin(s.theta) * L.altura * e * 0.5, py = yFoguete() + Math.cos(s.theta) * L.altura * e * 0.5;
        for (let i = 0; i < 7; i++) fx.puff(px + rnd(-14, 14), py + rnd(0, 26), { r: rnd(7, 14), r1: rnd(16, 26), vx: rnd(-40, 40), vy: rnd(10, 70), vida: rnd(0.5, 1), cor: '#6A6660', sombra: '#524E49', arrasto: 0.6 });
        est.humor = 'susto';
        est.humorT = 1;
        if (s.estagio >= a.estagios.length - 1) falar('semComb', true);
      }
      est.motorAntes = ligado;
      if (turboLigado() && !est.turboFalou) {
        est.turboFalou = true;
        falar('turbo');
      }
      if (s.h > 340000 && !est.luaFalou && !s.queda) {
        est.luaFalou = true;
        falar('lua', true);
      }
      est.zoom += (1 - est.zoom) * Math.min(1, dtReal * 1.3);
      /* quanto mais longe de casa, mais a câmera recua */
      const alvoCam = lerp(1, 0.5, limitar(Math.log10(1 + s.h) / Math.log10(1 + RL.KM_LUA), 0, 1)) * (s.h > RL.KM_LUA ? lerp(1, 0.8, limitar(Math.log10(s.h / RL.KM_LUA) / 4, 0, 1)) : 1);
      est.cam += (alvoCam - est.cam) * Math.min(1, dtReal * 0.8);

      RL.Som.motor(turboLigado() ? 0.5 : est.pouso ? (est.pouso.frea ? 0.45 : 0) : ligado ? 0.3 : 0, nivelVel(), est.fator > 1);

      est.salvar += dtReal;
      if (est.salvar > 10) {
        est.salvar = 0;
        aoSalvar(guardar());
      }
    }

    /* ---------- Trechos com regra própria ---------- */
    function levouDanoZona(x, y, frac, texto) {
      if (est.bolha > 0) {
        fx.anel(x, y, 110, '#BFE3E6');
        fx.pow(x, y, 'PLIM!', '#BFE3E6');
        RL.Som.moeda();
        return;
      }
      RL.danificar(s, a, a.casco * frac);
      s.batidas = (s.batidas || 0) + 1;
      s.combo = 0;
      est.inv = Math.max(est.inv, 0.8);
      est.tremor = Math.max(est.tremor, 0.5);
      est.flash = 0.12;
      est.humor = 'dor';
      est.humorT = 1.2;
      molaEsc.x = 0.82;
      RL.Som.batida();
      fx.pow(x, y, texto, '#F0CF62');
      fx.faisca(x, y, 18, '#F0CF62', 380);
    }

    function atualizarZona(dt) {
      const z = s.queda || est.pouso || !s.decolou ? null : RL.zonaEm(s.h);
      const id = z ? z.id : null;
      if (id !== est.zonaId) {
        if (est.zonaId === 'maxq' && !s.queda && s.casco > 0) falar('saiuMaxq', true);
        est.zonaId = id;
        est.hZona = s.h;
        if (z) {
          const chave = 'zona_' + id;
          if (!jogo.vistos[chave]) {
            jogo.vistos[chave] = true;
            aviso(z.nome, z.texto, 'perigo');
            RL.Som.evento();
          } else dica(z.nome);
          falar(id, true);
          est.proxEvento = Math.max(est.proxEvento, est.rel + 25);
        }
      }
      if (!est.pouso) est.alerta = '';
      if (!id) {
        est.rajada = null;
        est.raios = est.raios.filter((r) => r.t > -0.3);
      }
      /* vento: rajadas de lado, mais fortes no trecho dele */
      if (id === 'vento' || id === 'tempestade' || id === 'maxq') {
        est.ventoEm -= dt;
        if (est.ventoEm <= 0 && !est.rajada) {
          est.rajada = { dir: Math.random() < 0.5 ? -1 : 1, t: id === 'vento' ? 1.6 : 1, forca: (id === 'vento' ? 210 : 120) / Math.sqrt(Math.max(a.controle, 0.6)) };
          est.ventoEm = rnd(2.2, 4.2);
        }
        if (est.rajada) {
          est.rajada.t -= dt;
          est.x = limitar(est.x + est.rajada.dir * est.rajada.forca * dt, X_MIN, W - X_MARGEM_DIR);
          /* na pressão máxima a rajada sozinha não entorta o bastante para dar dano: o erro é do piloto */
          s.theta = limitar(s.theta + est.rajada.dir * (id === 'maxq' ? 0.2 : 0.42) * dt, -1.1, 1.1);
          if (est.rajada.t <= 0) est.rajada = null;
        }
      }
      /* tempestade: a coluna acende e o raio cai depois */
      if (id === 'tempestade') {
        est.raioEm -= dt;
        if (est.raioEm <= 0) {
          est.raioEm = rnd(1.5, 2.8);
          est.raios.push({ x: limitar(est.x + rnd(-170, 170), 60, W - 60), t: 1.05 });
        }
      }
      for (const r of est.raios) {
        const antes = r.t;
        r.t -= dt;
        if (antes > 0 && r.t <= 0) {
          est.flash = Math.max(est.flash, 0.08);
          RL.Som.bum();
          fx.pow(r.x, H * 0.72, 'CRAC!', '#F0CF62');
          const yf = yFoguete();
          if (Math.abs(r.x - est.x) < 46 * escalaFoguete() + 22) {
            s.raios = (s.raios || 0) + 1;
            if (s.casco - a.casco * 0.14 * (1 - a.reducao) <= 0 && est.bolha <= 0) s.causa = 'tempestade';
            levouDanoZona(est.x, yf - 60, 0.14, 'ZAP!');
            falar('raio', true);
          }
        }
      }
      est.raios = est.raios.filter((r) => r.t > -0.2);
      /* pressão máxima: torto, o ar arranca casco */
      if (id === 'maxq' && Math.abs(s.theta) > 0.3) {
        est.alerta = 'NARIZ RETO!';
        if (est.bolha <= 0) {
          const antesC = s.casco;
          RL.danificar(s, a, a.casco * 0.09 * limitar(Math.abs(s.theta) / 0.5, 0.6, 1.8) * dt);
          if (s.casco <= 0 && antesC > 0) s.causa = 'maxq';
          if (!s.apertou) falar('apertou', true);
          s.apertou = true;
          est.tremor = Math.max(est.tremor, 0.22);
        }
      }
      /* radiação: o dano acompanha a distância, e não o tempo */
      if (id === 'radiacao') {
        const km = Math.max(0, s.h - est.hZona);
        est.hZona = s.h;
        est.alerta = est.bolha > 0 ? 'ESCUDO SEGURANDO' : 'RADIAÇÃO';
        if (est.bolha <= 0 && km > 0) {
          const antesC = s.casco;
          RL.danificar(s, a, a.casco * 0.55 * (km / (6371 - 1000)));
          if (s.casco <= 0 && antesC > 0) s.causa = 'radiacao';
        }
      }
      /* muralha: fileira de satélites com uma brecha que anda aos poucos */
      if (id === 'muralha') {
        est.muralhaEm -= dt;
        if (est.muralhaEm <= 0) {
          est.muralhaEm = 2.3;
          const zo = RL.zoomObjeto('satelite', escalaFoguete());
          const passo = 200 * zo;
          est.brecha = limitar(est.brecha + rnd(-0.28, 0.28), 0.15, 0.8);
          const meio = est.brecha * W, largura = Math.max(170, 130 + 150 * escalaFoguete());
          for (let x = passo / 2; x < W + passo; x += passo) {
            if (Math.abs(x - meio) > largura) novoObj('satelite', x, -160, { vx: 0, k: 0.8, gira: 0, muro: true });
          }
        }
      }
    }

    function comecarPouso() {
      const P = RL.POUSO;
      est.pouso = { alt: P.alt, v: P.v, reserva: 1, frea: false, t: 0, y0: yFoguete(), alvo: rnd(W * 0.32, W * 0.62), nota: null };
      est.fator = 1;
      est.evento = null;
      est.obj = [];
      est.proxEvento = 1e12;
      est.linhas = [];
      s.theta = 0;
      est.proxGrupo = 1e9;
      est.alerta = '';
      aviso('Pouso!', a.autopiloto >= 1 && est.auto ? 'O autopiloto freia em cima da hora. Para um pouso perfeito, segure o turbo você.' : 'Segure o turbo para frear, na hora certa. O tatu está esperando lá embaixo.', 'perigo');
      falar('pouso', true);
      RL.Som.evento();
    }

    function atualizarPouso(dt) {
      const p = est.pouso;
      p.t += dt;
      if (p.nota) return;
      const manual = apertouTurbo();
      if (manual) est.auto = false;
      const freia = manual || (est.auto && a.autopiloto >= 1 && RL.pousoDeveFrear(p));
      RL.passoPouso(p, freia, dt);
      s.v = p.v / 1000;
      s.h = RL.KM_LUA - (p.alt / RL.POUSO.alt) * 300;
      s.t += dt;
      if (p.frea) {
        est.tremor = Math.max(est.tremor, 0.12);
        const yf = yFoguete() + (LL(s.estagio).altura * escalaFoguete()) / 2;
        if (p.alt < 160) fx.puff(est.x + rnd(-50, 50), H * 0.82 + rnd(-5, 12), { r: rnd(10, 18), r1: rnd(24, 44), vx: rnd(-180, 180), vy: rnd(-40, 0), vida: 0.7, arrasto: 0, atrito: 1.4, cor: '#C9C4B6', sombra: '#A29C8E' });
        else if (Math.random() < 0.4) fx.puff(est.x + rnd(-10, 10), yf + 30, { r: 6, r1: 16, vy: 60, vida: 0.5 });
      }
      est.alerta = `${fmt(p.alt)} m · ${fmt(p.v)} m/s`;
      est.alertaBom = p.v <= RL.POUSO.bom;
      if (p.nota) {
        const perto = Math.abs(est.x - p.alvo) < 130;
        s.pousoNota = p.nota;
        s.ganhosEvento += Math.ceil(RL.pagamentoDistancia(RL.KM_LUA, a) * RL.premioPouso[p.nota] * (perto ? 1.5 : 1));
        s.h = RL.KM_LUA;
        s.v = 0;
        s.fim = 'lua';
        est.alerta = '';
        est.tremor = p.nota === 'duro' ? 1 : p.nota === 'bom' ? 0.45 : 0.15;
        RL.Som[p.nota === 'duro' ? 'explosao' : 'recorde']();
        faixaGrande(p.nota === 'perfeito' ? 'POUSO PERFEITO' : p.nota === 'bom' ? 'POUSOU' : 'CHEGOU. MAIS OU MENOS.', perto ? 'Bem do lado do tatu' : 'Longe do tatu, o que é uma vantagem', p.nota === 'duro' ? 'vermelha' : 'dourada');
        falar('pouso_' + p.nota, true);
        for (let i = 0; i < (p.nota === 'duro' ? 26 : 12); i++) fx.puff(est.x + rnd(-90, 90), H * 0.82 + rnd(-8, 12), { r: rnd(10, 20), r1: rnd(26, 56), vx: rnd(-240, 240), vy: rnd(-90, 5), vida: rnd(0.7, 1.3), arrasto: 0, atrito: 1.3, cor: '#C9C4B6', sombra: '#A29C8E' });
      }
    }

    /* Controle de videogame: padrão do navegador, serve para Xbox e Steam Deck. */
    function lerControle() {
      const lista = navigator.getGamepads ? navigator.getGamepads() : [];
      const g = lista && [...lista].find(Boolean);
      if (!g) {
        est.pad.x = 0;
        est.pad.turbo = false;
        return;
      }
      est.pad.x = Math.abs(g.axes[0] || 0) > 0.2 ? g.axes[0] : 0;
      const b = (i) => !!(g.buttons[i] && g.buttons[i].pressed);
      est.pad.turbo = b(0) || b(7);
      const borda = (i, fn) => {
        if (b(i) && !est.pad.antes[i]) fn();
        est.pad.antes[i] = b(i);
      };
      borda(1, soltar);
      borda(2, ligarBolha);
      borda(3, alternarAuto);
      borda(5, proximoTempo);
    }

    function pintarZona() {
      const id = est.zonaId;
      if (id === 'tempestade') {
        ctx.fillStyle = 'rgba(38,42,68,.42)';
        ctx.fillRect(-20, -20, W + 40, H + 40);
      }
      if (id === 'radiacao') {
        const p = 0.1 + Math.abs(Math.sin(est.rel * 1.7)) * 0.08;
        ctx.fillStyle = est.bolha > 0 ? 'rgba(120,200,220,.08)' : `rgba(120,200,70,${p})`;
        ctx.fillRect(-20, -20, W + 40, H + 40);
      }
      if (est.rajada && !calmo()) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,253,242,.6)';
        ctx.lineCap = 'round';
        for (let i = 0; i < 16; i++) {
          const y = (i * 137 + est.rel * 90) % H;
          const x = ((i * 271 + est.rel * 900 * est.rajada.dir) % (W + 300) + W + 300) % (W + 300) - 150;
          ctx.lineWidth = 1.2 + (i % 3);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 70 + (i % 5) * 26, y + (i % 2 ? 3 : -3));
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    function pintarRaios() {
      for (const r of est.raios) {
        ctx.save();
        if (r.t > 0) {
          /* a coluna avisa onde vai cair */
          const k = 1 - r.t / 1.05;
          ctx.globalAlpha = 0.24 + k * 0.42 + (Math.floor(est.rel * 14) % 2 ? 0.08 : 0);
          ctx.fillStyle = '#F0CF62';
          ctx.fillRect(r.x - 46, 0, 92, H);
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#C8513F';
          ctx.strokeStyle = '#33281F';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(r.x, 46);
          ctx.lineTo(r.x - 17, 16);
          ctx.lineTo(r.x + 17, 16);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#FFFDF2';
          ctx.font = "400 19px 'Lilita One',sans-serif";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', r.x, 28);
        } else {
          /* traço grosso de tinta, igual ao resto do jogo */
          const trilha = [[r.x + 18, -10], [r.x - 28, H * 0.2], [r.x + 22, H * 0.34], [r.x - 22, H * 0.55], [r.x + 26, H * 0.68], [r.x - 6, H + 10]];
          const lado = (c, l) => {
            ctx.strokeStyle = c;
            ctx.lineWidth = l;
            ctx.lineJoin = 'miter';
            ctx.beginPath();
            trilha.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            ctx.stroke();
          };
          lado('#33281F', 22);
          lado('#F0CF62', 14);
          lado('#FFFDF2', 5);
        }
        ctx.restore();
      }
    }

    function pintarSoloPouso() {
      const p = est.pouso;
      /* a pintura é maior que a tela: descendo, ela corre de cima para baixo, sem emenda */
      const k = p.alt / RL.POUSO.alt;
      const img = RL.Pintura.soloLua();
      const eImg = (Math.max(W / img.width, H / img.height)) * 1.42;
      const wI = img.width * eImg, hI = img.height * eImg;
      ctx.drawImage(img, (W - wI) / 2, (H - hI) * (1 - k), wI, hI);
      const chao = H * 0.82 + (hI - H) * k;
      const P = RL.Personagens;
      if (chao < H + 70) P.tatu(ctx, p.alvo, chao + 4, Math.min(1.05, H / 620), { t: est.rel, vira: est.x < p.alvo ? true : false, falando: !!p.nota });
      if (p.nota) P.balao(ctx, p.alvo, chao - 92, 'Eu avisei. Vim de ônibus. Você abre às 8.', W, { larg: 240 });
    }

    function soltarRastro(dt, turbo) {
      if (!RL.ligado(s, a) && !turboLigado()) return;
      est.particula -= dt * (turbo ? 2 : 1);
      if (est.particula > 0) return;
      const tipo = jogo.pintura.rastro;
      est.particula = tipo === 'fumaca' ? 0.05 : 0.032;
      const esc = escalaFoguete();
      const L = LL(s.estagio);
      const yf = yFoguete() + Math.cos(s.theta) * L.altura * esc * 0.5 + 26 * esc;
      const xf = est.x - Math.sin(s.theta) * (L.altura * esc * 0.5 + 26 * esc);
      if (tipo === 'fumaca') {
        fx.puff(xf + rnd(-8, 8), yf, { r: rnd(5, 9) * Math.max(0.7, esc), r1: rnd(12, 22) * Math.max(0.7, esc), vx: rnd(-16, 16), vy: rnd(10, 40), vida: rnd(0.5, 0.95), arrasto: 0.75 });
        return;
      }
      const cores = { fogo: ['#E08A3C', '#F0CF62', '#C8513F'], arcoiris: ['#C8513F', '#E0B23C', '#7A9B4E', '#5E93A8', '#8E6AA8'], bolhas: ['#BFE3E6'], estrelas: ['#F0CF62'], confete: ['#C8513F', '#E0B23C', '#3F8F87', '#8E6AA8', '#F4F1E4'] }[tipo] || ['#E08A3C'];
      const cor = tipo === 'fogo' && Math.random() < 0.5 ? jogo.pintura.corRastro : cores[(Math.random() * cores.length) | 0];
      fx.rastro(xf + rnd(-8, 8), yf, tipo, cor, Math.max(0.7, esc));
    }

    function explodir() {
      est.explodiu = true;
      const yf = yFoguete();
      const cores = ['#C8513F', '#EEE9D7', '#5E93A8', '#E0B23C', '#9AA3A6'];
      for (let i = 0; i < 26; i++) fx.puff(est.x + rnd(-44, 44), yf + rnd(-70, 70), { r: rnd(16, 34), r1: rnd(36, 72), vx: rnd(-170, 170), vy: rnd(-170, 120), vida: rnd(0.8, 1.6), atrito: 1.4, arrasto: 0, cor: ['#E08A3C', '#F0CF62', '#C8513F', '#6A6660'][(Math.random() * 4) | 0], sombra: 'rgba(32,22,44,.2)' });
      for (let i = 0; i < 22; i++) fx.caco(est.x + rnd(-24, 24), yf + rnd(-60, 60), cores[(Math.random() * cores.length) | 0]);
      fx.anel(est.x, yf, 260);
      fx.faisca(est.x, yf, 34, '#F0CF62', 560);
      fx.pow(est.x, yf - 40, 'KABUM!', '#F0CF62');
      fx.capiVoa(est.x, yf);
      est.flash = 0.16;
      est.tremor = 1;
    }

    /* ---------- Desenhar ---------- */
    const nivelVel = () => limitar((Math.log10(1 + Math.max(s.v, 0) * 1000) - 1.6) / 3.6, 0, 1.6) * (est.fator > 1 ? 1.3 : 1);

    /* Estrada de velocidade: riscos em perspectiva saem de um ponto à frente do foguete e abrem
       para as bordas. Foguete fraco quase não faz risco; foguete bom faz a tela inteira correr. */
    const riscos = Array.from({ length: 150 }, (_, i) => ({ x: (((i * 0.618) % 1) - 0.5) * 2, y: 0.08 + ((i * 0.371) % 1) * 0.92, z: 0.1 + ((i * 0.77) % 1) * 0.9, l: 0.6 + ((i * 0.29) % 1) * 0.9 }));
    function pintarVelocidade() {
      if (calmo()) return;
      const turboAgora = turboLigado();
      const k = est.fator > 1 ? 1.25 : limitar((est.vs - 300) / 950, 0, 1.25) + (turboAgora ? 0.25 : 0);
      if (k <= 0.02) return;
      const dt = dtGlobal;
      const vx = W / 2 - s.theta * W * 0.16;
      const vy = s.queda ? H * 1.25 : -H * 0.2;
      const dir = s.queda ? -1 : 1;
      const n = Math.min(riscos.length, Math.floor(14 + k * 110));
      const anda = (0.2 + k * 1.15) * dt;
      const estica = 0.015 + k * 0.1;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = s.h > 90 ? '#DDE6F7' : '#FFFDF2';
      for (let i = 0; i < n; i++) {
        const r = riscos[i];
        r.z -= anda;
        if (r.z < 0.1) {
          r.z = 1;
          r.x = (Math.random() - 0.5) * 2;
          r.y = 0.08 + Math.random() * 0.92;
        }
        const z2 = Math.min(1.2, r.z + estica);
        const proj = (z) => [vx + (r.x * W * 0.62) / z, vy + (dir * r.y * H * 0.9) / z];
        const [x1, y1] = proj(r.z), [x2, y2] = proj(z2);
        const perto = 1 - r.z;
        ctx.globalAlpha = Math.min(0.62, (0.1 + k * 0.42) * perto * r.l);
        ctx.lineWidth = (0.8 + perto * 2.6) * r.l;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* Bordas escurecem com a velocidade, como se a visão afunilasse. */
    let vinheta = null, vinhetaW = 0, vinhetaH = 0;
    function pintarVinheta() {
      const turboAgora = turboLigado();
      const alfa = calmo() ? 0 : Math.min(0.75, limitar(est.olhaFrente - 0.2, 0, 1) * 0.5 + (turboAgora ? 0.28 : 0) + (est.surto > 0 ? 0.2 : 0));
      if (alfa <= 0.01) return;
      if (!vinheta || vinhetaW !== W || vinhetaH !== H) {
        vinheta = document.createElement('canvas');
        vinheta.width = W;
        vinheta.height = H;
        const c = vinheta.getContext('2d');
        const g = c.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.42, W / 2, H * 0.55, Math.max(W, H) * 0.72);
        g.addColorStop(0, 'rgba(16,12,28,0)');
        g.addColorStop(1, 'rgba(16,12,28,.85)');
        c.fillStyle = g;
        c.fillRect(0, 0, W, H);
        vinhetaW = W;
        vinhetaH = H;
      }
      ctx.globalAlpha = alfa;
      ctx.drawImage(vinheta, 0, 0);
      ctx.globalAlpha = 1;
    }

    function pintarEstrelas() {
      const alfa = limitar((Math.log10(Math.max(s.h, 1)) - 1.6) / 1.2, 0, 1);
      if (alfa <= 0) return;
      const rastro = est.fator > 1 ? 2.4 : limitar((est.vs - 600) / 900, 0, 1.2) * 1.6;
      ctx.fillStyle = '#F4EFD8';
      ctx.strokeStyle = '#F4EFD8';
      est.estrelas.forEach((cam, c) => {
        const vel = [0.04, 0.09, 0.17][c];
        ctx.globalAlpha = alfa * [0.45, 0.65, 0.9][c];
        for (const e of cam) {
          const yy = (((e.y * (H + 40) + est.scroll * vel) % (H + 40)) + H + 40) % (H + 40) - 20;
          const xx = e.x * W;
          const lin = rastro * vel * 150;
          if (lin > 1.6) {
            ctx.lineWidth = e.r;
            ctx.beginPath();
            ctx.moveTo(xx, yy);
            ctx.lineTo(xx, yy - lin);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(xx, yy, e.r * (0.8 + Math.sin(est.rel * 2 + e.x * 40) * 0.2), 0, 6.283);
            ctx.fill();
          }
        }
      });
      ctx.globalAlpha = 1;
    }

    function pintarFundo() {
      const P = RL.Pintura;
      const faixas = RL.FAIXAS;
      const i = RL.indiceFaixa(s.h);
      const prox = faixas[i + 1];
      const naGPU = usaGPU();
      const m = naGPU ? ctx.getTransform() : null;
      if (naGPU) ceuGPU(m);
      const tile = (id, alfa) => {
        const img = P.faixa(id);
        const e = Math.max(W, H * 0.6) / img.width;
        const h = img.height * e, w = img.width * e;
        const off = (est.fundoY % h + h) % h;
        ctx.globalAlpha = alfa;
        for (let y = off - h; y < H; y += h) ctx.drawImage(img, (W - w) / 2, y, w, h);
        ctx.globalAlpha = 1;
      };
      if (!naGPU) {
        tile(faixas[i].id === 'bairro' ? 'ceu' : faixas[i].id, 1);
        if (prox) {
          const de = prox.de * 0.55;
          const t = limitar((Math.log(Math.max(s.h, 0.01)) - Math.log(de)) / (Math.log(prox.de) - Math.log(de)), 0, 1);
          if (t > 0) tile(prox.id, t);
        }
        pintarEstrelas();
      }

      if (s.h > 30) {
        /* A Terra fica longe e fica para trás: no começo é só a curva lá embaixo, depois vira
           uma bola que encolhe num canto, sem nunca ficar colada no foguete. */
        const rBruto = W * 1.3 * (6371 / (6371 + s.h * 6));
        const r = Math.max(s.h > RL.KM_LUA * 2 ? 0 : 7, rBruto);
        const longe = limitar(Math.log10(s.h / 250) / Math.log10(9000 / 250), 0, 1);
        const g = longe * longe * (3 - 2 * longe);
        const topo = lerp(H * 1.03, H * 0.9, limitar(Math.log10(s.h / 30) / Math.log10(500 / 30), 0, 1));
        /* vai para a direita: à esquerda ficam o retrato e o balão de fala */
        const cx = lerp(W / 2, W * 0.76, g) - (est.x - W / 2) * 0.012;
        const cy = lerp(topo + r, H * 0.72, g);
        const entrada = limitar((s.h - 30) / 140, 0, 1) * lerp(1, 0.82, g);
        if (r > 1 && naGPU) mapear(m, cx, cy, r, gp.terra, entrada);
        if (r > 1) {
          if (!naGPU) {
          ctx.globalAlpha = entrada;
          const halo = ctx.createRadialGradient(cx, cy, r * 0.94, cx, cy, r * 1.14);
          halo.addColorStop(0, 'rgba(205,235,245,.75)');
          halo.addColorStop(0.45, 'rgba(170,220,240,.32)');
          halo.addColorStop(1, 'rgba(170,220,240,0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 1.14, 0, 6.283);
          ctx.fill();
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(s.t * 0.0004);
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(P.terra(), -r, -r, r * 2, r * 2);
          ctx.restore();
          /* névoa pintada na borda: é o que tira a cara de bola colada no céu */
          const nevoa = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r);
          nevoa.addColorStop(0, 'rgba(225,240,245,0)');
          nevoa.addColorStop(0.72, 'rgba(225,240,245,.16)');
          nevoa.addColorStop(1, 'rgba(235,246,250,.72)');
          ctx.fillStyle = nevoa;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, 6.283);
          ctx.fill();
          ctx.globalAlpha = 1;
          }
          if (r < 70 && s.h > 20000) rotuloAstro(cx, cy + r + 18, 'Casa', s.h);
        }
      }
      for (const m of RL.MARCOS) {
        if (!m.planeta || est.pouso) continue;
        const q = s.h / m.km;
        if (q < 0.55 || q > 1.08) continue;
        /* cresce conforme chega e passa por baixo depois */
        const g = limitar((q - 0.55) / 0.45, 0, 1);
        const larg = lerp(W * 0.12, W * 1.5, g ** 3);
        const x = lerp(W * 0.78, W * 0.3, g), y = lerp(H * 0.2, H * 0.34, g) + limitar((q - 1) / 0.08, 0, 1) * H * 1.1;
        ctx.drawImage(P.planeta(m.planeta), x - larg / 2, y - larg / 4, larg, larg / 2);
      }
      if (est.pouso && est.pouso.t >= 1.2) pintarSoloPouso();
      else if (s.h > 40 && s.h < RL.KM_LUA * 1.1) {
        /* A Lua está lá desde cedo, pequenina, e vai crescendo de verdade até encher a tela. */
        const dist = Math.max(Math.abs(RL.KM_LUA - s.h), 1100);
        const r = limitar(1737000 / dist, 4.5, H * 1.6) * (s.fim === 'lua' ? 1 + (2.4 - est.fimT) * 0.15 : 1);
        const f = limitar((r - 40) / (H * 1.6 - 40), 0, 1);
        const x = lerp(W * 0.66, W * 0.5, Math.sqrt(f)), y = lerp(H * 0.17, -H * 0.9, f);
        if (naGPU) mapear(m, x, y, r, gp.lua, limitar((s.h - 40) / 120, 0, 1));
        else {
          ctx.globalAlpha = limitar((s.h - 40) / 120, 0, 1);
          ctx.drawImage(P.lua(), x - r, y - r, r * 2, r * 2);
          ctx.globalAlpha = 1;
        }
        if (r < H * 0.2 && s.h > 300) rotuloAstro(x, y + r + 18, 'Lua', RL.KM_LUA - s.h);
        /* no começo do pouso, o chão aparece aos poucos por cima do disco */
        if (est.pouso) {
          ctx.globalAlpha = limitar(est.pouso.t / 1.2, 0, 1);
          pintarSoloPouso();
          ctx.globalAlpha = 1;
        }
      }
      if (s.h < 90 && !naGPU) nuvens(false);
      /* na queda o chão vem subindo nos últimos segundos, até o pouso */
      const faltam = s.queda ? (1 - s.queda.p) * s.queda.T : 0;
      const chaoQueda = s.queda && est.saltou ? faltam * 240 : 1e9;
      if (s.queda ? chaoQueda < H * 1.4 : est.scroll < H * 1.4) {
        P.cobrir(ctx, P.parqueVoo(), W, H, s.queda ? chaoQueda : est.scroll);
        pintarPlataforma(s.queda ? chaoQueda : null);
      }
    }

    /* ---------- parâmetros da cena WebGPU ---------- */
    const gp = { tempo: 0, ceu: 0, estrelas: 0, est1: 0, est2: 0, rastro: 0, rolar: est.nuvemY, dens: [0, 0, 0], tempestade: 0, fogueteX: 0, lua: [0, 0, 0, 0], terra: [0, 0, 0, 0], giroTerra: 2.1, luaNaFrente: false, lavagem: 0, vinheta: 1 };
    /* altitude (km) -> tom do céu da página: quintal, céu, azul da borda, espaço */
    const CEU_H = [0, 0.5, 2, 12, 40, 100, 400, 2000].map((h) => Math.log10(h + 0.1));
    const CEU_T = [0, 0.03, 0.1, 0.25, 0.33, 0.44, 0.55, 0.62];
    function tomCeu(h) {
      const l = Math.log10(Math.max(h, 0) + 0.1);
      if (l <= CEU_H[0]) return 0;
      for (let k = 1; k < CEU_H.length; k++) if (l < CEU_H[k]) return lerp(CEU_T[k - 1], CEU_T[k], (l - CEU_H[k - 1]) / (CEU_H[k] - CEU_H[k - 1]));
      return CEU_T[CEU_T.length - 1];
    }
    const suave = (a, b, x) => { const k = limitar((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
    function mapear(m, x, y, r, alvo, alfa) {
      alvo[0] = gpu.px(m.a * x + m.c * y + m.e);
      alvo[1] = gpu.py(m.b * x + m.d * y + m.f);
      alvo[2] = gpu.esc(r * Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)));
      alvo[3] = alfa;
    }
    function ceuGPU(m) {
      const h = Math.max(s.h, 0);
      gp.tempo = est.rel;
      gp.ceu = tomCeu(h);
      gp.estrelas = limitar((Math.log10(Math.max(h, 1)) - 1.6) / 1.2, 0, 1);
      gp.est1 = ((est.scroll * 0.05) / Math.max(H, 1) / 0.045) % 4096;
      gp.est2 = ((est.scroll * 0.12) / Math.max(H, 1) / 0.026) % 4096;
      gp.rastro = calmo() ? 0 : ((est.fator > 1 ? 2.4 : limitar((est.vs - 600) / 900, 0, 1.2) * 1.6) * 150) / Math.max(H, 1);
      const tk = est.tempK;
      gp.dens[0] = Math.min(1, suave(0.15, 1.2, h) * suave(70, 25, h) * 0.95 * (1 + 0.1 * tk));
      gp.dens[1] = Math.min(1, suave(0.5, 2, h) * suave(45, 14, h) * 0.9 * (1 + 0.1 * tk));
      gp.dens[2] = suave(1.2, 3, h) * suave(28, 10, h) * 0.6;
      gp.tempestade = tk;
      gp.fogueteX = gpu.px(m.a * est.x + m.c * yFoguete() + m.e);
      gp.lua[3] = 0;
      gp.terra[3] = 0;
      gp.giroTerra = 2.1 + est.rel * 0.015;
      gp.luaNaFrente = h > RL.KM_LUA * 0.5;
      gp.lavagem = (est.fundoY / Math.max(H, 1)) % 2048;
    }
    /* chama pela GPU, no lugar e na escala em que o 2D a pintaria */
    const COR_CHAMA = [0.94, 0.38, 0.16];
    function chamaQ(x, y, w, comp, cor, semente) {
      if (!usaGPU()) return D().chama(ctx, x, y, w, comp, cor, est.rel, semente);
      const m = ctx.getTransform();
      const sx = Math.hypot(m.a, m.b), sy = Math.hypot(m.c, m.d);
      const c = cor === '#E08A3C' ? COR_CHAMA : RL.CenaGPU.cor(cor);
      gpu.chama(m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f, m.c, m.d, (w / 2) * sx, comp * sy, (semente || 0) * 1.7, c, 1);
    }
    /* fumaça em aquarela: a simulação continua a do jogo, só o desenho muda */
    function enviarFumaca() {
      const m = ctx.getTransform();
      const sx = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
      for (const p of fx.lista) {
        if (p.k !== 'puff') continue;
        const k = Math.min(1, p.t / p.vida);
        const cresce = p.r0 + (p.r1 - p.r0) * (1 - (1 - Math.min(1, k * 1.4)) ** 2);
        const al = 0.85 * Math.pow(1 - k, 1.5) * Math.min(1, p.t * 7);
        if (p.sd == null) p.sd = Math.random();
        gpu.fumaca(m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f, cresce * 1.45 * sx, al, p.sd, k, p.cor === '#EFEADA' ? null : RL.CenaGPU.cor(p.cor));
      }
    }

    function rotuloAstro(x, y, nome, km) {
      ctx.save();
      ctx.font = "19px 'Patrick Hand',sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const texto = `${nome} · ${RL.fmtKm(Math.max(km, 0))} km`;
      ctx.globalAlpha = 0.86;
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(16,12,28,.85)';
      ctx.strokeText(texto, x, y);
      ctx.fillStyle = '#F4EFD8';
      ctx.fillText(texto, x, y);
      ctx.restore();
    }

    function nuvens(frente) {
      const alfa = limitar(1 - (s.h - 40) / 50, 0, 1);
      if (est.nuvens.length < 10 && s.h > 0.02) {
        est.nuvens.push({ x: rnd(-120, W), y: -200 - rnd(0, 600), v: rnd(0.3, 0.8), n: (Math.random() * 3) | 0, e: rnd(0.8, 1.7), frente: est.nuvens.length % 3 === 2 });
      }
      ctx.globalAlpha = alfa * (frente ? 0.55 : 0.9);
      for (const n of est.nuvens) {
        if (!!n.frente !== frente) continue;
        n.y += est.vs * (frente ? n.v * 2.5 : n.v * 1.2) * (s.queda ? -1 : 1) * dtGlobal;
        if (s.queda && n.y < -320) n.y = H + rnd(0, 300);
        const img = RL.Pintura.nuvem(n.n);
        ctx.drawImage(img, n.x, n.y, img.width * n.e, img.height * n.e);
        if (n.y > H) {
          n.y = -200 - rnd(0, 300);
          n.x = rnd(-120, W);
        }
      }
      ctx.globalAlpha = 1;
    }

    function pintarPlataforma(deslocado) {
      const L = LL(0);
      const e = escalaFoguete();
      const t = limitar(est.scroll / 500, 0, 1);
      const noChao = Math.min(H * 0.82 - (L.altura * e) / 2, H * 0.72);
      const chao = deslocado != null ? noChao + (L.altura * e) / 2 + deslocado : lerp(yFoguete(), noChao, 1 - t) + (L.altura * e) / 2 + est.scroll;
      const largBase = 42 + 8 * Math.max(0, build.estagios.length - 1);
      ctx.save();
      ctx.translate(W / 2, chao);
      ctx.scale(Math.max(1, Math.min(1.5, e * 1.3)), Math.max(1, Math.min(1.5, e * 1.3)));
      D().plataforma(ctx, largBase, (L.altura * e) / Math.max(1, Math.min(1.5, e * 1.3)), est.torre, est.rel);
      ctx.restore();
    }

    function pintarFoguete() {
      const esc = escalaFoguete();
      const yf = yFoguete();
      const ligado = est.pouso ? est.pouso.frea : RL.ligado(s, a) && est.ignicao <= 0 && !s.queda;
      const turbo = turboLigado();
      const ruido = (ligado || turbo) && !calmo() ? 0.4 + limitar(est.vs / 1400, 0, 1.3) * 1.1 + (turbo ? 0.9 : 0) : 0;
      const op = {
        desde: s.estagio, semPiloto: est.saltou, astronauta: true, humor: est.humor || (turbo ? 'susto' : null), t: est.rel, olhar: est.olhar,
        balanco: Math.sin(est.rel * 11) * ruido * 1.1, pulo: Math.sin(est.rel * 15) * ruido * 0.9,
      };
      const L = LL(s.estagio);
      if (est.desce > H * 1.5) return;
      const larg = molaEsc.x;
      ctx.save();
      ctx.translate(est.x + (ruido ? rnd(-ruido, ruido) : 0), yf + est.desce + est.kick + (ruido ? rnd(-ruido, ruido) : 0));
      /* foguete comprido inclina menos na tela, para o nariz não sair dela */
      const inclinaTela = molaTheta.x * Math.min(1, 300 / Math.max(1, L.altura * esc));
      ctx.rotate(lerp(inclinaTela, 3.14159 - inclinaTela, est.vira * est.vira * (3 - 2 * est.vira)));
      ctx.scale(esc * (2 - larg), esc * larg);
      ctx.translate(0, -L.altura / 2);
      /* depois da pancada ele pisca clareando, sem ficar transparente */
      if (est.inv > 0 && Math.floor(est.rel * 12) % 2 === 0 && 'filter' in ctx) ctx.filter = 'brightness(1.45)';
      if (ligado || (est.ignicao > 0 && est.ignicao < 0.6)) {
        const velo = limitar(est.vs / 1100, 0, 1.2);
        const comp = (58 + velo * 110 + (turbo ? 62 : 0)) * (est.ignicao > 0 ? 0.5 : 1);
        const m = L.slots.find((x) => x.caminho === `e${s.estagio}.motor`);
        const lw = m ? m.w * 0.72 : 36;
        chamaQ(0, L.altura - 1, lw, comp, jogo.pintura.corRastro, 0);
      }
      if (turbo && est.ignicao <= 0) {
        /* os dois motores auxiliares acendem com o turbo, mesmo de tanque vazio */
        const lat = L.slots.find((x) => x.caminho === `e${s.estagio}.lateral`);
        if (lat) {
          const c2 = 74 + Math.sin(est.rel * 37) * 10 + limitar(est.vs / 1100, 0, 1.2) * 70;
          chamaQ(lat.x + lat.w / 2, lat.y + lat.h - 2, 19, c2, jogo.pintura.corRastro, 2);
          chamaQ(-(lat.x + lat.w / 2), lat.y + lat.h - 2, 19, c2, jogo.pintura.corRastro, 4);
        }
      }
      /* onda de choque no nariz, veloz dentro do ar */
      if (!s.queda && (s.v > 0.9)) {
        const k = Math.max(limitar((s.v - 0.9) / 4, 0, 1) * limitar((70 - s.h) / 30, 0, 1), limitar(nivelVel() - 0.65, 0, 1) * 0.8);
        ctx.fillStyle = `rgba(255,220,170,${0.55 * k})`;
        ctx.beginPath();
        ctx.moveTo(0, -26 - Math.sin(est.rel * 40) * 4);
        ctx.quadraticCurveTo(58, 16, 66, 88);
        ctx.quadraticCurveTo(0, 22, -66, 88);
        ctx.quadraticCurveTo(-58, 16, 0, -26 - Math.sin(est.rel * 40) * 4);
        ctx.fill();
      }
      if (!est.explodiu) D().pintarSprite(ctx, build, jogo.pintura, op);
      ctx.filter = 'none';
      if (est.bolha > 0 && !est.explodiu) {
        /* bolha em volta do foguete inteiro; pisca quando está acabando */
        const some = est.bolha < 1 && Math.floor(est.rel * 11) % 2 === 0;
        if (!some) {
          const rx = 86 + Math.sin(est.rel * 9) * 3, ry = L.altura / 2 + 34;
          ctx.save();
          ctx.translate(0, L.altura / 2);
          ctx.fillStyle = 'rgba(191,227,230,.2)';
          ctx.strokeStyle = 'rgba(232,248,250,.95)';
          ctx.lineWidth = 3.5 / esc;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283);
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,.7)';
          ctx.lineWidth = 5 / esc;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.ellipse(0, 0, rx * 0.82, ry * 0.9, 0, 3.5, 4.4);
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();
    }

    /* A capivara salta: o pano abre de repente, passa do ponto e fica balançando. */
    function saltar() {
      if (est.saltou) return;
      est.saltou = true;
      est.abre = 0.1;
      est.abreV = 7;
      falar('saltar', true);
      RL.Som.soltar();
      fx.anel(est.x, yFoguete() - 40, 90);
    }

    function pintarParaquedas() {
      if (!est.saltou) return;
      const f = est.rel * 2;
      const balanca = Math.sin(f) * 0.13 * Math.min(1, est.abre);
      const escala = escalaPara();
      const pes = yFoguete() + 150 * escala;
      ctx.save();
      /* o eixo do balanço é o topo do pano, como um pêndulo */
      /* a piada é ela: nunca atrás da régua da direita nem do painel da esquerda */
      const xP = limitar(est.x, 200 * escala + 40, W - 210 * escala - 90);
      ctx.translate(xP, pes - 320 * escala);
      ctx.rotate(balanca);
      ctx.scale(est.abre * (1 + Math.sin(est.rel * 9) * 0.012), 0.6 + est.abre * 0.4);
      ctx.translate(0, 320 * escala);
      D().capivara(ctx, 0, 0, escala, { pose: 'paraquedas', t: est.rel, astronauta: true });
      ctx.restore();
    }

    function pintarSoltos() {
      for (const n of est.soltos) {
        const parte = { ...build, estagios: [build.estagios[n.estagio]], bico: null, capsula: null, escudo: null, enfeite: null, modulos: [] };
        const L = n.L || (n.L = D().layout(parte, null));
        const esc = escalaFoguete() * n.k;
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(n.r);
        ctx.scale(esc, esc);
        ctx.translate(0, -L.altura / 2);
        D().desenharFoguete(ctx, parte, jogo.pintura && { pecas: {}, adesivos: [], marcas: [] }, {});
        if (n.idade < 0.35) chamaQ(0, L.altura - 2, 22, 18 + Math.sin(est.rel * 40) * 7, '#6A6660', 5);
        ctx.restore();
      }
    }

    function pintar() {
      if (gpu && !gpu.ativa && gpu.frente.style.display !== 'none') gpu.frente.style.display = 'none';
      if (usaGPU()) {
        ctx.clearRect(0, 0, W, H);
        gpu.limpar();
      }
      ctx.save();
      if (est.tremor > 0 && !calmo()) ctx.translate(rnd(-6, 6) * est.tremor, rnd(-6, 6) * est.tremor);
      if (!calmo()) {
        /* câmera: começa fechada na plataforma, abre na subida e acompanha a curva */
        const nv = Math.min(1.2, nivelVel());
        const treme = nv > 0.5 && !s.queda ? (nv - 0.5) * 3.2 * (apertouTurbo() && s.turbo > 0 ? 1.8 : 1) : 0;
        if (treme) ctx.translate(rnd(-treme, treme), rnd(-treme, treme));
        ctx.translate(W / 2, H * 0.7);
        /* parado a câmera fica um pouco mais perto; acelerando, abre até o limite do cenário */
        const zoomV = Math.max(1, est.zoom * (1.07 - nv * 0.055) * (apertouTurbo() && s.turbo > 0 && !s.queda ? 0.975 : 1));
        ctx.scale(zoomV, zoomV);
        ctx.rotate(-molaTheta.x * 0.025);
        ctx.translate(-W / 2, -H * 0.7);
      }
      pintarFundo();
      pintarZona();
      pintarVelocidade();
      pintarLinhas();
      pintarSoltos();
      if (s.h < 90 && !usaGPU()) nuvens(true);
      const estica = 1 + Math.min(0.5, est.vs / 3200);
      const escObj = escalaFoguete();
      const pintaObj = (o) => {
        const zo = RL.zoomObjeto(o.nome, escObj);
        if (RL.OBJ[o.nome].tipo === 'decor') {
          /* ao longe, o ar apaga um pouco as cores */
          ctx.globalAlpha = s.h < 100 ? 0.92 : 1;
          RL.pintarObjeto(ctx, o, est.rel, zo);
          ctx.globalAlpha = 1;
          return;
        }
        if (RL.OBJ[o.nome].tipo === 'moeda') {
          RL.pintarObjeto(ctx, o, est.rel, zo);
          return;
        }
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.scale(1 / Math.sqrt(estica), estica);
        ctx.translate(-o.x, -o.y);
        RL.pintarObjeto(ctx, o, est.rel, zo);
        ctx.restore();
      };
      for (const o of est.obj) if (RL.OBJ[o.nome].tipo === 'decor' && o.nome === 'passaro') pintaObj(o);
      for (const o of est.obj) if (RL.OBJ[o.nome].tipo === 'decor' && o.nome !== 'passaro') pintaObj(o);
      for (const o of est.obj) if (RL.OBJ[o.nome].tipo !== 'decor') pintaObj(o);
      pintarRaios();
      fx.semPuff = usaGPU();
      if (fx.semPuff) enviarFumaca();
      fx.pintar(ctx, est.rel);
      if (est.fimT <= 0 || s.fim !== 'casco') pintarFoguete();
      pintarParaquedas();
      pintarAvisosPerigo();
      pintarVinheta();
      ctx.textAlign = 'center';
      ctx.font = "400 22px 'Lilita One',sans-serif";
      for (const t of est.textos) {
        t.idade += dtGlobal;
        ctx.globalAlpha = Math.max(0, 1 - t.idade * t.idade);
        ctx.fillStyle = t.cor;
        ctx.strokeStyle = '#33281F';
        ctx.lineWidth = 3;
        const sobe = t.y - (1 - (1 - t.idade) ** 3) * 46;
        const salta = t.pulo ? 1 + t.pulo * 0.22 : 1;
        if (t.pulo) t.pulo = Math.max(0, t.pulo - dtGlobal * 5.4);
        ctx.save();
        ctx.translate(t.x, sobe);
        ctx.scale(salta, salta);
        ctx.strokeText(t.texto, 0, 0);
        ctx.fillText(t.texto, 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      est.textos = est.textos.filter((t) => t.idade < 1);
      if (est.textos.length > 30) est.textos.splice(0, est.textos.length - 30);
      if (est.flash > 0 && !calmo()) {
        ctx.globalAlpha = 0.5 * (est.flash / 0.16);
        ctx.fillStyle = '#FFF8DC';
        ctx.fillRect(-20, -20, W + 40, H + 40);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      if (usaGPU()) gpu.desenhar(gp);
    }

    function pintarPainel() {
      const e = a.estagios[s.estagio];
      hud.km.textContent = RL.fmtKm(s.queda ? s.h : s.h) + ' KM';
      hud.vel.textContent = s.queda ? 'Caindo!' : s.v < 1 ? fmt(Math.max(s.v, 0) * 3600) + ' km/h' : fmt(s.v, 1) + ' km/s';
      const totalM = s.moedas + s.ganhosEvento + (s.ganhoTriz || 0) + (s.ganhoCaixas || 0);
      est.moedasVistas = (est.moedasVistas || 0) + (totalM - (est.moedasVistas || 0)) * 0.22;
      hud.moedas.textContent = fmt(Math.round(est.moedasVistas));
      /* no pouso, a barra de combustível vira a reserva do freio */
      const pc = est.pouso ? est.pouso.reserva : e && e.combustivel ? s.comb[s.estagio] / e.combustivel : 0;
      hud.barraComb.style.transform = `scaleX(${pc})`;
      hud.barraComb.parentElement.classList.toggle('alerta', pc < 0.2 && pc > 0);
      const pcasco = s.casco / a.casco;
      hud.barraCasco.style.transform = `scaleX(${pcasco})`;
      hud.barraCasco.parentElement.classList.toggle('alerta', pcasco < 0.3);
      hud.barraTurbo.style.transform = `scaleX(${s.turbo})`;
      hud.est.textContent = a.estagios.length > 1 ? `Estágio ${s.estagio + 1} de ${a.estagios.length}` : '';
      const m = RL.multCombo(s.combo || 0);
      hud.combo.textContent = m > 1 ? `x${m}` : '';
      hud.combo.hidden = !(m > 1);
      hud.comboBarra.style.transform = `scaleX(${limitar(est.comboT / 2.2, 0, 1)})`;
      const p = Math.log10(1 + s.h) / Math.log10(1 + (a.kmFim || RL.KM_LUA));
      hud.pos.style.bottom = p * 100 + '%';
      hud.bBolha.querySelector('b').textContent = est.bolha > 0 ? Math.ceil(est.bolha) + 's' : jogo.bolhas.qtd;
      hud.bBolha.disabled = est.bolha > 0 || jogo.bolhas.qtd <= 0 || !!s.queda;
      hud.bBolha.classList.toggle('ligado', est.bolha > 0);
      const prox = RL.MARCOS.find((q) => q.km > s.h);
      hud.prox.textContent = est.pouso ? 'Pouse sem quebrar nada' : s.queda ? 'De volta para casa' : prox ? `Próximo: ${prox.nome} · falta ${RL.fmtKm(prox.km - s.h)} km` : 'Acabou o mapa';
      const alvoV = RL.VELOCIDADES[est.velIdx - 1];
      hud.compara.textContent = alvoV && !s.queda ? 'Mais que: ' + alvoV.nome : '';
      hud.rec.textContent = jogo.recorde <= 0.2 ? 'Primeiro voo' : est.recordeBateu || s.h > jogo.recorde ? `Recorde batido! +${fmt(Math.max(0, (Math.max(s.h, s.hMax || 0) / jogo.recorde) - 1) * 100)}%` : `Recorde: ${RL.fmtKm(jogo.recorde)} km`;
      hud.rec.classList.toggle('batido', est.recordeBateu);
      hud.chipMoedas.classList.toggle('surto', est.surto > 0);
      hud.posRec.style.bottom = (Math.log10(1 + jogo.recorde) / Math.log10(1 + (a.kmFim || RL.KM_LUA))) * 100 + '%';
      hud.bSoltar.hidden = a.estagios.length < 2 || s.estagio >= a.estagios.length - 1;
      hud.bSoltar.classList.toggle('pisca', !RL.ligado(s, a) && s.estagio < a.estagios.length - 1);
      /* só aparece depois de terminar o jogo uma vez */
      hud.bAuto.hidden = a.autopiloto < 1;
      hud.bAuto.classList.toggle('ligado', est.auto);
      hud.bAuto.querySelector('span').textContent = est.auto ? 'Autopiloto ligado' : 'Autopiloto desligado';
      hud.bTempo.hidden = a.tempoMax <= 1;
      hud.bTempo.querySelector('b').textContent = est.fator + 'x';
      hud.bTempo.disabled = !!est.evento || RL.travaTempo(s.h);
      hud.alerta.textContent = est.alerta || '';
      hud.alerta.className = 'alerta-voo' + (est.alerta ? ' visivel' : '') + (est.pouso ? (est.alertaBom ? ' pouso bom' : ' pouso') : '');
      const capH = RL.capituloDe(s.queda ? s.hMax || s.h : s.h);
      hud.cap.textContent = `Capítulo ${capH.i + 1} · ${capH.nome}`;
      const semNada = !RL.ligado(s, a) && s.estagio >= a.estagios.length - 1;
      hud.bCasa.hidden = !semNada || !s.decolou || est.acabou || !!est.pouso;
      hud.barraTurbo.parentElement.parentElement.hidden = !a.estagios.some((q) => q.lateral);
      hud.bCasa.textContent = s.queda ? 'Pular a queda' : 'Começar a queda';
    }

    /* ---------- Laço ---------- */
    let ultimo = performance.now(), raf = 0, vivo = true;
    function quadro(agora) {
      if (!vivo) return;
      const dt = Math.max(0, Math.min(0.05, (agora - ultimo) / 1000));
      ultimo = agora;
      if (!est.pausado) {
        if (!est.acabou) {
          atualizar(dt);
          if (s.fim) {
            est.acabou = true;
            RL.Som.motor(0);
            if (s.fim === 'casco') {
              RL.Som.explosao();
              explodir();
              est.fimT = 2;
            } else if (s.fim === 'lua' || s.fim === 'plutao') {
              est.fimT = 2.4;
              RL.Som.marco();
            } else if (s.fim === 'pousou') {
              est.fimT = 0.9;
              est.vs = 0;
              saltar();
              est.tremor = 0.6;
              const yf = yFoguete() + 150;
              for (let i = 0; i < 12; i++) fx.puff(est.x + rnd(-60, 60), yf + rnd(-20, 30), { r: rnd(10, 18), r1: rnd(24, 44), vx: rnd(-160, 160), vy: rnd(-40, 20), vida: 0.8, arrasto: 0, atrito: 1.4 });
              RL.Som.batida();
            } else {
              /* paraquedas abre, a capivara olha para a câmera e o voo termina */
              est.fimT = s.decolou ? 2.2 : 0.9;
              est.falaProx = 0;
              molaTheta.alvo = 0;
            }
          }
        } else {
          est.fimT -= dt;
          est.rel += dt;
          est.vs = Math.max(0, est.vs - 900 * dt);
          est.scroll += est.vs * dt;
          if (s.fim !== 'casco' && s.fim !== 'lua' && s.fim !== 'plutao' && s.fim !== 'pousou' && s.decolou) {
            saltar();
            atualizarSalto(dt);
          }
          molaEsc.passo(dt);
          est.tremor = Math.max(0, est.tremor - dt);
          est.flash = Math.max(0, est.flash - dt);
          fx.atualizar(dt, est.vs * 0.2);
          if (est.fimT <= 0) {
            parar();
            aoTerminar(s, a);
            return;
          }
        }
        pintar();
        pintarPainel();
        pintarRetrato();
      }
      raf = requestAnimationFrame(quadro);
    }

    function parar() {
      vivo = false;
      cancelAnimationFrame(raf);
      RL.Som.motor(0);
      window.removeEventListener('resize', medir);
      window.removeEventListener('keydown', aoTecla);
      window.removeEventListener('keyup', aoSoltarTecla);
      window.removeEventListener('pointerup', aoLargar);
      document.removeEventListener('visibilitychange', aoSumir);
      clearTimeout(hud.tAviso);
      clearTimeout(hud.tDica);
      clearTimeout(est.tJanela);
      if (gpu) gpu.destruir();
      caixa.remove();
      RL.Voo.atual = null;
    }

    pintarPainel();
    pintar();
    raf = requestAnimationFrame(quadro);
    const controle = { s, a, est, parar, alternarPausa, soltar, proximoTempo, alternarAuto, medir, fx, falar, gpu, devPular, pintar };
    RL.Voo.atual = controle;
    return controle;
  }

  function montarPainel(caixa, a) {
    const topoKm = a.kmFim || RL.KM_LUA;
    const h = {};
    const painel = criar('div', 'painel-voo');
    const esq = criar('div', 'hud-esq');
    h.km = criar('div', 'hud-km', '0,00 KM');
    h.vel = criar('div', 'hud-vel', '0 km/h');
    h.compara = criar('div', 'hud-compara');
    h.rec = criar('div', 'hud-rec');
    h.prox = criar('div', 'hud-prox');
    h.cap = criar('div', 'hud-cap');
    esq.append(h.cap, h.km, h.vel, h.compara, h.rec, h.prox);
    const barra = (rotulo, cls) => {
      const c = criar('div', 'hud-barra ' + cls);
      c.appendChild(criar('span', '', rotulo));
      const f = criar('i');
      const t = criar('em');
      t.appendChild(f);
      c.appendChild(t);
      esq.appendChild(c);
      return f;
    };
    h.barraComb = barra('Combustível', 'comb');
    h.barraCasco = barra('Casco', 'casco');
    h.barraTurbo = barra('Turbo', 'turbo');
    h.est = criar('div', 'hud-est');
    esq.appendChild(h.est);

    h.chipMoedas = criar('div', 'hud-moedas');
    h.iconeMoeda = criar('span', 'icone-moeda');
    h.chipMoedas.appendChild(h.iconeMoeda);
    h.moedas = criar('b', '', '0');
    h.chipMoedas.appendChild(h.moedas);
    h.combo = criar('strong', 'hud-combo');
    h.combo.hidden = true;
    h.chipMoedas.appendChild(h.combo);
    const cb = criar('em', 'hud-combo-tempo');
    h.comboBarra = criar('i');
    cb.appendChild(h.comboBarra);
    h.chipMoedas.appendChild(cb);

    const trilha = criar('div', 'hud-trilha');
    trilha.setAttribute('aria-hidden', 'true');
    trilha.appendChild(criar('span', 'trilha-lua', topoKm > RL.KM_LUA ? 'Plutão' : 'Lua'));
    trilha.appendChild(criar('span', 'trilha-terra', 'Terra'));
    const fio = criar('div', 'trilha-fio');
    for (const m of RL.MARCOS.filter((q) => q.km <= topoKm)) {
      const pp = criar('i', 'trilha-marca');
      pp.style.bottom = (Math.log10(1 + m.km) / Math.log10(1 + topoKm)) * 100 + '%';
      pp.title = m.nome;
      fio.appendChild(pp);
    }
    h.posRec = criar('i', 'trilha-rec');
    fio.appendChild(h.posRec);
    h.pos = criar('b', 'trilha-pos');
    fio.appendChild(h.pos);
    trilha.appendChild(fio);

    const botoes = criar('div', 'hud-botoes');
    const bot = (txt, tecla) => {
      const b = criar('button', 'bt-voo');
      b.type = 'button';
      b.innerHTML = `<span>${txt}</span> <kbd>${tecla}</kbd>`;
      botoes.appendChild(b);
      return b;
    };
    h.bBolha = bot('Escudo <b>0</b>', 'F');
    h.bBolha.classList.add('bt-bolha');
    h.bSoltar = bot('Soltar estágio', 'S');
    h.bAuto = bot('Autopiloto', 'Q');
    h.bTempo = bot('Tempo <b>1x</b>', 'E');
    h.bPausa = bot('Pausa', 'Esc');
    h.bCasa = criar('button', 'bt bt-casa', 'Voltar para casa');
    h.bCasa.type = 'button';
    h.bCasa.hidden = true;

    h.aviso = criar('div', 'aviso');
    h.avisoT = criar('strong');
    h.avisoX = criar('p');
    h.aviso.append(h.avisoT, h.avisoX);
    h.dica = criar('div', 'dica');
    h.contagem = criar('div', 'contagem');
    if (RL.MODO_DEV) painel.appendChild(criar('div', 'selo-dev', 'TESTE · sem dano · L: Lua · N: capítulo'));
    h.alerta = criar('div', 'alerta-voo');
    h.faixa = criar('div', 'faixa-grande');
    h.faixaT = criar('strong');
    h.faixaS = criar('span');
    h.faixa.append(h.faixaT, h.faixaS);
    const moldura = criar('div', 'retrato');
    moldura.setAttribute('aria-hidden', 'true');
    h.retrato = criar('canvas');
    h.retrato.width = 208;
    h.retrato.height = 208;
    moldura.appendChild(h.retrato);
    h.chat = criar('div', 'chat');
    h.chat.setAttribute('role', 'log');
    h.chat.setAttribute('aria-live', 'polite');

    h.pausa = criar('div', 'pausa');
    h.pausa.hidden = true;
    const cx = criar('div', 'pausa-caixa');
    cx.appendChild(criar('h2', '', 'Pausa'));
    h.pTexto = criar('p', '', 'A capivara está olhando pela janela. Nada mudou.');
    cx.appendChild(h.pTexto);
    h.pContinuar = criar('button', 'bt bt-principal', 'Continuar');
    h.pOpcoes = criar('button', 'bt', 'Opções');
    h.pEncerrar = criar('button', 'bt', 'Encerrar voo e receber');
    for (const b of [h.pContinuar, h.pOpcoes, h.pEncerrar]) b.type = 'button';
    cx.append(h.pContinuar, h.pOpcoes, h.pEncerrar);
    h.pausa.appendChild(cx);

    const colunaAvisos = criar('div', 'coluna-avisos');
    colunaAvisos.append(h.aviso, h.dica);
    const colunaEsq = criar('div', 'coluna-esq');
    colunaEsq.append(esq, colunaAvisos);
    painel.append(colunaEsq, h.chipMoedas, trilha, botoes, h.bCasa, h.faixa, h.alerta, h.contagem, moldura, h.chat, h.pausa);
    caixa.appendChild(painel);
    return h;
  }

  RL.Voo = { iniciar, atual: null };
})();
