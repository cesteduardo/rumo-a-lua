/* Foguete montado com a arte pintada: empilha peças, aplica pintura, adesivos e logotipos. */
(function () {
  const RL = window.RL;
  const TRACO = '#33281F';
  const CREME = '#EEE9D7';

  /* ---------- Figuras carregadas de arte/sprites ---------- */
  const FIGURAS = {};
  const NOMES = [
    'passaro', 'aviao', 'balao', 'meteo', 'lixo', 'satelite', 'meteoro', 'moeda', 'galao', 'kit', 'caixa', 'refri', 'sofa', 'pato', 'dirigivel', 'outdoor',
    'bico0', 'bico1', 'bico2', 'bico3', 'bico4', 'bico5', 'bico6', 'bico7', 'capsula0', 'capsula1', 'capsula2', 'capsula3', 'capsula4', 'capsula5', 'capsula6', 'capsula7', 'tanque0', 'tanque1', 'tanque2', 'tanque3', 'tanque4', 'tanque5', 'tanque6', 'tanque7', 'motor0', 'motor1', 'motor2', 'motor3', 'motor4', 'motor5', 'motor6', 'motor7',
    'aleta0', 'aleta1', 'aleta2', 'aleta3', 'aux0', 'aux1', 'aux2', 'escudo0', 'gerador', 'antena', 'ima', 'carga', 'enfeite0', 'enfeite1', 'enfeite2', 'enfeite3',
    'capi_parada', 'capi_aponta', 'capi_comemora', 'capi_susto', 'capi_triste', 'capi_paraquedas', 'capi_chave', 'tatu', 'tatu_fala', 'cab_parada', 'cab_feliz', 'cab_susto', 'cab_triste',
  ];
  RL.Sprite = (n) => FIGURAS[n];
  RL.carregarFiguras = function (aoFim) {
    let falta = NOMES.length;
    for (const n of NOMES) {
      const im = new Image();
      im.onload = () => { FIGURAS[n] = im; if (--falta === 0) aoFim(); };
      im.onerror = () => { if (--falta === 0) aoFim(); };
      im.src = 'arte/sprites/' + n + '.png';
    }
  };

  /* Cada modelo usa uma figura; níveis acima repetem a figura em outra cor. */
  const FIG_POR_TIPO = {
    bico: ['bico0', 'bico4', 'bico1', 'bico5', 'bico2', 'bico6', 'bico3', 'bico7'], capsula: ['capsula0', 'capsula4', 'capsula1', 'capsula5', 'capsula2', 'capsula6', 'capsula3', 'capsula7'], tanque: ['tanque0', 'tanque4', 'tanque1', 'tanque5', 'tanque2', 'tanque6', 'tanque3', 'tanque7'],
    motor: ['motor0', 'motor4', 'motor1', 'motor5', 'motor2', 'motor6', 'motor3', 'motor7'], aleta: ['aleta0', 'aleta1', 'aleta2', 'aleta3'], lateral: ['aux0', 'aux1', 'aux2'], escudo: ['escudo0'],
    gerador: ['gerador'], antena: ['antena'], ima: ['ima'], carga: ['carga'], enfeite: ['enfeite0', 'enfeite1', 'enfeite2', 'enfeite3'],
    cofre: ['carga'], radar: ['antena'], paraquedas: ['gerador'],
  };
  const MATIZ_BASE = { cofre: 50, radar: 170, paraquedas: 300 };
  function figuraDe(p) {
    const l = FIG_POR_TIPO[p.tipo];
    const volta = Math.floor(p.nivel / l.length);
    return { img: RL.Sprite(l[p.nivel % l.length]), matiz: (MATIZ_BASE[p.tipo] || 0) + volta * 62, brilho: 1 - (volta % 2) * 0.06 };
  }

  /* ---------- Formato: seções empilhadas, mais largas embaixo ---------- */
  const W = 78;
  const ALTURA = { enfeite: 44, bico: 84, escudo: 16, capsula: 92, modulo: 34, tanque: 52, motor: 46, junta: 14 };

  const temPeca = (e) => !!e && (e.motor || e.aletas || e.lateral || (e.tanques || []).some(Boolean));

  /* Com `lim`, a oficina mostra também os encaixes vazios, mas só o próximo de cada lugar
     e em tamanho de etiqueta: o foguete continua inteiro em vez de ficar partido em pedaços. */
  function layout(build, lim, opcoes) {
    const o = opcoes || {};
    const desde = o.desde || 0;
    const slots = [];
    const juntas = [];
    let y = 0;
    const ALTURA_VAZIO = 20;
    const pilha = (caminho, tipo, h0, w) => {
      const id = RL.ler(build, caminho);
      if (id) {
        /* a altura segue a figura, sem achatar: antena e ímã precisam do espaço deles */
        const im = RL.PECAS[id] && figuraDe(RL.PECAS[id]).img;
        const h = im && tipo !== 'enfeite' ? Math.max(h0 * 0.72, Math.min(h0 * 1.75, (w * im.height) / im.width)) : h0;
        slots.push({ caminho, tipo, id, x: -w / 2, y, w, h });
        /* cada peça entra um pouco na de baixo: nada de fresta entre formas arredondadas */
        y += h - (tipo === 'enfeite' ? 4 : Math.min(9, h * 0.14));
      } else if (lim) {
        const lv = Math.min(w, 58);
        slots.push({ caminho, tipo, id: null, x: -lv / 2, y, w: lv, h: ALTURA_VAZIO });
        y += ALTURA_VAZIO;
      }
    };
    pilha('enfeite', 'enfeite', ALTURA.enfeite, 50);
    pilha('bico', 'bico', ALTURA.bico, W);
    pilha('escudo', 'escudo', ALTURA.escudo, W + 6);
    pilha('capsula', 'capsula', ALTURA.capsula, W);
    /* nunca esconde o que já está montado, mesmo se a pesquisa permitir menos */
    const nMod = lim ? Math.max(lim.modulos, build.modulos.length) : build.modulos.length;
    for (let m = 0; m < nMod; m++) pilha('mod' + m, 'modulo', ALTURA.modulo, W);
    let topo = desde - 1;
    for (let e = build.estagios.length - 1; e >= desde; e--) {
      if (temPeca(build.estagios[e])) {
        topo = e;
        break;
      }
    }
    topo = Math.max(topo, lim ? 0 : desde);
    const nEst = lim ? Math.max(lim.estagios, build.estagios.length) : build.estagios.length;
    /* no alto, só um estágio vazio de cada vez */
    const maisAlto = lim ? Math.min(nEst - 1, topo + 1) : build.estagios.length - 1;
    let largAnt = W;
    for (let e = maisAlto; e >= desde; e--) {
      const est = build.estagios[e] || { tanques: [] };
      const real = temPeca(est);
      const larg = W + Math.max(0, topo - e) * 16;
      if (larg !== largAnt && real && y > 0) {
        juntas.push({ y, h: ALTURA.junta, w0: largAnt, w1: larg });
        y += ALTURA.junta;
      }
      if (real) largAnt = larg;
      const yIni = y;
      const nTan = lim ? Math.max(lim.tanques, est.tanques.length) : est.tanques.length;
      let vazioTan = false, tanquesReais = 0;
      for (let t = 0; t < nTan; t++) {
        if (est.tanques[t]) tanquesReais++;
        else {
          if (vazioTan || !lim) continue;
          vazioTan = true;
        }
        pilha(`e${e}.t${t}`, 'tanque', ALTURA.tanque, larg);
      }
      const yTan = y;
      if (tanquesReais && (est.lateral || lim)) {
        const lh = Math.max(50, Math.min(yTan - yIni, 92));
        slots.push({ caminho: `e${e}.lateral`, tipo: 'lateral', id: est.lateral || null, x: -larg / 2 - 24, y: yTan - lh + 6, w: 27, h: lh, espelho: true });
      }
      pilha(`e${e}.motor`, 'motor', ALTURA.motor, larg * 0.84);
      if (est.motor && (est.aletas || lim)) slots.push({ caminho: `e${e}.aletas`, tipo: 'aleta', id: est.aletas || null, x: -larg * 0.42 - 40, y: y - 66, w: 44, h: 66, espelho: true });
    }
    return { slots, juntas, altura: y + 10, largura: W + 110 };
  }

  /* ---------- Pintura de superfície ---------- */
  /* Padrões em cores chapadas com borda desenhada, como pintura à mão de letreiro de caminhão. */
  function aplicarPadrao(ctx, b, padrao, corB) {
    if (!padrao || padrao === 'liso') return;
    const { x, y, w, h } = b;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = corB;
    ctx.strokeStyle = TRACO;
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    const forma = (f) => { ctx.beginPath(); f(); ctx.fill(); ctx.stroke(); };
    const estrela = (cx, cy, r) => { for (let i = 0; i < 10; i++) { const a = -1.57 + (i * 6.283) / 10, q = i % 2 ? r * 0.45 : r; ctx.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } ctx.closePath(); };
    if (padrao === 'listras') {
      const n = Math.max(2, Math.round(h / 16));
      for (let i = 0; i < n; i++) forma(() => ctx.rect(x - 2, y + ((i + 0.25) * h) / n, w + 4, (h / n) * 0.5));
    } else if (padrao === 'faixa') {
      forma(() => ctx.rect(x + w * 0.36, y - 2, w * 0.28, h + 4));
      forma(() => ctx.rect(x + w * 0.27, y - 2, w * 0.04, h + 4));
      forma(() => ctx.rect(x + w * 0.69, y - 2, w * 0.04, h + 4));
    } else if (padrao === 'bolinhas') {
      for (let py = y + 7, l = 0; py < y + h + 6; py += 15, l++) {
        for (let px = x + 5 + (l % 2) * 8; px < x + w + 6; px += 16) forma(() => ctx.arc(px, py, 4.1, 0, 6.283));
      }
    } else if (padrao === 'xadrez') {
      const q = Math.max(9, Math.min(w / 6, 13));
      for (let j = 0; j * q < h; j++) for (let i = 0; i * q < w; i++) if ((i + j) % 2 === 0) ctx.fillRect(x + i * q, y + j * q, q, q);
    } else if (padrao === 'chamas') {
      /* chamas de carro envenenado: línguas compridas que sobem a partir da base */
      forma(() => {
        ctx.moveTo(x - 2, y + h + 2);
        const n = 4;
        for (let i = 0; i < n; i++) {
          const x0 = x + (w * i) / n, lg = w / n, pico = y + h * (i % 2 ? 0.28 : 0.1);
          ctx.bezierCurveTo(x0 + lg * 0.05, y + h * 0.7, x0 + lg * 0.2, y + h * 0.5, x0 + lg * 0.32, pico);
          ctx.bezierCurveTo(x0 + lg * 0.46, y + h * 0.5, x0 + lg * 0.56, y + h * 0.62, x0 + lg, y + h * 0.72);
        }
        ctx.lineTo(x + w + 2, y + h + 2);
        ctx.closePath();
      });
    } else if (padrao === 'dentes') {
      /* boca de tubarão: fileira de dentes de cima e de baixo */
      for (const de of [0, 1]) {
        forma(() => {
          const y0 = de ? y + h + 2 : y - 2;
          ctx.moveTo(x - 2, y0);
          const n = 6;
          for (let i = 0; i < n; i++) {
            const lg = w / n;
            ctx.lineTo(x + lg * i, y0);
            ctx.lineTo(x + lg * (i + 0.5), de ? y + h * 0.62 : y + h * 0.38);
            ctx.lineTo(x + lg * (i + 1), y0);
          }
          ctx.closePath();
        });
      }
    } else if (padrao === 'remendos') {
      for (const [fx, fy, g] of [[0.08, 0.16, 0.08], [0.56, 0.1, -0.1], [0.24, 0.58, -0.06], [0.66, 0.62, 0.12]]) {
        ctx.save();
        ctx.translate(x + w * (fx + 0.11), y + h * (fy + 0.12));
        ctx.rotate(g);
        ctx.beginPath();
        ctx.rect(-w * 0.11, -h * 0.13, w * 0.22, h * 0.26);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([2.5, 2.5]);
        ctx.strokeRect(-w * 0.11 + 2.5, -h * 0.13 + 2.5, w * 0.22 - 5, h * 0.26 - 5);
        ctx.restore();
      }
    } else if (padrao === 'diagonal') {
      const p = 20;
      for (let i = -h; i < w + h; i += p) forma(() => { ctx.moveTo(x + i, y + h + 2); ctx.lineTo(x + i + p * 0.5, y + h + 2); ctx.lineTo(x + i + p * 0.5 + h, y - 2); ctx.lineTo(x + i + h, y - 2); ctx.closePath(); });
    } else if (padrao === 'ziguezague') {
      for (let py = y + 2; py < y + h + 12; py += 19) {
        forma(() => {
          ctx.moveTo(x - 2, py);
          const n = Math.ceil(w / 11);
          for (let i = 0; i <= n; i++) ctx.lineTo(x + i * 11, py + (i % 2 ? -5 : 2));
          for (let i = n; i >= 0; i--) ctx.lineTo(x + i * 11, py + (i % 2 ? 3 : 10));
          ctx.closePath();
        });
      }
    } else if (padrao === 'estrelas') {
      for (const [fx, fy, r] of [[0.2, 0.25, 8], [0.68, 0.18, 6], [0.44, 0.55, 10], [0.84, 0.66, 7], [0.14, 0.8, 6]]) forma(() => estrela(x + w * fx, y + h * fy, r));
    } else if (padrao === 'escamas') {
      const q = 15;
      for (let j = -1, py = y - 2; py < y + h + q; j++, py += q * 0.62) {
        for (let px = x + (j % 2 ? q / 2 : 0) - q; px < x + w + q; px += q) forma(() => { ctx.moveTo(px - q / 2, py); ctx.arc(px, py, q / 2, 3.14159, 0, true); ctx.closePath(); });
      }
    } else if (padrao === 'raios') {
      forma(() => {
        const n = 3;
        for (let i = 0; i < n; i++) {
          const c = x + (w * (i + 0.5)) / n, s = w / n / 2.4;
          ctx.moveTo(c + s * 0.5, y - 1);
          ctx.lineTo(c - s * 0.7, y + h * 0.54);
          ctx.lineTo(c - s * 0.05, y + h * 0.5);
          ctx.lineTo(c - s * 0.5, y + h + 1);
          ctx.lineTo(c + s * 0.75, y + h * 0.42);
          ctx.lineTo(c + s * 0.05, y + h * 0.46);
          ctx.closePath();
        }
      });
    } else if (padrao === 'nuvens') {
      for (const [fx, fy, r] of [[0.22, 0.22, 10], [0.72, 0.36, 12], [0.34, 0.76, 11]]) {
        forma(() => {
          const cx = x + w * fx, cy = y + h * fy;
          ctx.arc(cx - r * 0.8, cy, r * 0.62, 1.57, 4.71);
          ctx.arc(cx - r * 0.2, cy - r * 0.5, r * 0.7, 3.5, 5.9);
          ctx.arc(cx + r * 0.75, cy - r * 0.05, r * 0.66, 4.3, 1.57);
          ctx.closePath();
        });
      }
    } else if (padrao === 'caveiras') {
      for (const [fx, fy] of [[0.26, 0.28], [0.72, 0.5], [0.28, 0.8]]) {
        const cx = x + w * fx, cy = y + h * fy;
        forma(() => { ctx.arc(cx, cy, 7.5, 2.5, 0.64); ctx.lineTo(cx + 4, cy + 10); ctx.lineTo(cx - 4, cy + 10); ctx.closePath(); });
        ctx.fillStyle = TRACO;
        for (const l of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + l * 3, cy - 0.5, 2, 0, 6.283); ctx.fill(); }
        ctx.fillStyle = corB;
      }
    }
    ctx.restore();
  }

  /* Adesivo de verdade: figura recortada com borda branca e sombrinha. Fica pronto em cache. */
  const adesivosProntos = new Map();
  function adesivoPronto(nome, cor) {
    const k = nome + '|' + (nome.startsWith('f_') ? '' : cor || '');
    let c = adesivosProntos.get(k);
    if (c) return c;
    const S = 200;
    const base = document.createElement('canvas');
    base.width = base.height = S;
    const b = base.getContext('2d');
    if (nome.startsWith('f_')) {
      const im = RL.Sprite(nome.slice(2));
      if (!im) return null;
      const e = 136 / Math.max(im.width, im.height);
      b.drawImage(im, 100 - (im.width * e) / 2, 100 - (im.height * e) / 2, im.width * e, im.height * e);
    } else {
      formaAdesivo(b, nome, 100, 100, 130, cor);
    }
    c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const borda = document.createElement('canvas');
    borda.width = borda.height = S;
    const bx = borda.getContext('2d');
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * 6.283;
      bx.drawImage(base, Math.cos(a) * 9, Math.sin(a) * 9);
    }
    bx.globalCompositeOperation = 'source-in';
    bx.fillStyle = '#FFFDF4';
    bx.fillRect(0, 0, S, S);
    /* sombra: a borda em escuro, um pouco para baixo */
    x.globalAlpha = 0.38;
    x.filter = 'brightness(0)';
    x.drawImage(borda, 0, 5);
    x.filter = 'none';
    x.globalAlpha = 1;
    x.drawImage(borda, 0, 0);
    x.drawImage(base, 0, 0);
    adesivosProntos.set(k, c);
    return c;
  }

  function adesivo(ctx, nome, cx, cy, s, cor) {
    if (!nome || nome === 'nenhum') return;
    const c = adesivoPronto(nome, cor);
    if (!c) return;
    const t = s * 1.54;
    ctx.drawImage(c, cx - t / 2, cy - t / 2, t, t);
  }

  function formaAdesivo(ctx, nome, cx, cy, s, cor) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s / 20, s / 20);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = TRACO;
    ctx.fillStyle = cor || '#F0CF62';
    ctx.lineJoin = 'round';
    const c = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill(); };
    const forma = {
      estrela() { ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 4.5 : 10, a = (i / 10) * 6.283 - 1.57; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); },
      caveira() { ctx.fillStyle = '#F4F1E4'; ctx.beginPath(); ctx.arc(0, -2, 8, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.fillRect(-4, 4, 8, 5); ctx.strokeRect(-4, 4, 8, 5); ctx.fillStyle = TRACO; c(-3, -2, 2.2); c(3, -2, 2.2); },
      raio() { ctx.beginPath(); ctx.moveTo(2, -10); ctx.lineTo(-6, 2); ctx.lineTo(-1, 2); ctx.lineTo(-3, 10); ctx.lineTo(6, -3); ctx.lineTo(1, -3); ctx.closePath(); ctx.fill(); ctx.stroke(); },
      coracao() { ctx.fillStyle = '#C8513F'; ctx.beginPath(); ctx.moveTo(0, 9); ctx.bezierCurveTo(-14, -2, -6, -11, 0, -4); ctx.bezierCurveTo(6, -11, 14, -2, 0, 9); ctx.fill(); ctx.stroke(); },
      chama() { ctx.fillStyle = '#E08A3C'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.bezierCurveTo(10, -2, 8, 9, 0, 9); ctx.bezierCurveTo(-8, 9, -9, 0, -3, -3); ctx.quadraticCurveTo(-2, 1, 0, -10); ctx.fill(); ctx.stroke(); },
      olho() { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 10, 0, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.fillStyle = TRACO; c(2, 1, 2.2); },
      alvo() { ctx.fillStyle = '#F4F1E4'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#C8513F'; ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#F4F1E4'; c(0, 0, 2); },
      banana() { ctx.beginPath(); ctx.moveTo(-9, -5); ctx.quadraticCurveTo(-4, 9, 9, 3); ctx.quadraticCurveTo(0, 2, -6, -7); ctx.closePath(); ctx.fill(); ctx.stroke(); },
      numero7() { ctx.fillStyle = '#F4F1E4'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(5, -5); ctx.lineTo(-2, 7); ctx.stroke(); },
      lua() { ctx.beginPath(); ctx.arc(0, 0, 9, 0.9, 5.4); ctx.quadraticCurveTo(-1, 0, 5.6, 7); ctx.fill(); ctx.stroke(); },
      capivara() {
        const im = RL.Sprite('cab_parada');
        if (im) ctx.drawImage(im, -11, -9, 22, 18);
      },
    };
    if (forma[nome]) forma[nome]();
    ctx.restore();
  }

  /* Logotipo de marca inventada: selo com ícone e nome. */
  const ICONES = {
    pao(c, r) { c.beginPath(); c.ellipse(0, 0, r, r * 0.62, 0, 0, 6.283); c.fill(); c.stroke(); },
    pneu(c, r) { c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.stroke(); c.beginPath(); c.arc(0, 0, r * 0.45, 0, 6.283); c.fill(); },
    osso(c, r) { c.fillRect(-r * 0.7, -r * 0.2, r * 1.4, r * 0.4); for (const x of [-0.75, 0.75]) for (const y of [-0.28, 0.28]) { c.beginPath(); c.arc(x * r, y * r, r * 0.3, 0, 6.283); c.fill(); } },
    sorvete(c, r) { c.beginPath(); c.moveTo(-r * 0.55, -r * 0.1); c.lineTo(r * 0.55, -r * 0.1); c.lineTo(0, r); c.closePath(); c.fill(); c.beginPath(); c.arc(0, -r * 0.35, r * 0.6, 0, 6.283); c.fill(); },
    cone(c, r) { c.beginPath(); c.moveTo(0, -r); c.lineTo(r * 0.7, r * 0.8); c.lineTo(-r * 0.7, r * 0.8); c.closePath(); c.fill(); },
    flor(c, r) { for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283; c.beginPath(); c.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.42, 0, 6.283); c.fill(); } },
    radio(c, r) { c.fillRect(-r, -r * 0.45, r * 2, r * 1.3); c.beginPath(); c.moveTo(-r * 0.5, -r * 0.45); c.lineTo(r * 0.5, -r); c.stroke(); },
    gota(c, r) { c.beginPath(); c.moveTo(0, -r); c.bezierCurveTo(r, 0, r * 0.7, r, 0, r); c.bezierCurveTo(-r * 0.7, r, -r, 0, 0, -r); c.fill(); },
    halter(c, r) { c.fillRect(-r * 0.7, -r * 0.14, r * 1.4, r * 0.28); for (const x of [-1, 1]) c.fillRect(x * r * 0.72 - r * 0.2, -r * 0.6, r * 0.4, r * 1.2); },
    duvida(c, r) { c.font = `400 ${r * 2.2}px 'Lilita One',sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, r * 0.1); },
    garrafa(c, r) { c.beginPath(); c.moveTo(-r * 0.2, -r); c.lineTo(r * 0.2, -r); c.lineTo(r * 0.2, -r * 0.4); c.lineTo(r * 0.5, 0); c.lineTo(r * 0.5, r); c.lineTo(-r * 0.5, r); c.lineTo(-r * 0.5, 0); c.lineTo(-r * 0.2, -r * 0.4); c.closePath(); c.fill(); },
    sinal(c, r) { for (const q of [0.35, 0.7, 1.05]) { c.beginPath(); c.arc(0, r * 0.7, r * q, -2.4, -0.74); c.stroke(); } c.beginPath(); c.arc(0, r * 0.7, r * 0.14, 0, 6.283); c.fill(); },
    escudo(c, r) { c.beginPath(); c.moveTo(-r * 0.8, -r * 0.8); c.lineTo(r * 0.8, -r * 0.8); c.lineTo(r * 0.8, 0); c.quadraticCurveTo(r * 0.6, r * 0.8, 0, r); c.quadraticCurveTo(-r * 0.6, r * 0.8, -r * 0.8, 0); c.closePath(); c.fill(); },
    biscoito(c, r) { c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.stroke(); for (const [x, y] of [[-0.3, -0.3], [0.35, -0.1], [-0.1, 0.4]]) { c.beginPath(); c.arc(x * r, y * r, r * 0.17, 0, 6.283); c.fill(); } },
  };

  /* Cada marca tem a sua silhueta, como um logotipo de verdade. */
  const FORMA_MARCA = { seuze: 'oval', duasrodas: 'hexa', mordida: 'etiqueta', polosul: 'nuvem', devagar: 'placa', sossego: 'bandeira', betofm: 'hexa', lento: 'nuvem', sofa: 'etiqueta', quemsabe: 'oval', gasosa: 'bandeira', asvezes: 'placa', deusmelivre: 'bandeira', bolacha: 'nuvem' };
  function silhueta(ctx, forma, w, h) {
    const W2 = w / 2, H2 = h / 2;
    ctx.beginPath();
    if (forma === 'oval') {
      ctx.ellipse(0, 0, W2, H2, 0, 0, 6.283);
    } else if (forma === 'hexa') {
      const q = h * 0.42;
      ctx.moveTo(-W2 + q, -H2); ctx.lineTo(W2 - q, -H2); ctx.lineTo(W2, 0); ctx.lineTo(W2 - q, H2); ctx.lineTo(-W2 + q, H2); ctx.lineTo(-W2, 0); ctx.closePath();
    } else if (forma === 'etiqueta') {
      const q = h * 0.46;
      ctx.moveTo(-W2 + q, -H2); ctx.lineTo(W2 - 4, -H2); ctx.quadraticCurveTo(W2, -H2, W2, -H2 + 4); ctx.lineTo(W2, H2 - 4); ctx.quadraticCurveTo(W2, H2, W2 - 4, H2); ctx.lineTo(-W2 + q, H2); ctx.lineTo(-W2, 0); ctx.closePath();
    } else if (forma === 'nuvem') {
      const n = 7, r = (w / n) * 0.62;
      ctx.roundRect(-W2 + r * 0.5, -H2 + h * 0.08, w - r, h * 0.84, h * 0.3);
      for (let i = 0; i < n; i++) {
        const x = -W2 + r * 0.6 + ((w - r * 1.2) * i) / (n - 1);
        ctx.moveTo(x + r * 0.5, -H2 + h * 0.2);
        ctx.arc(x, -H2 + h * 0.2, r * 0.5, 0, 6.283);
        ctx.moveTo(x + r * 0.5, H2 - h * 0.2);
        ctx.arc(x, H2 - h * 0.2, r * 0.5, 0, 6.283);
      }
    } else if (forma === 'bandeira') {
      const q = h * 0.3;
      ctx.moveTo(-W2, -H2); ctx.lineTo(W2, -H2); ctx.lineTo(W2 - q, 0); ctx.lineTo(W2, H2); ctx.lineTo(-W2, H2); ctx.lineTo(-W2 + q, 0); ctx.closePath();
    } else {
      ctx.roundRect(-W2, -H2, w, h, h * 0.18);
    }
  }

  function logoMarca(ctx, m, cx, cy, w, h) {
    const forma = FORMA_MARCA[m.id] || 'placa';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineJoin = 'round';
    /* sombra chapada e contorno de tinta */
    ctx.save();
    ctx.translate(0, Math.max(1, h * 0.06));
    silhueta(ctx, forma, w, h);
    ctx.fillStyle = TRACO;
    ctx.fill();
    ctx.restore();
    silhueta(ctx, forma, w, h);
    ctx.fillStyle = m.cor;
    ctx.fill();
    /* tinta de verdade: luz em cima, sombra embaixo e aguada por dentro, como na arte */
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(255,250,235,.26)';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.58, w * 0.62, h * 0.42, 0, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = 'rgba(52,32,24,.2)';
    ctx.fillRect(-w / 2, h * 0.24, w, h * 0.3);
    const aguada = RL.Pintura && RL.Pintura.textura();
    if (aguada) {
      ctx.globalAlpha = 0.8;
      ctx.drawImage(aguada, -w / 2, -h / 2, Math.max(w, h * 4), Math.max(w, h * 4));
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    silhueta(ctx, forma, w, h);
    ctx.strokeStyle = TRACO;
    ctx.lineWidth = Math.max(1.2, h * 0.055);
    ctx.stroke();
    /* filete interno, como em rótulo impresso */
    if (forma !== 'nuvem' && h >= 16) {
      ctx.save();
      ctx.scale((w - h * 0.2) / w, 0.78);
      silhueta(ctx, forma, w, h);
      ctx.strokeStyle = m.tinta;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = Math.max(0.6, h * 0.03);
      ctx.stroke();
      ctx.restore();
    }
    /* medalhão com o ícone */
    const rm = h * 0.3;
    const xm = -w / 2 + h * (forma === 'etiqueta' || forma === 'hexa' ? 0.62 : forma === 'bandeira' ? 0.72 : 0.52);
    ctx.fillStyle = m.tinta;
    ctx.beginPath();
    ctx.arc(xm, 0, rm, 0, 6.283);
    ctx.fill();
    ctx.save();
    ctx.translate(xm, 0);
    ctx.strokeStyle = m.cor;
    ctx.fillStyle = m.cor;
    ctx.lineWidth = Math.max(0.8, h * 0.05);
    ICONES[m.icone](ctx, rm * 0.68);
    ctx.restore();
    /* nome */
    const xt = xm + rm + h * 0.14;
    const dispo = w / 2 - xt - h * (forma === 'bandeira' ? 0.34 : forma === 'hexa' ? 0.3 : 0.14);
    let tam = h * 0.5;
    ctx.font = `400 ${tam}px 'Lilita One',sans-serif`;
    const larg = ctx.measureText(m.curto).width;
    if (larg > dispo) {
      tam *= dispo / larg;
      ctx.font = `400 ${tam}px 'Lilita One',sans-serif`;
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = m.cor;
    ctx.lineWidth = Math.max(1, h * 0.05);
    ctx.strokeText(m.curto, xt, h * 0.03);
    ctx.fillStyle = m.tinta;
    ctx.fillText(m.curto, xt, h * 0.03);
    ctx.restore();
  }

  /* Base de lançamento: bloco de concreto, garras, torre de serviço, tanque e mangueira.
     O (0,0) é o centro do topo do bloco. `solta` vai de 0 (preso) a 1 (tudo afastado). */
  function plataforma(ctx, larg, alturaFoguete, solta, t, simples) {
    const T = TRACO;
    const s = solta || 0;
    ctx.save();
    ctx.strokeStyle = T;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const L = larg + 42;
    /* tanque de combustível e cano */
    if (!simples) {
      ctx.fillStyle = '#C9C2AE';
      ctx.beginPath();
      ctx.roundRect(-L - 62, -58, 54, 70, 20);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#C8513F';
      ctx.fillRect(-L - 61, -30, 52, 12);
      ctx.strokeRect(-L - 61, -30, 52, 12);
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(-L - 8, -8);
      ctx.lineTo(-L + 26, -8);
      ctx.stroke();
      ctx.strokeStyle = '#9AA3A6';
      ctx.lineWidth = 2.6;
      ctx.stroke();
      ctx.strokeStyle = T;
      ctx.lineWidth = 2;
    }
    /* corpo de concreto com rampa */
    ctx.fillStyle = '#8E887A';
    ctx.beginPath();
    ctx.moveTo(-L - 20, 46);
    ctx.lineTo(L + 20, 46);
    ctx.lineTo(L, 14);
    ctx.lineTo(-L, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#B5AE9C';
    ctx.beginPath();
    ctx.roundRect(-L, 0, L * 2, 16, 3);
    ctx.fill();
    ctx.stroke();
    /* faixas de perigo */
    ctx.save();
    ctx.beginPath();
    ctx.rect(-L + 1, 1, L * 2 - 2, 14);
    ctx.clip();
    ctx.fillStyle = '#E0B23C';
    ctx.fillRect(-L, 0, L * 2, 16);
    ctx.fillStyle = '#33281F';
    for (let x = -L - 16; x < L + 16; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, 16);
      ctx.lineTo(x + 12, 16);
      ctx.lineTo(x + 24, 0);
      ctx.lineTo(x + 12, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.roundRect(-L, 0, L * 2, 16, 3);
    ctx.stroke();
    /* poço de chamas */
    ctx.fillStyle = '#33281F';
    ctx.beginPath();
    ctx.ellipse(0, 31, larg * 0.5, 9, 0, 0, 6.283);
    ctx.fill();
    /* lanternas piscando nas pontas */
    for (const l of [-1, 1]) {
      ctx.fillStyle = '#5E6468';
      ctx.fillRect(l * L - 2, -14, 4, 15);
      const acesa = Math.sin((t || 0) * 5 + l) > 0;
      ctx.fillStyle = acesa ? '#FF6A50' : '#7E3028';
      ctx.beginPath();
      ctx.arc(l * L, -17, 4.5, 0, 6.283);
      ctx.fill();
      ctx.stroke();
    }
    /* garras que seguram o foguete e abrem na decolagem */
    for (const l of [-1, 1]) {
      ctx.save();
      ctx.translate(l * (larg * 0.62 + 6), 0);
      ctx.rotate(l * s * 0.9);
      ctx.fillStyle = '#7E878C';
      ctx.beginPath();
      ctx.moveTo(-5, 1);
      ctx.lineTo(5, 1);
      ctx.lineTo(3, -22);
      ctx.lineTo(-l * 10, -28);
      ctx.lineTo(-3, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    if (simples) {
      ctx.restore();
      return;
    }
    /* torre treliçada: tomba para fora e a passarela recolhe */
    const alt = Math.max(150, alturaFoguete + 30);
    ctx.save();
    ctx.translate(L - 8, 2);
    ctx.rotate(s * s * 0.34);
    const lt = 24;
    ctx.fillStyle = '#C8513F';
    ctx.fillRect(0, -alt, lt, alt);
    ctx.lineWidth = 2;
    ctx.strokeRect(0, -alt, lt, alt);
    ctx.strokeStyle = '#F4F1E4';
    ctx.lineWidth = 2.4;
    for (let y = -alt; y < -18; y += 24) {
      ctx.beginPath();
      ctx.moveTo(1, y + 1);
      ctx.lineTo(lt - 1, y + 23);
      ctx.moveTo(lt - 1, y + 1);
      ctx.lineTo(1, y + 23);
      ctx.stroke();
    }
    ctx.strokeStyle = T;
    ctx.lineWidth = 2;
    ctx.fillStyle = '#33281F';
    ctx.fillRect(-4, -alt - 7, lt + 8, 8);
    const pisca = Math.sin((t || 0) * 3) > 0.2;
    ctx.fillStyle = pisca ? '#FF6A50' : '#7E3028';
    ctx.beginPath();
    ctx.arc(lt / 2, -alt - 12, 5, 0, 6.283);
    ctx.fill();
    ctx.stroke();
    /* passarela e mangueira até o foguete */
    const recolhe = 1 - Math.min(1, s * 2.2);
    if (recolhe > 0.02) {
      const yp = -alt * 0.62;
      const comp = (L - larg * 0.5 - 2) * recolhe;
      ctx.fillStyle = '#9AA3A6';
      ctx.fillRect(-comp, yp, comp, 8);
      ctx.strokeRect(-comp, yp, comp, 8);
      ctx.strokeStyle = '#33281F';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, yp + 42);
      ctx.quadraticCurveTo(-comp * 0.5, yp + 92, -comp, yp + 34);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }

  /* ---------- Peças ---------- */
  /* na ordem de FIG_POR_TIPO.capsula; as que não têm janela redonda boa ganham uma por cima */
  const JANELAS = [
    { x: 0.5, y: 0.46, r: 0.23 }, { x: 0.49, y: 0.47, r: 0.25 }, { x: 0.5, y: 0.3, r: 0.22, desenhar: true }, { x: 0.5, y: 0.5, r: 0.24, desenhar: true },
    { x: 0.5, y: 0.48, r: 0.23 }, { x: 0.54, y: 0.5, r: 0.23, desenhar: true }, { x: 0.5, y: 0.49, r: 0.23 }, { x: 0.49, y: 0.51, r: 0.24, desenhar: true },
  ];
  const janelaDe = (s, peca) => {
    const j = JANELAS[peca.nivel % JANELAS.length];
    return { cx: s.x + s.w * j.x, cy: s.y + s.h * j.y, r: s.w * j.r, desenhar: j.desenhar };
  };

  /* Mantém a proporção só no que não é parte do casco. */
  function caixaDaFigura(img, b, tipo) {
    if (tipo !== 'enfeite') return b;
    const e = Math.min(b.w / img.width, b.h / img.height);
    const w = img.width * e, h = img.height * e;
    return { x: b.x + (b.w - w) / 2, y: b.y + b.h - h, w, h };
  }

  function comTinta(ctx, img, q, tinta) {
    const c = document.createElement('canvas');
    const E = 2;
    c.width = Math.max(1, Math.ceil(q.w * E));
    c.height = Math.max(1, Math.ceil(q.h * E));
    const x = c.getContext('2d');
    x.scale(E, E);
    x.drawImage(img, 0, 0, q.w, q.h);
    const pintarCor = () => {
      if (!tinta.a) return;
      x.globalCompositeOperation = 'color';
      x.fillStyle = tinta.a;
      x.fillRect(0, 0, q.w, q.h);
      /* 'color' sozinho não escurece nem clareia: preto ficava cinza e branco, também */
      const n = parseInt(tinta.a.slice(1), 16);
      const lum = (0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255;
      if (lum < 0.3 || lum > 0.75) {
        x.globalCompositeOperation = lum < 0.3 ? 'multiply' : 'soft-light';
        x.globalAlpha = lum < 0.3 ? 0.75 : 0.9;
        x.fillRect(0, 0, q.w, q.h);
        x.globalAlpha = 1;
      }
    };
    pintarCor();
    if (tinta.padrao && tinta.padrao !== 'liso') {
      x.globalCompositeOperation = 'source-atop';
      /* sem transparência: padrão é tinta de verdade, e não uma sombra por cima da peça */
      x.globalAlpha = 0.94;
      aplicarPadrao(x, { x: 0, y: 0, w: q.w, h: q.h }, tinta.padrao, tinta.b || CREME);
      x.globalAlpha = 1;
    }
    x.globalCompositeOperation = 'destination-in';
    x.drawImage(img, 0, 0, q.w, q.h);
    ctx.drawImage(c, q.x, q.y, q.w, q.h);
  }

  function desenharPeca(ctx, peca, b, tinta, op) {
    const { img, matiz, brilho } = figuraDe(peca);
    if (img) {
      const q = caixaDaFigura(img, b, peca.tipo);
      ctx.save();
      if (matiz && 'filter' in ctx) ctx.filter = `hue-rotate(${matiz}deg) brightness(${brilho})`;
      if ((peca.tipo === 'antena' || peca.tipo === 'radar') && img.height > 0) {
        /* na folha a parabólica fica em cima da faixa: separa as duas */
        const corte = img.height * 0.46;
        ctx.drawImage(img, 0, corte, img.width, img.height - corte, q.x, q.y, q.w, q.h);
        const dw = q.w * 0.56, dh = (dw * corte) / (img.width * 0.44);
        ctx.drawImage(img, img.width * 0.28, 0, img.width * 0.44, corte, q.x + q.w * 0.78, q.y + q.h * 0.46 - dh, dw, dh);
      } else if (tinta && (tinta.a || (tinta.padrao && tinta.padrao !== 'liso'))) comTinta(ctx, img, q, tinta);
      else ctx.drawImage(img, q.x, q.y, q.w, q.h);
      ctx.restore();
    }
    if (peca.tipo === 'capsula') {
      const j = janelaDe(b, peca);
      ctx.save();
      if (j.desenhar) {
        ctx.fillStyle = '#7E878C';
        ctx.strokeStyle = TRACO;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(j.cx, j.cy, j.r + 4, 0, 6.283);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#BFE3E6';
        ctx.beginPath();
        ctx.arc(j.cx, j.cy, j.r, 0, 6.283);
        ctx.fill();
        ctx.stroke();
      }
      if (!op || !op.semPiloto) rostoNaJanela(ctx, j, op);
      ctx.restore();
    }
  }

  function rostoNaJanela(ctx, j, op) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(j.cx, j.cy, j.r - 0.5, 0, 6.283);
    ctx.clip();
    RL.Desenho.rostoCapivara(ctx, j.cx + ((op && op.balanco) || 0), j.cy + ((op && op.pulo) || 0), j.r * 1.02, op);
    ctx.restore();
  }

  function comPop(ctx, s, o, f) {
    if (o.pop && o.pop.caminho === s.caminho) {
      ctx.save();
      const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
      ctx.translate(cx, cy);
      ctx.scale(o.pop.s, o.pop.s);
      ctx.translate(-cx, -cy);
      f();
      ctx.restore();
    } else f();
  }

  /* Nome pintado no casco, logotipos e adesivos soltos, em cima de tudo. */
  function adornos(ctx, pintura, L, ordem) {
    if (pintura.nome) {
      const t = ordem.filter((s) => /^e\d+\.t/.test(s.caminho));
      if (t.length) {
        const u = t[0];
        const fim = t.filter((q) => q.caminho.split('.')[0] === u.caminho.split('.')[0]).pop();
        const alt = fim.y + fim.h - u.y;
        ctx.save();
        ctx.translate(u.x + u.w * 0.24, u.y + alt / 2);
        ctx.rotate(-1.5708);
        let tam = 17;
        ctx.font = `400 ${tam}px 'Lilita One',sans-serif`;
        const larg = ctx.measureText(pintura.nome).width;
        if (larg > alt - 6) {
          tam = Math.max(7, (tam * (alt - 6)) / larg);
          ctx.font = `400 ${tam}px 'Lilita One',sans-serif`;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = TRACO;
        ctx.lineWidth = 2.6;
        ctx.lineJoin = 'round';
        ctx.strokeText(pintura.nome, 0, 0);
        ctx.fillStyle = '#F7F4EA';
        ctx.fillText(pintura.nome, 0, 0);
        ctx.restore();
      }
    }
    const logos = (pintura.marcas || []).map((id) => RL.MARCA[id]).filter(Boolean);
    if (logos.length) {
      const t = ordem.filter((s) => /^e\d+\.t/.test(s.caminho));
      const lugares = t.length ? t : ordem.filter((s) => s.caminho === 'capsula');
      logos.forEach((m, i) => {
        const livre = pintura.marcaPos && pintura.marcaPos[m.id];
        if (livre) {
          if (livre.y > L.altura) return;
          ctx.save();
          ctx.translate(livre.x, livre.y);
          ctx.rotate(livre.r || 0);
          logoMarca(ctx, m, 0, 0, (livre.s || 22) * 3.4, livre.s || 22);
          ctx.restore();
          return;
        }
        const u = lugares[i % lugares.length];
        const h = Math.min(22, u.h * 0.42);
        const y = u.y + u.h * 0.5 + (lugares.length === 1 ? (i - (logos.length - 1) / 2) * (h + 2) : 0);
        logoMarca(ctx, m, u.x + u.w * 0.5, y, u.w * 0.84, h);
      });
    }
    for (const a of pintura.adesivos || []) {
      if (a.y > L.altura) continue;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.r || 0);
      if (a.espelho) ctx.scale(-1, 1);
      adesivo(ctx, a.id, 0, 0, a.s || 22, a.cor);
      ctx.restore();
    }
  }

  /* Foguete inteiro. O ponto (0,0) do canvas é o centro no topo. */
  function desenharFoguete(ctx, build, pintura, op) {
    const o = op || {};
    const L = layout(build, o.lim || null, { desde: o.desde });
    const pecas = pintura ? pintura.pecas : {};
    const ordem = L.slots.filter((s) => s.id);
    for (const s of ordem) {
      if (!s.espelho) continue;
      const p = RL.PECAS[s.id];
      comPop(ctx, s, o, () => desenharPeca(ctx, p, s, pecas[s.caminho], o));
      ctx.save();
      ctx.scale(-1, 1);
      comPop(ctx, s, o, () => desenharPeca(ctx, p, s, pecas[s.caminho], o));
      ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle = TRACO;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    for (const j of L.juntas) {
      ctx.fillStyle = '#7E878C';
      ctx.beginPath();
      ctx.moveTo(-j.w0 / 2, j.y - 1);
      ctx.lineTo(j.w0 / 2, j.y - 1);
      ctx.lineTo(j.w1 / 2, j.y + j.h + 1);
      ctx.lineTo(-j.w1 / 2, j.y + j.h + 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    /* de baixo para cima: cada seção cobre a emenda da seguinte */
    for (const s of [...ordem].reverse()) {
      if (s.espelho) continue;
      comPop(ctx, s, o, () => desenharPeca(ctx, RL.PECAS[s.id], s, pecas[s.caminho], o));
    }
    /* o aro do escudo fica por fora de tudo, senão a ogiva e a cápsula o escondem */
    for (const s of ordem) if (s.tipo === 'escudo') comPop(ctx, s, o, () => desenharPeca(ctx, RL.PECAS[s.id], s, pecas[s.caminho], o));
    /* flange de metal em cada emenda: é o que faz o foguete parecer montado */
    const pilhaReal = ordem.filter((q) => !q.espelho && q.tipo !== 'enfeite').sort((a, b) => a.y - b.y);
    for (let i = 1; i < pilhaReal.length; i++) {
      const a = pilhaReal[i - 1], c = pilhaReal[i];
      if (a.tipo === 'bico' && c.tipo === 'escudo') continue;
      const yj = c.y + 1;
      const lf = Math.min(a.w, c.w) * (c.tipo === 'motor' ? 0.74 : 0.94);
      ctx.save();
      ctx.strokeStyle = TRACO;
      ctx.lineWidth = 1.7;
      ctx.fillStyle = '#7E878C';
      ctx.beginPath();
      ctx.roundRect(-lf / 2, yj - 4, lf, 8, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.34)';
      ctx.fillRect(-lf / 2 + 3, yj - 2.6, lf - 6, 2);
      ctx.fillStyle = TRACO;
      const n = Math.max(3, Math.round(lf / 16));
      for (let k = 0; k < n; k++) {
        ctx.beginPath();
        ctx.arc(-lf / 2 + ((k + 0.5) * lf) / n, yj + 1.2, 1.1, 0, 6.283);
        ctx.fill();
      }
      ctx.restore();
    }
    if (pintura) adornos(ctx, pintura, L, ordem);
    return L;
  }

  /* ---------- Foguete pronto em imagem, para não remontar a cada quadro ---------- */
  const SPRITE_ESC = 2, SPRITE_L = 360, SPRITE_M = 40;
  const sprites = new Map();

  function spriteFoguete(build, pintura, o) {
    const chave = JSON.stringify([build, pintura ? [pintura.pecas, pintura.adesivos, pintura.nome, pintura.marcas, pintura.marcaPos] : 0, o.desde || 0, o.lim || 0]);
    let sp = sprites.get(chave);
    if (sp) return sp;
    const L = layout(build, o.lim || null, { desde: o.desde });
    const c = document.createElement('canvas');
    c.width = SPRITE_L * SPRITE_ESC;
    c.height = (L.altura + SPRITE_M * 2) * SPRITE_ESC;
    const x = c.getContext('2d');
    x.scale(SPRITE_ESC, SPRITE_ESC);
    x.translate(SPRITE_L / 2, SPRITE_M);
    desenharFoguete(x, build, pintura, { desde: o.desde, semPiloto: true, lim: o.lim });
    sp = { c, L, h: L.altura + SPRITE_M * 2 };
    sprites.set(chave, sp);
    if (sprites.size > 16) sprites.delete(sprites.keys().next().value);
    return sp;
  }

  /* Desenha a imagem pronta e, por cima, só o rosto vivo na janela. */
  function pintarSprite(ctx, build, pintura, o) {
    const sp = spriteFoguete(build, pintura, o);
    ctx.drawImage(sp.c, -SPRITE_L / 2, -SPRITE_M, SPRITE_L, sp.h);
    const s = sp.L.slots.find((q) => q.caminho === 'capsula');
    if (s && s.id && !o.semPiloto) rostoNaJanela(ctx, janelaDe(s, RL.PECAS[s.id]), o);
    return sp.L;
  }

  /* Chama de três camadas com borda viva. */
  function chama(ctx, x, y, w, comp, cor, t, seed) {
    const tempo = t || 0;
    const fase = seed || 0;
    const forma = (l, c, f) => {
      ctx.beginPath();
      ctx.moveTo(x - l / 2, y);
      const n = 6;
      for (let i = 1; i <= n; i++) {
        const k = i / n;
        const larg = (l / 2) * (1 - k) ** 0.75;
        const os = Math.sin(tempo * 26 + fase + i * 1.9) * l * 0.1 * (0.3 + k);
        ctx.lineTo(x - larg + os, y + c * k);
      }
      ctx.lineTo(x + Math.sin(tempo * 31 + fase) * l * 0.12, y + c);
      for (let i = n; i >= 1; i--) {
        const k = i / n;
        const larg = (l / 2) * (1 - k) ** 0.75;
        const os = Math.sin(tempo * 23 + fase + i * 2.3) * l * 0.1 * (0.3 + k);
        ctx.lineTo(x + larg + os, y + c * k);
      }
      ctx.lineTo(x + l / 2, y);
      ctx.closePath();
      ctx.fillStyle = f;
      ctx.fill();
    };
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = TRACO;
    ctx.lineWidth = 1.8;
    forma(w, comp, cor || '#E08A3C');
    ctx.stroke();
    forma(w * 0.68, comp * 0.68, '#F0CF62');
    forma(w * 0.34, comp * 0.36, '#FFF8DC');
    ctx.restore();
  }

  function miniatura(peca, S) {
    S = S || 92;
    const c = document.createElement('canvas');
    const dpr = 2;
    c.width = S * dpr;
    c.height = S * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    const k = S / 92;
    const tam = {
      bico: [64, 78], capsula: [70, 78], tanque: [70, 60], motor: [66, 62], aleta: [54, 80], lateral: [30, 84],
      escudo: [76, 30], gerador: [78, 42], antena: [78, 52], ima: [78, 50], carga: [78, 42], enfeite: [66, 66], cofre: [78, 42], radar: [78, 52], paraquedas: [78, 42],
    }[peca.tipo];
    const b = { x: (S - tam[0] * k) / 2, y: (S - tam[1] * k) / 2, w: tam[0] * k, h: tam[1] * k };
    desenharPeca(ctx, peca, b, null, { semPiloto: true });
    c.className = 'mini';
    return c;
  }

  RL.Desenho = { aplicarPadrao, layout, desenharFoguete, desenharPeca, pintarSprite, logoMarca, plataforma, chama, miniatura, adesivo, TRACO, W };
})();
