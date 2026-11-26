/* Fundos em aquarela pintados por código. Serão trocados pela arte final depois. */
(function () {
  const RL = window.RL;

  function gerador(s) {
    return function () {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function tela(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function pincel(ctx, r, x, y, rx, ry, cor, alfa, camadas) {
    camadas = camadas || 5;
    const f1 = r() * 6.28, f2 = r() * 6.28, f3 = r() * 6.28;
    ctx.fillStyle = cor;
    for (let c = 0; c < camadas; c++) {
      ctx.globalAlpha = (alfa / camadas) * 1.7;
      ctx.beginPath();
      const abre = 1 + c * 0.035;
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * 6.283;
        const d = 1 + 0.13 * Math.sin(a * 3 + f1) + 0.08 * Math.sin(a * 7 + f2) + 0.05 * Math.sin(a * 13 + f3) + (r() - 0.5) * 0.09;
        const px = x + Math.cos(a) * rx * d * abre, py = y + Math.sin(a) * ry * d * abre;
        if (i) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function copa(ctx, r, cx, cy, w, h, p, alfa) {
    alfa = alfa || 1;
    let i, a, d;
    for (i = 0; i < 34; i++) {
      a = r() * 6.28; d = Math.sqrt(r());
      pincel(ctx, r, cx + Math.cos(a) * w * d, cy + Math.sin(a) * h * d, 34 + r() * 26, 28 + r() * 20, p[0], 0.75 * alfa, 3);
    }
    for (i = 0; i < 70; i++) {
      a = r() * 6.28; d = Math.sqrt(r());
      pincel(ctx, r, cx + Math.cos(a) * w * d * 0.95, cy + Math.sin(a) * h * d * 0.92 - 10, 14 + r() * 20, 10 + r() * 15, p[1], 0.62 * alfa, 3);
    }
    for (i = 0; i < 90; i++) {
      a = r() * 6.28; d = Math.sqrt(r());
      pincel(ctx, r, cx + Math.cos(a) * w * d * 0.86 - w * 0.1, cy + Math.sin(a) * h * d * 0.82 - h * 0.2, 6 + r() * 14, 5 + r() * 10, p[2], 0.6 * alfa, 2);
    }
    for (i = 0; i < 55; i++) {
      a = r() * 6.28; d = 0.8 + r() * 0.28;
      pincel(ctx, r, cx + Math.cos(a) * w * d, cy + Math.sin(a) * h * d, 3 + r() * 6, 2 + r() * 5, p[r() < 0.5 ? 1 : 0], 0.55 * alfa, 2);
    }
  }

  function tronco(ctx, r, x0, y0, x1, y1, l0, l1, cor, escuro) {
    for (let i = 0; i < 46; i++) {
      const t = i / 45, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, l = l0 + (l1 - l0) * t;
      pincel(ctx, r, x, y, l, 9, cor, 0.6, 2);
      if (i % 2 === 0) pincel(ctx, r, x + l * 0.45, y, l * 0.32, 10, escuro, 0.32, 2);
    }
  }

  function grao(ctx, r, forca) {
    const c = ctx.canvas;
    const im = ctx.getImageData(0, 0, c.width, c.height), p = im.data;
    for (let i = 0; i < p.length; i += 4) {
      const n = (r() - 0.5) * forca;
      p[i] += n; p[i + 1] += n; p[i + 2] += n;
    }
    ctx.putImageData(im, 0, 0);
  }

  const VERDES = ['#4F7A3A', '#6E9A45', '#A3C062'];
  const PALIDOS = ['#92AE94', '#A8BFA3', '#BFD0B2'];

  /* Bairro: o quintal de onde tudo começa. */
  function parque() {
    const c = tela(1100, 700), ctx = c.getContext('2d'), r = gerador(11);
    let g = ctx.createLinearGradient(0, 0, 0, 480);
    g.addColorStop(0, '#AFCBCF');
    g.addColorStop(1, '#E4E5D0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1100, 700);
    for (let i = 0; i < 20; i++) pincel(ctx, r, r() * 1100, r() * 270, 70 + r() * 110, 18 + r() * 28, '#F2F0E2', 0.32, 4);
    for (let i = 0; i < 10; i++) pincel(ctx, r, r() * 1100, r() * 220, 60 + r() * 90, 14 + r() * 20, '#9DBDC4', 0.14, 4);
    copa(ctx, r, 170, 400, 230, 86, PALIDOS, 0.8);
    copa(ctx, r, 950, 400, 210, 80, PALIDOS, 0.8);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#A9B6B5';
    ctx.fillRect(760, 360, 110, 100);
    ctx.beginPath();
    ctx.moveTo(744, 362); ctx.lineTo(815, 310); ctx.lineTo(886, 362);
    ctx.fill();
    ctx.fillStyle = '#8FA1A3';
    ctx.fillRect(782, 386, 18, 22);
    ctx.fillRect(830, 386, 18, 22);
    ctx.globalAlpha = 1;
    g = ctx.createLinearGradient(0, 450, 0, 700);
    g.addColorStop(0, '#A5BE79');
    g.addColorStop(1, '#7C9C58');
    ctx.fillStyle = g;
    ctx.fillRect(0, 452, 1100, 248);
    for (let i = 0; i < 150; i++) pincel(ctx, r, r() * 1100, 462 + r() * 238, 20 + r() * 64, 4 + r() * 12, r() < 0.5 ? '#6F9149' : '#B7CB83', 0.3, 2);
    for (let i = 0; i < 34; i++) {
      const t = i / 33;
      pincel(ctx, r, 760 - t * 280 + Math.sin(t * 3) * 60, 464 + t * 240, 22 + t * 84, 8 + t * 12, '#DDD09A', 0.72, 3);
    }
    tronco(ctx, r, 130, 660, 170, 330, 54, 22, '#8C5C47', '#5B3A30');
    copa(ctx, r, 160, 190, 250, 170, VERDES);
    tronco(ctx, r, 1020, 590, 992, 300, 32, 15, '#936450', '#5B3A30');
    copa(ctx, r, 985, 140, 190, 136, VERDES);
    pincel(ctx, r, 900, 590, 66, 46, '#8D8F8D', 0.85, 5);
    pincel(ctx, r, 884, 574, 40, 24, '#B5B5AE', 0.55, 4);
    pincel(ctx, r, 915, 616, 52, 14, '#5F7248', 0.4, 3);
    for (let i = 0; i < 40; i++) pincel(ctx, r, 40 + r() * 190, 632 + r() * 40, 6 + r() * 14, 4 + r() * 8, VERDES[(r() * 3) | 0], 0.6, 2);
    grao(ctx, r, 11);
    return c;
  }

  /* Faixas do céu: tiras verticais sem emenda para rolar durante o voo. */
  const FAIXAS_CEU = {
    ceu: { base: ['#A6CBD6', '#C8DBD6'], manchas: [['#F4F2E6', 0.34], ['#94BCCB', 0.16]], estrelas: 0 },
    alto: { base: ['#6C9EC2', '#8FB6CC'], manchas: [['#E7EBE2', 0.18], ['#5788B0', 0.22]], estrelas: 0 },
    borda: { base: ['#31477F', '#4A6A9E'], manchas: [['#22325F', 0.26], ['#6C8DB5', 0.14]], estrelas: 40 },
    orbita: { base: ['#1F2146', '#2B3060'], manchas: [['#2C4F6D', 0.2], ['#46386F', 0.2], ['#161634', 0.22]], estrelas: 200 },
    vazio: { base: ['#1E1B3A', '#2C2350'], manchas: [['#5B3F78', 0.2], ['#2C3F6D', 0.18], ['#12122A', 0.25], ['#7A4A7E', 0.09]], estrelas: 300 },
    lua: { base: ['#23264A', '#34345E'], manchas: [['#4A5578', 0.2], ['#6B6187', 0.14], ['#191C3A', 0.2]], estrelas: 240 },
  };
  FAIXAS_CEU.bairro = FAIXAS_CEU.ceu;
  FAIXAS_CEU.alem = FAIXAS_CEU.vazio;

  function faixaCeu(id, semente) {
    const conf = FAIXAS_CEU[id], S = 720;
    const c = tela(S, S), ctx = c.getContext('2d'), r = gerador(semente);
    ctx.fillStyle = conf.base[0];
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 26; i++) {
      const x = r() * S, y = r() * S, rx = 90 + r() * 170, ry = 40 + r() * 90;
      const seed = r() * 1e6;
      for (const dy of [0, -S, S]) pincel(ctx, gerador(seed), x, y + dy, rx, ry, conf.base[1], 0.28, 3);
    }
    for (const [cor, alfa] of conf.manchas) {
      for (let i = 0; i < 16; i++) {
        const x = r() * S, y = r() * S, rx = 50 + r() * 130, ry = 20 + r() * 70;
        const seed = r() * 1e6;
        for (const dy of [0, -S, S]) pincel(ctx, gerador(seed), x, y + dy, rx, ry, cor, alfa, 3);
      }
    }
    for (let i = 0; i < conf.estrelas; i++) {
      ctx.globalAlpha = 0.35 + r() * 0.6;
      ctx.fillStyle = r() < 0.8 ? '#EFE8CF' : '#BFD6E8';
      ctx.beginPath();
      ctx.arc(r() * S, r() * S, r() * r() * 2.4 + 0.5, 0, 6.28);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    grao(ctx, r, 9);
    return c;
  }

  function nuvem(semente, escura) {
    const c = tela(340, 170), ctx = c.getContext('2d'), r = gerador(semente);
    const cor = escura ? '#C7D2D6' : '#F7F5EA';
    for (let i = 0; i < 26; i++) {
      const a = r() * 6.28, d = Math.sqrt(r());
      pincel(ctx, r, 170 + Math.cos(a) * 110 * d, 92 + Math.sin(a) * 34 * d, 26 + r() * 34, 16 + r() * 22, cor, 0.5, 3);
    }
    return c;
  }

  function lua() {
    const S = 620, c = tela(S, S), ctx = c.getContext('2d'), r = gerador(27);
    const m = S / 2, R = S / 2 - 6;
    ctx.save();
    ctx.beginPath();
    ctx.arc(m, m, R, 0, 6.283);
    ctx.fillStyle = '#DDD7B8';
    ctx.fill();
    ctx.clip();
    pincel(ctx, r, m, m, R * 1.1, R * 1.1, '#CFC9AA', 0.5, 5);
    for (let i = 0; i < 90; i++) {
      const a = r() * 6.28, d = Math.sqrt(r()) * R;
      pincel(ctx, r, m + Math.cos(a) * d, m + Math.sin(a) * d, 16 + r() * 60, 12 + r() * 40, r() < 0.6 ? '#B5AF90' : '#EAE5CC', 0.3, 3);
    }
    for (let i = 0; i < 18; i++) {
      const a = r() * 6.28, d = Math.sqrt(r()) * R * 0.92, e = 10 + r() * 34;
      const x = m + Math.cos(a) * d, y = m + Math.sin(a) * d;
      pincel(ctx, r, x, y, e, e * 0.92, '#9A9478', 0.5, 4);
      pincel(ctx, r, x + e * 0.2, y + e * 0.2, e * 0.66, e * 0.6, '#BDB798', 0.4, 3);
    }
    ctx.restore();
    grao(ctx, r, 8);
    return c;
  }

  function terra() {
    const S = 900, c = tela(S, S), ctx = c.getContext('2d'), r = gerador(5);
    const m = S / 2, R = S / 2 - 8;
    ctx.save();
    ctx.beginPath();
    ctx.arc(m, m, R, 0, 6.283);
    ctx.fillStyle = '#3E7EA6';
    ctx.fill();
    ctx.clip();
    for (let i = 0; i < 26; i++) {
      const a = r() * 6.28, d = Math.sqrt(r()) * R;
      pincel(ctx, r, m + Math.cos(a) * d, m + Math.sin(a) * d, 60 + r() * 130, 40 + r() * 90, '#5A9CBD', 0.3, 3);
    }
    for (let i = 0; i < 9; i++) {
      const a = r() * 6.28, d = Math.sqrt(r()) * R * 0.85, x = m + Math.cos(a) * d, y = m + Math.sin(a) * d;
      for (let k = 0; k < 14; k++) pincel(ctx, r, x + (r() - 0.5) * 170, y + (r() - 0.5) * 140, 26 + r() * 60, 20 + r() * 44, r() < 0.7 ? '#7A9B4E' : '#A99A5E', 0.75, 3);
    }
    for (let i = 0; i < 42; i++) {
      const a = r() * 6.28, d = Math.sqrt(r()) * R;
      pincel(ctx, r, m + Math.cos(a) * d, m + Math.sin(a) * d, 30 + r() * 110, 8 + r() * 22, '#F6F4EA', 0.34, 3);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(m, m, R, 0, 6.283);
    ctx.strokeStyle = 'rgba(190,225,240,.7)';
    ctx.lineWidth = 8;
    ctx.stroke();
    grao(ctx, r, 7);
    return c;
  }

  /* Superfície da Lua para o final. */
  function soloLua() {
    const c = tela(1100, 700), ctx = c.getContext('2d'), r = gerador(44);
    const g = ctx.createLinearGradient(0, 0, 1100, 700);
    g.addColorStop(0, '#1E1B3A');
    g.addColorStop(1, '#2C2350');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1100, 700);
    for (let i = 0; i < 30; i++) pincel(ctx, r, r() * 1100, r() * 460, 80 + r() * 160, 40 + r() * 90, ['#5B3F78', '#2C3F6D', '#12122A'][(r() * 3) | 0], 0.2, 3);
    for (let i = 0; i < 320; i++) {
      ctx.globalAlpha = 0.35 + r() * 0.6;
      ctx.fillStyle = '#EFE8CF';
      ctx.beginPath();
      ctx.arc(r() * 1100, r() * 460, r() * r() * 2.6 + 0.5, 0, 6.28);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(880, 150);
    ctx.scale(0.26, 0.26);
    ctx.translate(-450, -450);
    ctx.drawImage(terra(), 0, 0);
    ctx.restore();
    ctx.fillStyle = '#CFC9AA';
    ctx.beginPath();
    ctx.moveTo(0, 500);
    for (let x = 0; x <= 1100; x += 22) ctx.lineTo(x, 490 + Math.sin(x / 140) * 22 + Math.sin(x / 47) * 6);
    ctx.lineTo(1100, 700);
    ctx.lineTo(0, 700);
    ctx.fill();
    for (let i = 0; i < 110; i++) pincel(ctx, r, r() * 1100, 510 + r() * 190, 16 + r() * 70, 5 + r() * 16, r() < 0.5 ? '#B5AF90' : '#E0DAC0', 0.34, 2);
    for (let i = 0; i < 14; i++) {
      const x = r() * 1100, y = 530 + r() * 150, e = 20 + r() * 50;
      pincel(ctx, r, x, y, e, e * 0.3, '#9A9478', 0.6, 3);
      pincel(ctx, r, x + 4, y + 3, e * 0.7, e * 0.18, '#BDB798', 0.5, 2);
    }
    grao(ctx, r, 9);
    return c;
  }

  /* O quintal com o céu apagado para se fundir com o céu do voo. */
  function parqueVoo() {
    const o = parque();
    const c = tela(o.width, o.height), ctx = c.getContext('2d');
    ctx.drawImage(o, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    const g = ctx.createLinearGradient(0, 0, 0, 300);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.45, 'rgba(0,0,0,.9)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, 300);
    return c;
  }

  /* ---------- Arte final (Runway), com a pintura por código como reserva ---------- */
  const ARTE = {};
  const ARQ = ['quintal', 'ceu', 'alto', 'borda', 'orbita', 'vazio', 'lua', 'terra', 'solo-lua'];

  function carregarArte(aoFim) {
    let falta = ARQ.length;
    const passo = () => { if (--falta === 0) aoFim(); };
    for (const n of ARQ) {
      const im = new Image();
      im.onload = () => { ARTE[n] = im; passo(); };
      im.onerror = passo;
      im.src = 'arte/fundos/' + n + '.jpg';
    }
  }

  /* Céu que emenda: a imagem e o espelho dela, um embaixo do outro. */
  function faixaArte(nome, filtro, margem) {
    const im = ARTE[nome];
    const S = 900, c = tela(S, S * 2), ctx = c.getContext('2d');
    const m = margem || 0;
    const sw = im.width * (1 - m * 2), sh = im.height * (1 - m * 2), sx = im.width * m, sy = im.height * m;
    if (filtro) ctx.filter = filtro;
    ctx.drawImage(im, sx, sy, sw, sh, 0, 0, S, S);
    ctx.save();
    ctx.translate(0, S * 2);
    ctx.scale(1, -1);
    ctx.drawImage(im, sx, sy, sw, sh, 0, 0, S, S);
    ctx.restore();
    return c;
  }

  function discoArte(nome, fx, fy, fr) {
    const im = ARTE[nome];
    const S = 900, c = tela(S, S), ctx = c.getContext('2d');
    const r = im.width * fr, e = (S / 2 - 2) / r;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 2, 0, 6.283);
    ctx.clip();
    ctx.drawImage(im, S / 2 - im.width * fx * e, S / 2 - im.height * fy * e, im.width * e, im.height * e);
    return c;
  }

  /* Planetas: a mesma pintura da Lua, tingida, com faixas de pincel por cima. */
  const PLANETAS = {
    marte: { filtro: 'sepia(1) saturate(3.4) hue-rotate(-28deg) brightness(.82)' },
    jupiter: { filtro: 'sepia(1) saturate(1.5) brightness(.98)', faixas: ['#A8693F', '#E8D2A8', '#9A5B38', '#F0E0C0', '#B87A4E'] },
    saturno: { filtro: 'sepia(1) saturate(1.3) brightness(1.05)', faixas: ['#D8BE84', '#F0E2B8', '#C8A96C'], anel: true },
    urano: { filtro: 'sepia(1) saturate(2.2) hue-rotate(130deg) brightness(1.05)' },
    netuno: { filtro: 'sepia(1) saturate(3.2) hue-rotate(170deg) brightness(.68)', faixas: ['#3E5FA8', '#6E8ED0'] },
    plutao: { filtro: 'sepia(.7) saturate(1.1) brightness(.92)' },
  };

  function planeta(id) {
    const conf = PLANETAS[id];
    const S = 900, c = tela(S * 2, S), ctx = c.getContext('2d'), r = gerador(id.length * 37);
    const cx = S, cy = S / 2, R = S * 0.27;
    const base = lua();
    const desenhaAnel = (fundo) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.28);
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 2.05, R * 0.56, 0, fundo ? 3.1416 : 0, fundo ? 6.283 : 3.1416);
      ctx.lineWidth = R * 0.26;
      ctx.strokeStyle = '#E8D8A8';
      ctx.stroke();
      ctx.lineWidth = R * 0.05;
      ctx.strokeStyle = '#A8905C';
      ctx.stroke();
      ctx.restore();
    };
    if (conf.anel) desenhaAnel(true);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 6.283);
    ctx.clip();
    if (ARTE.lua) {
      ctx.filter = conf.filtro;
      ctx.drawImage(base === undefined ? ARTE.lua : pegar('lua', () => discoArte('lua', 0.5, 0.496, 0.452)), cx - R, cy - R, R * 2, R * 2);
      ctx.filter = 'none';
    } else {
      ctx.fillStyle = '#B88A5E';
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    }
    if (conf.faixas) {
      for (let i = 0; i < 16; i++) {
        const y = cy - R + (R * 2 * (i + 0.5)) / 16 + (r() - 0.5) * 12;
        pincel(ctx, r, cx, y, R * 1.3, R * (0.05 + r() * 0.06), conf.faixas[i % conf.faixas.length], 0.55, 3);
      }
    }
    ctx.restore();
    if (conf.anel) desenhaAnel(false);
    return c;
  }

  /* Nuvem recortada da própria aquarela do céu, com borda que some aos poucos. */
  function nuvemArte(i) {
    const W = 520, H = 260, c = tela(W, H), ctx = c.getContext('2d');
    const im = ARTE.ceu;
    const lugares = [[0.04, 0.12], [0.45, 0.5], [0.08, 0.68]];
    const [fx, fy] = lugares[i % lugares.length];
    ctx.drawImage(im, im.width * fx, im.height * fy, im.width * 0.5, im.height * 0.25, 0, 0, W, H);
    /* clareia sem apagar a textura do papel */
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255,250,235,.56)';
    ctx.fillRect(0, 0, W, H);
    /* contorno de nuvem: vários gomos, não uma elipse só */
    const mascara = tela(W, H), m = mascara.getContext('2d');
    for (let k = 0; k < 9; k++) {
      const t = (k + 0.5) / 9;
      const cx = W * (0.14 + t * 0.72);
      const cy = H * (0.6 - Math.sin(t * Math.PI) * 0.18 + (((k * 7 + i * 3) % 5) - 2) * 0.03);
      const r = H * (0.17 + Math.sin(t * Math.PI) * 0.17 + ((k * 5 + i) % 3) * 0.018);
      const g = m.createRadialGradient(cx, cy, r * 0.62, cx, cy, r);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      m.fillStyle = g;
      m.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mascara, 0, 0);
    return c;
  }

  function comoCanvas(im) {
    const c = tela(im.width, im.height);
    c.getContext('2d').drawImage(im, 0, 0);
    return c;
  }

  function parqueArte() {
    return ARTE.quintal ? comoCanvas(ARTE.quintal) : parque();
  }

  function parqueVooArte() {
    if (!ARTE.quintal) return parqueVoo();
    const c = comoCanvas(ARTE.quintal), ctx = c.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    const H = c.height * 0.62;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.5, 'rgba(0,0,0,.92)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, H);
    return c;
  }

  function faixaFinal(id) {
    const conf = {
      bairro: ['ceu'], ceu: ['ceu'], alto: ['alto'], borda: ['borda', null, 0.04], orbita: ['orbita'], vazio: ['vazio'],
      lua: ['orbita', 'hue-rotate(-34deg) saturate(.72) brightness(.82)'],
      alem: ['vazio', 'hue-rotate(70deg) saturate(.8) brightness(.8)'],
    }[id];
    if (ARTE[conf[0]]) return faixaArte(conf[0], conf[1], conf[2]);
    return faixaCeu(id, 100 + id.length * 13 + id.charCodeAt(0));
  }

  /* Aguada: manchas de pigmento em fundo transparente, aplicadas por cima de personagens e foguete. */
  function textura() {
    const S = 700, c = tela(S, S), ctx = c.getContext('2d'), r = gerador(61);
    for (let i = 0; i < 46; i++) pincel(ctx, r, r() * S, r() * S, 30 + r() * 90, 24 + r() * 70, '#4A3524', 0.13, 3);
    for (let i = 0; i < 42; i++) pincel(ctx, r, r() * S, r() * S, 22 + r() * 70, 18 + r() * 54, '#FFF9EA', 0.17, 3);
    for (let i = 0; i < 26; i++) pincel(ctx, r, r() * S, r() * S, 8 + r() * 22, 6 + r() * 18, '#4A3524', 0.14, 2);
    ctx.fillStyle = '#4A3524';
    for (let i = 0; i < 2600; i++) {
      ctx.globalAlpha = r() * 0.1;
      ctx.fillRect(r() * S, r() * S, 1.4, 1.4);
    }
    ctx.globalAlpha = 1;
    return c;
  }

  const cache = {};
  function pegar(nome, f) {
    if (!cache[nome]) cache[nome] = f();
    return cache[nome];
  }

  RL.Pintura = {
    textura: () => pegar('textura', textura),
    planeta: (id) => pegar('planeta-' + id, () => planeta(id)),
    parque: () => pegar('parque', parqueArte),
    parqueVoo: () => pegar('parqueVoo', parqueVooArte),
    faixa: (id) => pegar('faixa-' + id, () => faixaFinal(id)),
    nuvem: (i) => pegar('nuvem-' + i, () => (ARTE.ceu ? nuvemArte(i) : nuvem(200 + i * 7, i % 2 === 1))),
    lua: () => pegar('lua', () => (ARTE.lua ? discoArte('lua', 0.5, 0.496, 0.452) : lua())),
    terra: () => pegar('terra', () => (ARTE.terra ? discoArte('terra', 0.4905, 0.493, 0.42) : terra())),
    soloLua: () => pegar('soloLua', () => (ARTE['solo-lua'] ? comoCanvas(ARTE['solo-lua']) : soloLua())),
    /* Carrega a arte e prepara tudo aos poucos, sem travar a tela. */
    /* troca uma pintura pronta (a Lua, a Terra e as nuvens vêm da cena WebGPU quando há placa) */
    usar(nome, c) {
      cache[nome] = c;
    },
    prepararTudo(aoAvancar, aoFim) {
      const comecar = (seguir) => (RL.CenaGPU ? RL.CenaGPU.assar().then(seguir, seguir) : seguir());
      carregarArte(() => comecar(() => {
        const fila = [
          () => this.parque(), () => this.parqueVoo(), () => this.faixa('ceu'), () => this.faixa('alto'), () => this.faixa('borda'), () => this.faixa('orbita'),
          () => this.faixa('vazio'), () => this.faixa('lua'), () => this.faixa('alem'), () => this.nuvem(0), () => this.nuvem(1), () => this.nuvem(2), () => this.lua(), () => this.terra(), () => this.soloLua(),
        ];
        let i = 0;
        const prox = () => {
          if (i >= fila.length) return aoFim();
          fila[i++]();
          aoAvancar(i / fila.length);
          setTimeout(prox, 0);
        };
        prox();
      }));
    },
    /* Coloca uma pintura cobrindo o canvas inteiro, sem distorcer. */
    cobrir(ctx, img, W, H, dy) {
      const e = Math.max(W / img.width, H / img.height);
      const w = img.width * e, h = img.height * e;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2 + (dy || 0), w, h);
    },
  };
})();
