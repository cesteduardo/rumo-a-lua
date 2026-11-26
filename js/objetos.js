/* Tudo que cruza o caminho do foguete: figura pintada, animação simples e raio de colisão. */
(function () {
  const RL = window.RL;

  /* ESCALA ÚNICA DO MUNDO. w e r estão na mesma unidade do foguete (corpo = 78, foguete inicial
     com cerca de 285 de altura). Tudo é desenhado com a escala do foguete, então ninguém no céu
     é maior que ele, e quanto mais o foguete cresce, menor o avião fica ao lado. Paisagem fica
     ao longe (corre mais devagar) e é menor que o foguete inicial mesmo de perto. */
  const OBJ = {
    moeda: { w: 30, r: 14, tipo: 'moeda', anima: 'gira' },
    anel: { w: 160, r: 50, tipo: 'anel', img: 'escudo0', anima: 'anel' },
    galao: { w: 44, r: 21, tipo: 'galao', anima: 'boia' },
    kit: { w: 50, r: 23, tipo: 'kit', anima: 'boia' },
    caixa: { w: 62, r: 28, tipo: 'caixa', anima: 'pula' },
    /* Quem mora no céu é paisagem: passa ao fundo e não bate. */
    passaro: { w: 26, r: 0, tipo: 'decor', anima: 'voa', vira: true },
    balao: { w: 104, r: 0, tipo: 'decor', anima: 'deriva' },
    aviao: { w: 170, r: 0, tipo: 'decor', anima: 'plana', vira: true },
    meteo: { w: 52, r: 0, tipo: 'decor', anima: 'deriva' },
    lixo: { w: 86, r: 34, tipo: 'perigo', dano: 12, anima: 'roda' },
    satelite: { w: 190, r: 30, hx: 54, tipo: 'perigo', dano: 16, anima: 'rodaLento' },
    meteoro: { w: 130, r: 25, tipo: 'perigo', dano: 22, anima: 'meteoro' },
    refri: { w: 88, r: 46, tipo: 'absurdo', anima: 'gangorra' },
    sofa: { w: 124, r: 48, tipo: 'absurdo', anima: 'gangorra' },
    pato: { w: 200, r: 78, tipo: 'absurdo', anima: 'gangorra' },
    /* Segredo: ele avisou. */
    tatuVacuo: { w: 70, r: 34, tipo: 'absurdo', img: 'tatu', anima: 'gangorra' },
    /* Anúncios: não batem, só existem, e ficam longe (por isso correm menos). */
    faixa: { w: 100, r: 0, tipo: 'decor', img: 'aviao', anima: 'faixa', vira: true },
    dirigivel: { w: 240, r: 0, tipo: 'decor', anima: 'dirigivel' },
    outdoor: { w: 230, r: 0, tipo: 'decor', anima: 'outdoor' },
  };
  /* Quem dá ponto ou dano nunca fica pequeno a ponto de não dar para ver. */
  const ESC_MIN_JOGO = 0.72;
  RL.zoomObjeto = (nome, esc) => (OBJ[nome].tipo === 'decor' ? esc : Math.max(ESC_MIN_JOGO, esc));

  /* O que aparece em cada faixa, com peso. */
  RL.PERIGOS_POR_FAIXA = [
    [['passaro', 3], ['balao', 1]],
    [['passaro', 2], ['balao', 2], ['aviao', 1]],
    [['aviao', 2], ['meteo', 3], ['meteoro', 2]],
    [['lixo', 3], ['satelite', 2], ['meteo', 1]],
    [['lixo', 2], ['satelite', 3], ['meteoro', 1]],
    [['meteoro', 3], ['lixo', 1]],
    [['meteoro', 4], ['lixo', 1]],
    [['meteoro', 3], ['lixo', 2]],
  ];

  /* Desenha só um pedaço da figura (frações), com transformação em volta de um pino. */
  function pedaco(ctx, im, W, H, dx, dy, area, pino, giro, sx, sy) {
    ctx.save();
    const px = dx + pino[0] * W, py = dy + pino[1] * H;
    ctx.translate(px, py);
    if (giro) ctx.rotate(giro);
    if (sx || sy) ctx.scale(sx || 1, sy || 1);
    ctx.translate(-px, -py);
    ctx.beginPath();
    ctx.rect(dx + area[0] * W, dy + area[1] * H, (area[2] - area[0]) * W, (area[3] - area[1]) * H);
    ctx.clip();
    ctx.drawImage(im, dx, dy, W, H);
    ctx.restore();
  }

  function helice(ctx, x, y, r, t, velocidade) {
    /* borrão de hélice: disco achatado e um risco girando */
    const a = t * velocidade;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(255,253,242,.32)';
    ctx.strokeStyle = 'rgba(51,40,31,.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.2, r, 0, 0, 6.283);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#33281F';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    const c = Math.cos(a) * r;
    ctx.beginPath();
    ctx.moveTo(0, -c);
    ctx.lineTo(0, c);
    ctx.stroke();
    ctx.restore();
  }

  /* Bandeira que ondula: corta o logotipo em tiras e mexe cada uma. */
  const bandeiras = new Map();
  function bandeira(ctx, m, cx, cy, w, h, t, v) {
    let c = bandeiras.get(m.id);
    if (!c) {
      c = document.createElement('canvas');
      c.width = 560;
      c.height = 150;
      const x = c.getContext('2d');
      x.scale(2, 2);
      RL.Desenho.logoMarca(x, m, 140, 37, 272, 62);
      bandeiras.set(m.id, c);
    }
    const tiras = 70, lt = w / tiras, ls = c.width / tiras;
    for (let i = 0; i < tiras; i++) {
      /* preso no lado do avião, solto na ponta */
      const u = v > 0 ? 1 - i / tiras : i / tiras;
      const onda = Math.sin(t * 7 - i * 0.2 * v) * (2 + u * 9);
      ctx.drawImage(c, i * ls, 0, ls + 1, c.height, cx - w / 2 + i * lt, cy - h / 2 + onda, lt + 0.6, h);
    }
  }

  /* Poucos ritmos em comum: objetos parecidos respiram no mesmo tempo. */
  const RITMO = { deriva: 0.8, flutua: 1.2, boia: 2.2 };

  RL.pintarObjeto = function (ctx, o, t, esc) {
    const d = OBJ[o.nome];
    const im = RL.Sprite(d.img || o.nome);
    if (!im) return;
    const zoom = esc || 1;
    const W = d.w * zoom * (o.k || 1), H = (W * im.height) / im.width;
    const f = t + o.fase;
    const dx = -W / 2, dy = -H / 2;
    ctx.save();
    ctx.translate(o.x, o.y);
    switch (o.nome) {
      case 'moeda': {
        const c = Math.cos(f * 4.5);
        ctx.save();
        ctx.scale(Math.max(0.24, Math.abs(c)), 1);
        ctx.drawImage(im, dx, dy, W, H);
        ctx.restore();
        /* brilho que passa de vez em quando */
        const b = (f * 0.7) % 3;
        if (b < 0.3) {
          const k = Math.sin((b / 0.3) * 3.14);
          ctx.fillStyle = '#FFFBE0';
          ctx.save();
          ctx.translate(W * 0.2, -H * 0.24);
          ctx.rotate(0.6);
          for (const g of [0, 1.57]) {
            ctx.rotate(g);
            ctx.beginPath();
            ctx.ellipse(0, 0, 11 * k, 1.8 * k, 0, 0, 6.283);
            ctx.fill();
          }
          ctx.restore();
        }
        break;
      }
      case 'anel': {
        /* o aro metálico da peça, deitado: o foguete passa por dentro */
        const r = 1 + Math.sin(f * RITMO.boia) * 0.04;
        ctx.scale(r, r);
        ctx.drawImage(im, dx, dy, W, H);
        break;
      }
      case 'galao':
        ctx.translate(0, Math.sin(f * RITMO.boia) * 5);
        ctx.rotate(Math.sin(f * RITMO.flutua) * 0.2);
        ctx.drawImage(im, dx, dy, W, H);
        break;
      case 'kit':
        ctx.translate(0, Math.sin(f * RITMO.boia) * 5);
        ctx.rotate(Math.sin(f * RITMO.flutua) * 0.12);
        ctx.drawImage(im, dx, dy, W, H);
        break;
      case 'caixa': {
        /* pula, amassa ao cair e estica ao subir */
        const c = Math.abs(Math.sin(f * 3));
        ctx.translate(0, -c * 14 + H * 0.5);
        ctx.scale(1 + (1 - c) * 0.12, 1 - (1 - c) * 0.12);
        ctx.rotate(Math.sin(f * 3) * 0.05);
        ctx.drawImage(im, dx, dy - H * 0.5, W, H);
        break;
      }
      case 'passaro': {
        /* corpo fica, asas batem de verdade em volta do ombro */
        if (o.vx < 0) ctx.scale(-1, 1);
        const asa = Math.sin(f * 14);
        ctx.translate(0, -asa * 3);
        ctx.rotate(-0.06 + asa * 0.05);
        pedaco(ctx, im, W, H, dx, dy, [0, 0.42, 1, 1], [0.5, 0.5]);
        pedaco(ctx, im, W, H, dx, dy, [0, 0, 1, 0.5], [0.45, 0.5], asa * 0.1, 1, 0.62 + asa * 0.62);
        break;
      }
      case 'aviao':
      case 'faixa': {
        const v = o.vx < 0 ? -1 : 1;
        ctx.translate(0, Math.sin(f * RITMO.flutua) * 6);
        if (o.nome === 'faixa') {
          ctx.strokeStyle = '#33281F';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-v * W * 0.44, 2);
          ctx.quadraticCurveTo(-v * W * 0.65, Math.sin(f * 4) * 5, -v * W * 0.86, Math.sin(f * 7) * 3);
          ctx.stroke();
          bandeira(ctx, RL.MARCA[o.marca], -v * (W * 0.86 + W * 0.88), 0, W * 1.76, W * 0.47, t, v);
        }
        ctx.scale(v, 1);
        /* inclina um pouco nas curvas e o motor treme */
        ctx.rotate(Math.sin(f * RITMO.flutua + 1) * 0.05);
        ctx.translate(0, Math.sin(f * 40) * 0.6);
        ctx.drawImage(im, dx, dy, W, H);
        helice(ctx, dx + W * 0.965, dy + H * 0.52, H * 0.42, f, 46);
        break;
      }
      case 'balao': {
        /* balão oscila como pêndulo, o cesto vai atrasado e o maçarico acende às vezes */
        const b = Math.sin(f * RITMO.deriva);
        ctx.translate(Math.sin(f * RITMO.deriva * 0.6) * 9, Math.sin(f * RITMO.deriva) * 4);
        ctx.rotate(b * 0.05);
        const fogo = (f % 3.2) < 0.9;
        if (fogo) {
          const a = 8 + Math.sin(f * 30) * 3;
          ctx.fillStyle = '#F0A030';
          ctx.strokeStyle = '#33281F';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(-5, dy + H * 0.78);
          ctx.quadraticCurveTo(0, dy + H * 0.78 - a * 2.4, 5, dy + H * 0.78);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        pedaco(ctx, im, W, H, dx, dy, [0, 0.74, 1, 1], [0.5, 0.74], Math.sin(f * RITMO.deriva - 0.8) * 0.16);
        ctx.save();
        ctx.translate(0, dy + H * 0.38);
        ctx.scale(1 + Math.sin(f * 1.3) * 0.012, 1 - Math.sin(f * 1.3) * 0.012);
        ctx.translate(0, -(dy + H * 0.38));
        pedaco(ctx, im, W, H, dx, dy, [0, 0, 1, 0.75], [0.5, 0.5]);
        ctx.restore();
        break;
      }
      case 'meteo': {
        /* balão de medição: sobe e desce, respira, e a caixinha balança */
        ctx.translate(Math.sin(f * RITMO.deriva) * 7, Math.sin(f * RITMO.flutua) * 5);
        pedaco(ctx, im, W, H, dx, dy, [0, 0.62, 1, 1], [0.5, 0.62], Math.sin(f * 1.6) * 0.24);
        ctx.save();
        ctx.translate(0, dy + H * 0.32);
        const r = 1 + Math.sin(f * 1.7) * 0.022;
        ctx.scale(r, 2 - r);
        ctx.translate(0, -(dy + H * 0.32));
        pedaco(ctx, im, W, H, dx, dy, [0, 0, 1, 0.63], [0.5, 0.5]);
        ctx.restore();
        break;
      }
      case 'dirigivel': {
        const m = RL.MARCA[o.marca];
        /* flutua, aponta o nariz para cima e para baixo e a hélice de trás gira */
        ctx.translate(0, Math.sin(f * RITMO.deriva) * 8);
        ctx.rotate(Math.sin(f * RITMO.deriva * 0.75) * 0.035);
        helice(ctx, dx + W * 0.985, dy + H * 0.47, H * 0.2, f, 30);
        ctx.drawImage(im, dx, dy, W, H);
        RL.Desenho.logoMarca(ctx, m, -W * 0.06, -H * 0.12, W * 0.54, H * 0.3);
        /* letreiro de luzes correndo embaixo da fuselagem */
        for (let i = 0; i < 9; i++) {
          const acesa = Math.floor(t * 6 - i) % 3 === 0;
          ctx.fillStyle = acesa ? '#FFE27A' : '#8A7A5A';
          ctx.beginPath();
          ctx.arc(-W * 0.26 + i * W * 0.052, H * 0.12, 2.2, 0, 6.283);
          ctx.fill();
        }
        break;
      }
      case 'outdoor': {
        const m = RL.MARCA[o.marca];
        ctx.rotate(Math.sin(f * 0.4) * 0.05);
        ctx.drawImage(im, dx, dy, W, H);
        /* o painel ganha fundo pintado, em vez de branco de tela */
        ctx.save();
        ctx.beginPath();
        ctx.rect(-W * 0.325, -H * 0.41, W * 0.65, H * 0.43);
        ctx.clip();
        ctx.fillStyle = '#EDE5CB';
        ctx.fillRect(-W * 0.34, -H * 0.42, W * 0.68, H * 0.45);
        ctx.drawImage(RL.Pintura.textura(), -W * 0.34, -H * 0.42, W * 0.68, W * 0.68);
        ctx.restore();
        RL.Desenho.logoMarca(ctx, m, 0, -H * 0.28, W * 0.5, H * 0.17);
        ctx.fillStyle = '#33281F';
        ctx.font = `${Math.round(H * 0.075)}px 'Patrick Hand',sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.slogan, 0, -H * 0.1, W * 0.52);
        /* lâmpadas do topo piscam */
        for (let i = 0; i < 4; i++) {
          if (Math.sin(f * 4 + i * 1.6) > 0.1) {
            ctx.fillStyle = 'rgba(255,240,170,.85)';
            ctx.beginPath();
            ctx.arc(-W * 0.2 + i * W * 0.134, -H * 0.44, 4, 0, 6.283);
            ctx.fill();
          }
        }
        break;
      }
      case 'lixo':
        ctx.rotate(t * o.gira + o.fase);
        ctx.drawImage(im, dx, dy, W, H);
        /* cacos em órbita */
        ctx.fillStyle = '#8E8A86';
        ctx.strokeStyle = '#33281F';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const a = t * (1.2 + i * 0.4) + i * 2.1;
          ctx.save();
          ctx.translate(Math.cos(a) * W * 0.62, Math.sin(a) * W * 0.5);
          ctx.rotate(a * 2);
          ctx.fillRect(-3, -2, 6, 4);
          ctx.strokeRect(-3, -2, 6, 4);
          ctx.restore();
        }
        break;
      case 'satelite':
        ctx.rotate(t * o.gira * 0.3 + o.fase);
        ctx.drawImage(im, dx, dy, W, H);
        /* luz de posição piscando */
        if (Math.sin(f * 5) > 0.2) {
          ctx.fillStyle = 'rgba(255,90,70,.95)';
          ctx.beginPath();
          ctx.arc(0, 0, 4.5, 0, 6.283);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,90,70,.3)';
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, 6.283);
          ctx.fill();
        }
        break;
      case 'meteoro': {
        /* o fogo tremula, e a pedra fica no ponto de colisão */
        ctx.rotate(-0.62 + Math.atan2(-o.vx, 600));
        ctx.scale(1 + Math.sin(f * 21) * 0.02, 1 + Math.sin(f * 17) * 0.05);
        ctx.drawImage(im, -W * 0.3, -H * 0.7, W, H);
        break;
      }
      case 'refri':
        ctx.rotate(Math.sin(f * RITMO.deriva) * 0.2);
        ctx.drawImage(im, dx, dy, W, H);
        /* o vidro acende como máquina ligada */
        ctx.fillStyle = `rgba(255,255,220,${0.12 + Math.abs(Math.sin(f * 7)) * 0.14})`;
        ctx.fillRect(dx + W * 0.27, dy + H * 0.05, W * 0.46, H * 0.65);
        break;
      case 'sofa':
        /* vem girando devagar, sem pressa nenhuma */
        ctx.rotate(Math.sin(f * RITMO.deriva * 0.6) * 0.5);
        ctx.drawImage(im, dx, dy, W, H);
        break;
      case 'pato':
        ctx.translate(0, Math.sin(f * RITMO.flutua) * 8);
        ctx.rotate(Math.sin(f * RITMO.deriva) * 0.14);
        ctx.scale(1, 1 + Math.sin(f * RITMO.flutua) * 0.02);
        ctx.drawImage(im, dx, dy, W, H);
        break;
      default:
        ctx.drawImage(im, dx, dy, W, H);
    }
    ctx.restore();
  };

  RL.OBJ = OBJ;
})();
