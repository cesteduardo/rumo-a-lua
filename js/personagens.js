/* A dupla, com a arte pintada: capivara comprida e entediada, tatu baixinho e opinativo. */
(function () {
  const RL = window.RL;
  const T = '#33281F';
  let roupa = { chapeu: 'nenhum', oculos: 'nenhum', pescoco: 'nenhum', pelo: 'castanho', traje: 'creme' };
  const MATIZ_PELO = { castanho: '', mel: 'hue-rotate(8deg) saturate(1.1) brightness(1.2)', cinza: 'saturate(.1) brightness(1.08)', azul: 'hue-rotate(185deg) saturate(.9) brightness(1.1)', rosa: 'hue-rotate(310deg) saturate(.9) brightness(1.3)', branco: 'saturate(.15) brightness(1.75)', preto: 'saturate(.3) brightness(.5)', verde: 'hue-rotate(70deg) saturate(1.1) brightness(1.05)', lilas: 'hue-rotate(245deg) saturate(.8) brightness(1.3)', ruivo: 'hue-rotate(-14deg) saturate(1.9) brightness(1.08)' };

  function vestir(piloto) {
    roupa = piloto;
  }

  const preen = (ctx, cor) => {
    ctx.fillStyle = cor;
    ctx.fill();
    ctx.stroke();
  };

  /* Chapéu com a base no ponto (0,0), largura de cabeça perto de 44. */
  function chapeu(ctx, id) {
    ctx.lineWidth = 1.7;
    ctx.strokeStyle = T;
    const r = (x, y, w, h, q, cor) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, q); preen(ctx, cor); };
    if (id === 'bone') {
      ctx.beginPath(); ctx.moveTo(-23, 0); ctx.bezierCurveTo(-23, -26, 21, -26, 22, 0); ctx.closePath(); preen(ctx, '#C8413C');
      ctx.beginPath(); ctx.moveTo(14, -3); ctx.quadraticCurveTo(38, -6, 44, 2); ctx.quadraticCurveTo(26, 3, 14, 2); ctx.closePath(); preen(ctx, '#A9332F');
    } else if (id === 'palha') {
      ctx.beginPath(); ctx.ellipse(0, 0, 44, 8, 0, 0, 6.283); preen(ctx, '#E0C27C');
      ctx.beginPath(); ctx.moveTo(-21, -1); ctx.bezierCurveTo(-21, -27, 21, -27, 21, -1); ctx.closePath(); preen(ctx, '#E8CF8E');
      r(-21, -7, 42, 6, 1, '#C8413C');
    } else if (id === 'touca') {
      ctx.beginPath(); ctx.moveTo(-26, 2); ctx.bezierCurveTo(-30, -32, 30, -32, 26, 2); ctx.quadraticCurveTo(13, -3, 0, 2); ctx.quadraticCurveTo(-13, -3, -26, 2); preen(ctx, '#BFE3E6');
      for (const [x, y] of [[-10, -12], [7, -15], [15, -6], [-3, -5]]) { ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 6.283); preen(ctx, '#F7F4EA'); }
    } else if (id === 'gorro') {
      ctx.beginPath(); ctx.moveTo(-22, -2); ctx.bezierCurveTo(-24, -32, 22, -32, 22, -2); ctx.closePath(); preen(ctx, '#3F8F87');
      r(-24, -7, 48, 9, 3, '#F4F1E4');
      ctx.beginPath(); ctx.arc(0, -30, 6.5, 0, 6.283); preen(ctx, '#F4F1E4');
    } else if (id === 'cartola') {
      r(-17, -36, 34, 34, 2, '#2F2C3F');
      r(-17, -10, 34, 7, 0, '#C8413C');
      r(-30, -3, 60, 6, 3, '#2F2C3F');
    } else if (id === 'viking') {
      for (const l of [-1, 1]) { ctx.beginPath(); ctx.moveTo(l * 19, -8); ctx.quadraticCurveTo(l * 39, -13, l * 37, -38); ctx.quadraticCurveTo(l * 29, -21, l * 15, -19); ctx.closePath(); preen(ctx, '#F4F1E4'); }
      ctx.beginPath(); ctx.moveTo(-24, 0); ctx.bezierCurveTo(-24, -30, 24, -30, 24, 0); ctx.closePath(); preen(ctx, '#9AA3A6');
      r(-26, -5, 52, 7, 2, '#7E6E62');
    } else if (id === 'sombrero') {
      ctx.beginPath(); ctx.ellipse(0, -1, 58, 11, 0, 0, 6.283); preen(ctx, '#C8413C');
      ctx.beginPath(); ctx.moveTo(-18, -3); ctx.bezierCurveTo(-16, -36, 16, -36, 18, -3); ctx.closePath(); preen(ctx, '#3F8F87');
      r(-19, -9, 38, 5, 1, '#E0B23C');
    } else if (id === 'chef') {
      r(-21, -12, 42, 13, 2, '#F7F4EA');
      ctx.beginPath(); ctx.moveTo(-21, -11); ctx.bezierCurveTo(-38, -22, -26, -44, -10, -36); ctx.bezierCurveTo(-6, -50, 10, -50, 12, -36); ctx.bezierCurveTo(28, -44, 38, -22, 21, -11); ctx.closePath(); preen(ctx, '#F7F4EA');
    } else if (id === 'cangaceiro') {
      ctx.beginPath(); ctx.moveTo(-46, -2); ctx.quadraticCurveTo(0, 8, 46, -2); ctx.quadraticCurveTo(26, -8, 22, -14); ctx.bezierCurveTo(12, -40, -12, -40, -22, -14); ctx.quadraticCurveTo(-26, -8, -46, -2); ctx.closePath(); preen(ctx, '#A9774E');
      for (const x of [-12, 0, 12]) { ctx.beginPath(); ctx.arc(x, -15, 3.2, 0, 6.283); preen(ctx, '#E0B23C'); }
    } else if (id === 'cone') {
      ctx.beginPath(); ctx.moveTo(-23, -2); ctx.lineTo(0, -48); ctx.lineTo(23, -2); ctx.closePath(); preen(ctx, '#E08A3C');
      ctx.beginPath(); ctx.moveTo(-13, -22); ctx.lineTo(13, -22); ctx.lineTo(8.5, -31); ctx.lineTo(-8.5, -31); ctx.closePath(); preen(ctx, '#F7F4EA');
      r(-29, -4, 58, 6, 2, '#C8602C');
    } else if (id === 'caixa') {
      r(-24, -36, 48, 37, 2, '#C9A26C');
      ctx.beginPath(); ctx.moveTo(-24, -24); ctx.lineTo(24, -24); ctx.moveTo(0, -36); ctx.lineTo(0, -24); ctx.stroke();
      ctx.fillStyle = '#33281F'; ctx.beginPath(); ctx.arc(-8, -13, 2.6, 0, 6.283); ctx.arc(9, -13, 2.6, 0, 6.283); ctx.fill();
    } else if (id === 'tiara') {
      ctx.beginPath(); ctx.arc(0, 0, 25, 3.5, 5.92); ctx.lineWidth = 3.4; ctx.stroke(); ctx.lineWidth = 1.7;
      for (const l of [-1, 1]) { ctx.beginPath(); ctx.moveTo(l * 15, -18); ctx.lineTo(l * 20, -36); ctx.stroke(); ctx.beginPath(); ctx.arc(l * 20, -38, 7, 0, 6.283); preen(ctx, l < 0 ? '#E58BA3' : '#F0CF62'); }
    } else if (id === 'fone') {
      ctx.beginPath(); ctx.arc(0, 2, 28, 3.14, 6.283); ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 1.7;
      for (const l of [-1, 1]) { r(l * 28 - 8, -6, 16, 22, 6, '#C8513F'); }
    } else if (id === 'abacaxi') {
      for (const a of [-0.7, -0.3, 0, 0.3, 0.7]) { ctx.save(); ctx.translate(0, -24); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-5, 0); ctx.quadraticCurveTo(0, -26, 5, 0); ctx.closePath(); preen(ctx, '#6F9149'); ctx.restore(); }
      ctx.beginPath(); ctx.ellipse(0, -13, 20, 15, 0, 0, 6.283); preen(ctx, '#E0B23C');
    } else if (id === 'coroa') {
      const im = RL.Sprite('enfeite3');
      if (im) ctx.drawImage(im, -27, -32, 54, 36);
    }
  }

  /* Óculos em volta de dois olhos: centros em x0 e x1, altura y, raio rx. */
  function oculos(ctx, id, x0, x1, y, rx, ry) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = T;
    const lente = (x, cor, alfa) => {
      ctx.globalAlpha = alfa;
      ctx.fillStyle = cor;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, 6.283);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
    };
    const ponte = () => { ctx.beginPath(); ctx.moveTo(x0 + rx * 0.9, y); ctx.lineTo(x1 - rx * 0.9, y); ctx.stroke(); };
    if (id === 'redondo') {
      lente(x0, '#BFE3E6', 0.3); lente(x1, '#BFE3E6', 0.3); ponte();
    } else if (id === 'escuro') {
      lente(x0, '#17151F', 0.94); lente(x1, '#17151F', 0.94); ponte();
    } else if (id === 'tapa') {
      lente(x0, '#17151F', 1);
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x0 - rx, y - ry * 0.7); ctx.lineTo(x1 + rx * 1.1, y - ry * 1.3); ctx.stroke();
    } else if (id === 'tres') {
      ctx.beginPath(); ctx.roundRect(x0 - rx * 1.1, y - ry * 0.75, x1 - x0 + rx * 2.2, ry * 1.5, 3); ctx.fillStyle = '#F7F4EA'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#C8513F'; ctx.fillRect(x0 - rx * 0.85, y - ry * 0.5, rx * 1.7, ry);
      ctx.fillStyle = '#5EA8C4'; ctx.fillRect(x1 - rx * 0.85, y - ry * 0.5, rx * 1.7, ry);
    } else if (id === 'aviador') {
      for (const x of [x0, x1]) { ctx.beginPath(); ctx.moveTo(x - rx, y - ry * 0.6); ctx.lineTo(x + rx, y - ry * 0.6); ctx.bezierCurveTo(x + rx * 1.1, y + ry * 0.9, x - rx * 1.1, y + ry * 0.9, x - rx, y - ry * 0.6); ctx.fillStyle = 'rgba(180,110,50,.75)'; ctx.fill(); ctx.strokeStyle = '#B8912C'; ctx.lineWidth = 2.2; ctx.stroke(); }
      ctx.strokeStyle = T;
    } else if (id === 'coracao') {
      for (const x of [x0, x1]) {
        ctx.beginPath();
        ctx.moveTo(x, y + ry);
        ctx.bezierCurveTo(x - rx * 1.5, y + ry * 0.1, x - rx * 0.9, y - ry * 1.1, x, y - ry * 0.3);
        ctx.bezierCurveTo(x + rx * 0.9, y - ry * 1.1, x + rx * 1.5, y + ry * 0.1, x, y + ry);
        ctx.fillStyle = '#E8604C';
        ctx.fill();
        ctx.stroke();
      }
      ponte();
    } else if (id === 'nerd') {
      for (const x of [x0, x1]) { ctx.lineWidth = 3.4; ctx.beginPath(); ctx.roundRect(x - rx, y - ry * 0.8, rx * 2, ry * 1.6, 2); ctx.stroke(); }
      ctx.lineWidth = 3.4; ponte();
    } else if (id === 'mergulho') {
      ctx.beginPath(); ctx.roundRect(x0 - rx * 1.25, y - ry * 1.05, x1 - x0 + rx * 2.5, ry * 2.1, ry * 0.8); ctx.fillStyle = 'rgba(94,168,196,.45)'; ctx.fill(); ctx.lineWidth = 3.2; ctx.strokeStyle = '#33281F'; ctx.stroke();
    } else if (id === 'estrela') {
      for (const x of [x0, x1]) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -1.57 + (i * 6.283) / 10, q = i % 2 ? rx * 0.55 : rx * 1.3; ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } ctx.closePath(); ctx.fillStyle = '#F0CF62'; ctx.fill(); ctx.stroke(); }
      ponte();
    }
    ctx.lineWidth = 1.7;
  }

  const corTraje = () => {
    const r = RL.ROUPA['traje:' + (roupa.traje || 'creme')];
    return r ? r.cores : ['#EEE9D7', '#C8513F'];
  };

  /* Capacete de astronauta: gola branca, vidro com reflexo e aro de metal. */
  function capaceteEspacial(ctx, cx, cy, r, fundoGola) {
    ctx.save();
    ctx.strokeStyle = T;
    ctx.lineWidth = Math.max(1.4, r * 0.05);
    ctx.lineJoin = 'round';
    /* gola do traje */
    const [gola, listra] = corTraje();
    ctx.fillStyle = gola;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.86, cy + r * fundoGola);
    ctx.quadraticCurveTo(cx - r * 1.04, cy + r * 0.72, cx - r * 0.74, cy + r * 0.62);
    ctx.lineTo(cx + r * 0.74, cy + r * 0.62);
    ctx.quadraticCurveTo(cx + r * 1.04, cy + r * 0.72, cx + r * 0.86, cy + r * fundoGola);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = listra;
    ctx.fillRect(cx - r * 0.74, cy + r * 0.64, r * 1.48, r * 0.09);
    /* vidro */
    ctx.fillStyle = 'rgba(190,228,236,.2)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.52, cy - r * 0.5, r * 0.15, r * 0.3, 0.7, 0, 6.283);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.26, cy - r * 0.76, r * 0.07, r * 0.09, 0.7, 0, 6.283);
    ctx.fill();
    /* aro */
    ctx.strokeStyle = T;
    ctx.lineWidth = Math.max(4, r * 0.13);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 6.283);
    ctx.stroke();
    ctx.strokeStyle = '#C2C8CC';
    ctx.lineWidth = Math.max(2, r * 0.07);
    ctx.stroke();
    ctx.restore();
  }

  /* Dados de cada pose: altura relativa, centro do corpo, topo da cabeça e olhos (frações da figura). */
  const POSES = {
    parada: { img: 'capi_parada', alt: 1, cx: 0.35, cab: [0.5, 0.07], olho: [0.38, 0.63, 0.17] },
    aponta: { img: 'capi_aponta', alt: 1, cx: 0.27, cab: [0.36, 0.07], olho: [0.28, 0.45, 0.17] },
    bandeira: { img: 'capi_comemora', alt: 1, cx: 0.5, cab: [0.5, 0.05], olho: [0.45, 0.58, 0.14] },
    comemora: { img: 'capi_comemora', alt: 1, cx: 0.5, cab: [0.5, 0.05], olho: [0.45, 0.58, 0.14] },
    susto: { img: 'capi_susto', alt: 1.05, cx: 0.5, cab: [0.48, 0.12], olho: [0.46, 0.59, 0.17] },
    triste: { img: 'capi_triste', alt: 0.91, cx: 0.34, cab: [0.5, 0.05], olho: [0.48, 0.65, 0.14] },
    pensa: { img: 'capi_parada', alt: 1, cx: 0.35, cab: [0.5, 0.07], olho: [0.38, 0.63, 0.17] },
    chave: { img: 'capi_chave', alt: 0.98, cx: 0.32, cab: [0.46, 0.05], olho: [0.32, 0.5, 0.17] },
    paraquedas: { img: 'capi_paraquedas', alt: 1.53, cx: 0.5, cab: [0.58, 0.47], olho: [0.48, 0.61, 0.5], capa: [0.655, 0.53, 0.135] },
  };

  /* Personagens andam em 12 quadros por segundo, como desenho animado. QUADROS = 0 volta ao movimento contínuo. */
  const QUADROS = 12;
  const emPassos = (t) => (QUADROS ? Math.floor(t * QUADROS) / QUADROS : t);

  function capivara(ctx, x, y, esc, op) {
    const o = typeof op === 'string' ? { pose: op } : op || {};
    const nome = o.pose || 'parada';
    const P = POSES[nome] || POSES.parada;
    const img = RL.Sprite(P.img);
    if (!img) return;
    const t = emPassos(o.t || 0);
    const H = 212 * esc * P.alt, W = (H * img.width) / img.height;
    const resp = Math.sin(t * 2.1) * 0.012;
    const pulo = nome === 'comemora' ? Math.abs(Math.sin(t * 7)) * 9 * esc : 0;
    ctx.save();
    ctx.translate(x, y - pulo);
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale((o.vira ? -1 : 1) * (1 - resp), 1 + resp);
    if (nome === 'chave') ctx.rotate(Math.sin(t * 4) * 0.012);
    if (nome === 'parada' || nome === 'pensa') ctx.rotate(Math.sin(t * 0.9) * 0.008);
    const px = -W * P.cx, py = -H;
    if (roupa.pescoco === 'capa') {
      ctx.fillStyle = '#C8413C';
      ctx.strokeStyle = T;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(px + W * (P.cx - 0.1), py + H * 0.34);
      ctx.bezierCurveTo(px - W * 0.1, py + H * 0.55, px - W * 0.12 + Math.sin(t * 3) * 3, py + H * 0.8, px + W * (P.cx - 0.28), py + H * 0.92);
      ctx.lineTo(px + W * (P.cx + 0.05), py + H * 0.86);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    const f = MATIZ_PELO[roupa.pelo];
    if (f && 'filter' in ctx) ctx.filter = f;
    ctx.drawImage(img, px, py, W, H);
    ctx.filter = 'none';
    if (nome !== 'paraquedas') {
      if (roupa.pescoco === 'lenco') {
        ctx.strokeStyle = T; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(px + W * (P.cx - 0.17), py + H * 0.42); ctx.quadraticCurveTo(px + W * P.cx, py + H * 0.47, px + W * (P.cx + 0.17), py + H * 0.42); ctx.lineTo(px + W * P.cx, py + H * 0.56); ctx.closePath(); preen(ctx, '#C8413C');
      } else if (roupa.pescoco === 'gravata') {
        const gx = px + W * (P.cx + 0.05), gy = py + H * 0.43, u = H / 120;
        ctx.strokeStyle = T; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(gx - 4 * u, gy); ctx.lineTo(gx + 4 * u, gy); ctx.lineTo(gx + 2 * u, gy + 5 * u); ctx.lineTo(gx + 6 * u, gy + 26 * u); ctx.lineTo(gx, gy + 33 * u); ctx.lineTo(gx - 6 * u, gy + 26 * u); ctx.lineTo(gx - 2 * u, gy + 5 * u); ctx.closePath(); preen(ctx, '#4F7FA8');
      } else if (roupa.pescoco === 'cachecol') {
        const cx = px + W * P.cx, cy = py + H * 0.44;
        ctx.strokeStyle = T; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.roundRect(cx - W * 0.2, cy - H * 0.025, W * 0.42, H * 0.055, 5); preen(ctx, '#3F8F87');
        ctx.beginPath(); ctx.roundRect(cx - W * 0.1, cy, W * 0.09, H * 0.15, 3); preen(ctx, '#3F8F87');
      } else if (roupa.pescoco === 'colar') {
        ctx.strokeStyle = T; ctx.lineWidth = 1.2;
        for (let i = 0; i < 9; i++) { const a = 0.35 + (i / 8) * 2.44; ctx.beginPath(); ctx.arc(px + W * (P.cx + 0.02) + Math.cos(a) * W * 0.2, py + H * 0.41 + Math.sin(a) * H * 0.06, H * 0.012, 0, 6.283); preen(ctx, '#F7F4EA'); }
      } else if (roupa.pescoco === 'boia') {
        const cx = px + W * (P.cx + 0.02), cy = py + H * 0.62;
        ctx.strokeStyle = T; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.31, H * 0.04, 0, 0, 6.283); preen(ctx, '#E58BA3');
      } else if (roupa.pescoco === 'medalha') {
        const mx = px + W * (P.cx + 0.05), my = py + H * 0.62;
        ctx.strokeStyle = '#C8513F'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(px + W * (P.cx - 0.12), py + H * 0.42); ctx.lineTo(mx, my); ctx.lineTo(px + W * (P.cx + 0.2), py + H * 0.42); ctx.stroke();
        ctx.strokeStyle = T; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(mx, my + H * 0.02, H * 0.035, 0, 6.283); preen(ctx, '#E0B23C');
      }
    }
    /* piscada: pálpebra de pelo sobre os dois olhos */
    if (t && (t % 3.7) < 0.13 && nome !== 'paraquedas') {
      ctx.fillStyle = '#8F6340';
      ctx.strokeStyle = T;
      ctx.lineWidth = Math.max(1, H * 0.006);
      for (const fx of [P.olho[0], P.olho[1]]) {
        ctx.beginPath();
        ctx.ellipse(px + W * fx, py + H * P.olho[2], H * 0.055, H * 0.06, 0, 0, 6.283);
        ctx.fill();
        ctx.stroke();
      }
    }
    const u = H / (212 * P.alt) * 1.25;
    if (o.astronauta) capaceteEspacial(ctx, px + W * (P.capa ? P.capa[0] : 0.5), py + H * (P.capa ? P.capa[1] : 0.2), H * (P.capa ? P.capa[2] : 0.2), 0.95);
    if (roupa.oculos !== 'nenhum') oculos(ctx, roupa.oculos, px + W * P.olho[0], px + W * P.olho[1], py + H * P.olho[2], 15 * u, 15 * u);
    if (roupa.chapeu !== 'nenhum') {
      ctx.save();
      ctx.translate(px + W * P.cab[0], py + H * P.cab[1] + 7 * u);
      ctx.scale(u, u);
      chapeu(ctx, roupa.chapeu);
      ctx.restore();
    }
    ctx.restore();
  }

  /* Ator: troca de pose com um pulinho, para não saltar seco. */
  function criarAtor(inicial) {
    let nome = inicial || 'parada';
    let mola = 0, vel = 0;
    const a = {
      pose(n) {
        if (n !== nome) {
          nome = n;
          vel = -60;
        }
      },
      get nome() { return nome; },
      atualizar(dt) {
        vel += (-mola * 240 - vel * 16) * dt;
        mola += vel * dt;
      },
      pintar(ctx, x, y, esc, op) {
        capivara(ctx, x, y + mola, esc, { ...op, pose: nome });
      },
    };
    return a;
  }

  /* Cabeça na janela e no retrato do voo. */
  function rosto(ctx, cx, cy, r, op) {
    const o = op || {};
    const humor = o.humor;
    let nome = 'cab_parada';
    if (o.boca != null && o.boca > 0.5) nome = 'cab_feliz';
    else if (humor === 'feliz') nome = 'cab_feliz';
    else if (humor === 'susto' || humor === 'dor') nome = 'cab_susto';
    else if (humor === 'triste') nome = 'cab_triste';
    const im = RL.Sprite(nome);
    if (!im) return;
    const W = r * 2.2, H = (W * im.height) / im.width;
    const inclina = (o.olhar || 0) * 0.05 + (humor === 'dor' ? Math.sin(emPassos(o.t || 0) * 30) * 0.05 : 0);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(inclina);
    const f = MATIZ_PELO[roupa.pelo];
    if (f && 'filter' in ctx) ctx.filter = f;
    ctx.drawImage(im, -W / 2, -H / 2, W, H);
    ctx.filter = 'none';
    if (o.t && (o.t % 4.1) < 0.12 && nome === 'cab_parada') {
      ctx.fillStyle = '#8F6340';
      ctx.strokeStyle = T;
      ctx.lineWidth = Math.max(1, r * 0.04);
      for (const fx of [-0.22, 0.02]) {
        ctx.beginPath();
        ctx.ellipse(W * fx, -H * 0.21, W * 0.1, H * 0.15, 0, 0, 6.283);
        ctx.fill();
        ctx.stroke();
      }
    }
    if (o.astronauta) capaceteEspacial(ctx, 0, 0, r * 1.2, 1.05);
    const u = W / 180;
    if (roupa.oculos !== 'nenhum') oculos(ctx, roupa.oculos, -W * 0.22, W * 0.02, -H * 0.21, 15 * u, 15 * u);
    if (roupa.chapeu !== 'nenhum') {
      ctx.save();
      ctx.translate(-W * 0.1, -H * 0.42);
      ctx.scale(u * 1.3, u * 1.3);
      chapeu(ctx, roupa.chapeu);
      ctx.restore();
    }
    ctx.restore();
  }

  function tatu(ctx, x, y, esc, op) {
    const o = op || {};
    const t = emPassos(o.t || 0);
    const falando = o.falando && Math.floor(t * 7) % 2 === 0;
    const im = RL.Sprite(falando ? 'tatu_fala' : 'tatu');
    if (!im) return;
    const H = 82 * esc, W = (H * im.width) / im.height;
    const pulo = o.pulo ? Math.abs(Math.sin(t * 8)) * 8 : 0;
    ctx.save();
    ctx.translate(x, y - pulo);
    ctx.scale(o.vira ? -1 : 1, 1 + Math.sin(t * 2.6) * 0.012);
    ctx.drawImage(im, -W / 2, -H, W, H);
    ctx.restore();
  }

  /* Balão de fala desenhado à mão. x,y é a ponta do rabicho. */
  function balao(ctx, x, y, texto, W, o) {
    const opc = o || {};
    const larg = Math.min(opc.larg || 230, W - 24);
    const fonte = opc.fonte || 23;
    ctx.save();
    ctx.font = `${fonte}px 'Patrick Hand','Comic Sans MS',sans-serif`;
    const linhas = [];
    let l = '';
    for (const p of texto.split(' ')) {
      const n = l ? l + ' ' + p : p;
      if (ctx.measureText(n).width > larg - 26 && l) {
        linhas.push(l);
        l = p;
      } else l = n;
    }
    linhas.push(l);
    const lh = fonte + 2;
    const h = linhas.length * lh + 18;
    const w = Math.min(larg, Math.max(...linhas.map((q) => ctx.measureText(q).width)) + 28);
    const bx = Math.max(10, Math.min(W - w - 10, x - w * 0.32));
    const by = y - h - 15;
    const e = opc.escala == null ? 1 : opc.escala;
    ctx.translate(x, y);
    ctx.scale(e, e);
    ctx.translate(-x, -y);
    ctx.fillStyle = '#FFFDF2';
    ctx.strokeStyle = T;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, [14, 11, 15, 10]);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 8, by + h - 1);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 8, by + h - 1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 8, by + h);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 8, by + h);
    ctx.stroke();
    ctx.fillStyle = T;
    ctx.textBaseline = 'middle';
    linhas.forEach((q, i) => ctx.fillText(q, bx + 14, by + 9 + lh * (i + 0.5)));
    ctx.restore();
  }

  /* ---------- O que eles falam ---------- */
  const FALAS = {
    decolar: ['Chefe, vou atrasar. Uns dias.', 'O manual dizia pra não fazer isso. Ou pra fazer. Tava em alemão.', 'Se eu não voltar, tem marmita na geladeira.', 'Deixei o ferro ligado. Tarde demais.', 'Agora é tarde. Como quase tudo na minha vida.', 'Ponto batido às 8h. Tecnicamente tô no trabalho.'],
    bater: ['Isso vai sair do meu salário.', 'Tudo bem. Tudo bem. Não tá tudo bem.', 'Quem botou isso aí?!', 'Foi de propósito. Tava testando o casco.'],
    viu_passaro: ['Esse pombo tem advogado?', 'Três mil metros e ainda tem pombo.', 'Ele olhou pra mim. Ele sabia.'],
    viu_balao: ['Passeio romântico. O meu não, o deles.', 'Parabéns pelo noivado! Eu acho!'],
    viu_aviao: ['Ninguém viu. Ninguém viu.', 'Vai atrasar o voo. Bem-vinda ao clube, gente.', 'Oi, comandante. Sou nova aqui.'],
    viu_meteo: ['Previsão pra amanhã: eu.', 'Se chover, não fui eu.'],
    estilingue: ['Meu estômago ficou no anel anterior.', 'Isso conta como atalho?', 'Passei. Não sei por onde, mas passei.', 'Quem deixou esses anéis aqui? Obrigada.'],
    bater_lixo: ['Quem joga uma geladeira no espaço?', 'Reciclar, ninguém recicla.', 'Era a chave de fenda que eu tava procurando.'],
    bater_satelite: ['Se a novela sair do ar, não fui eu.', 'Pronto. Lá se foi o GPS de alguém.', 'O sinal caiu. Em cima de mim.'],
    bater_meteoro: ['Pedra do céu! Tem seguro pra pedra do céu?', 'Ele veio de bilhões de anos pra isso.'],
    casco: ['Acho que aquela peça era importante.', 'Tá entrando um ventinho.', 'A janela não abria. Agora abre.', 'Vou devolver o foguete com uns riscos.'],
    combo: ['Isso é o meu salário de um ano. E passou voando.', 'Ninguém me falou que o espaço pagava.', 'Tô rica. Mais ou menos.'],
    surto: ['DINHEIRO! NO ESPAÇO! SEM IMPOSTO!', 'Vou comprar um foguete. Ah, é.', 'Se for sonho, não me acorda antes do almoço.'],
    triz: ['Eu ia desviar mesmo.', 'Passou raspando. Minha vida passou inteira. Foi rápido.', 'Calculado. Não, mentira.'],
    turbo: ['Minha cara ficou lá atrás!', 'Dente! Cadê meu dente?', 'Isso é legal? Não pergunta.'],
    semComb: ['Ih.', 'Ué. Cadê o barulho?', 'Era pra ter acabado agora? Porque acabou.', 'Última gota. Foi bonita.'],
    marco: ['Isso conta como hora extra?', 'Quero ver quem ri agora.', 'Tiro uma foto? Não tenho braço pra isso.'],
    'marco_1': ['Daqui já dá pra ver o quintal da vizinha. Que horror.'],
    'marco_2': ['Nuvem é só neblina metida a besta.'],
    'marco_5': ['Tchau, pombos. Ninguém vai sentir falta.'],
    'marco_8.8': ['Subi o Everest sem casaco. Quero um selo.'],
    'marco_12': ['Oi, moça do avião! Não, não quero amendoim!', 'Aceito o suco. Passa pela janela.'],
    'marco_39': ['Saltar daqui de propósito? Tem gente que não tem chefe.'],
    'marco_100': ['Tecnicamente sou astronauta. Vou pedir aumento.', 'Olha o espaço. Cadê a placa?'],
    'marco_408': ['Toquei a campainha da Estação. Fingiram que não tinha ninguém.'],
    'marco_1000': ['Radiação, é? Meu pelo já tava assim.'],
    'marco_6371': ['Subi o tamanho do raio da Terra. Inútil, mas subi.'],
    'marco_20200': ['Recalculando rota. Vire à direita no vazio.'],
    'marco_40075': ['Já dava pra ter dado a volta ao mundo. Mas aí tinha que voltar pro trabalho.'],
    'marco_100000': ['O chefe mandou mensagem. Sem sinal, ainda bem.'],
    'marco_192200': ['Metade. Agora voltar dá o mesmo trabalho. Sigo.'],
    'marco_256000': ['Ela não é um queijo. Fui enganada a vida inteira.'],
    'marco_326000': ['Tá me puxando. Nunca ninguém me quis tanto.'],
    perigo: ['Sério isso?', 'Ah, não.', 'Justo hoje que lavei o foguete.'],
    moedas: ['De onde tá vindo isso?', 'Não vou perguntar. Vou pegar.', 'Chove dinheiro e eu sem guarda-chuva invertido.'],
    absurdo: ['Ninguém vai acreditar em mim.', 'Isso tava na minha lista de coisas que não existem.', 'Vou fingir que não vi. Não, vou encostar.'],
    pegou_refri: ['Morno. Óbvio.', 'Sem troco. No espaço, sem troco.'],
    pegou_sofa: ['Achei moeda, controle remoto e a minha dignidade.', 'Melhor que a cadeira da firma.'],
    pegou_pato: ['Ele não disse nada. Melhor assim.', 'Ganhei dinheiro e um trauma.'],
    caixa: ['Tem surpresa. A vida inteira não tinha.', 'Se for meia, eu devolvo.'],
    bolha: ['Agora ninguém me toca.', 'Bolha ligada. Pode vir, meteoro.', 'Sou uma bola de sabão com plano de saúde.'],
    recorde: ['Nunca estive tão longe do meu aluguel.', 'Daqui pra frente é tudo novidade.', 'Mais longe que ontem. Ontem era mais perto. Faz sentido.'],
    lua: ['Tá enorme. Não era pra ser desse tamanho.', 'De perto ela tem espinha.', 'E eu nem trouxe bandeira. Trouxe sim, é a toalha.'],
    vento: ['Tá ventando de lado. Quem autorizou?', 'O vento não bateu o ponto hoje também.', 'Segura o foguete! Ah, sou eu que seguro.'],
    tempestade: ['Choveu no meu expediente.', 'Metal no meio do raio. Boa, capivara.', 'A previsão dizia sol. A previsão é o tatu.'],
    raio: ['Tô sentindo o gosto de moeda.', 'Agora eu brilho no escuro. Sem custo extra.', 'Meu pelo armou. Mais.'],
    maxq: ['Reto. Reto. Por que ele não fica reto?', 'O ar ficou duro. Isso existe?', 'Nariz em pé. Igual ao do meu chefe.'],
    apertou: ['Isso era uma peça. Agora é duas.', 'O ar arrancou o adesivo. E o que tava embaixo dele.', 'Tá. Reto. Entendi. Reto.'],
    saiuMaxq: ['Passou. Ainda tenho os dentes. Contei.', 'O ar soltou. Acho que ganhei.'],
    radiacao: ['Meu pelo tá formigando. Ele formiga sozinho?', 'Se eu brilhar, ninguém fala nada.', 'Isso dá direito a insalubridade?'],
    muralha: ['Quem estacionou esses satélites aqui?', 'Tem brecha. Tem que ter brecha.', 'Parece a marginal, só que com painel solar.'],
    puxa: ['Tá me puxando. Nunca ninguém me quis tanto.', 'Soltei o volante e ela continua vindo. Ou eu tô indo.'],
    pouso: ['Freio! Onde fica o freio nessa coisa?', 'Devagar. Eu falei devagar pra mim mesma.', 'Ninguém me ensinou essa parte.'],
    pouso_perfeito: ['Nem acordou a poeira. Põe isso no meu currículo.', 'Pousei. Pousei! Alguém viu? Claro que não.'],
    pouso_bom: ['Foi um pouso. Vou chamar de pouso.', 'Quicou só uma vez. Conta como elegante.'],
    pouso_duro: ['Cheguei. O foguete chegou em várias vezes.', 'Tecnicamente, a Lua freou.'],
    'pegou_tatuVacuo': ['Tatu?! O que você tá fazendo aqui?', 'Ele acenou. Ele só acenou e disse: eu avisei.'],
    filho: ['O patinho olhou pra ele. Ele olhou pro patinho. Tô chorando dentro do capacete.'],
    saltar: ['Tchau, foguete. Foi bom enquanto tinha combustível.', 'Isso aqui é o paraquedas ou a toalha de mesa?', 'O foguete eu pago depois.'],
  };
  const TATU = {
    oficina: ['Esse foguete tá torto. Falei.', 'Isso é fita? Isso é fita.', 'O banco cobra só 20%. Só. Tá vendo o "só"?', 'Sobrou um parafuso. Deve ser enfeite.', 'Se pesar muito, tira o cone. Ninguém gosta do cone.', 'Seu chefe aqui falando: isso é serviço?', 'Eu faria diferente. Não sei como, mas diferente.'],
    encaixe: ['Encaixou. Acho.', 'Agora sim. Eu acho.', 'Boa. Vai dar errado de um jeito novo.', 'Ficou feio. Mas ficou firme. Mentira, feio só.'],
    compra: ['Lá se foi o dinheiro.', 'Era o aluguel, né?', 'Não tem garantia. Nunca teve.', 'Comprou de quem? Daquele cara? Corajosa.'],
    pesado: ['Isso não sai do chão nem com reza.', 'Tá mais pesado que a tua dívida.'],
    recorde: ['Até que subiu! Tô quase impressionado.', 'Vou contar pra todo mundo. Ninguém vai ligar.', 'Bom. Faltam só uns milhares.'],
    casco: ['Eu avisei. Tá gravado que eu avisei.', 'Sobrou o volante. Não tinha volante.', 'Junta os pedaços ali na vizinha. Ela tá brava.'],
    chao: ['Foi lindo. Nem saiu do lugar.', 'Tentou ligar na tomada?', 'Já vi pneu subir mais.'],
    maxq: ['O ar arrancou o foguete porque ele foi torto. Nariz reto, lembra?', 'Pressão máxima não perdoa foguete de lado. Eu perdoo. Não, também não.'],
    tempestade: ['Raio cai em quem fica parado embaixo. Eu nem preciso comentar.', 'Coluna amarela! Eu falei da coluna amarela!'],
    radiacao: ['Radiação gastou o casco. Mais casco, gerador, ou escudo na hora certa.', 'Chegou tostada. Leva gerador da próxima.'],
    normal: ['Pelo menos voltou.', 'Da próxima, vai mais pra cima. É aquele lado ali.', 'Tá. Chão continua igual, se quer saber.'],
  };
  /* O que o tatu diz de útil, conforme o capítulo. Ele reclama, mas sabe o caminho. */
  const TATU_DICA = [
    ['Tanque maior primeiro. Motor forte sem combustível é só barulho.', 'Pega as moedas em fila. Em fila paga mais.', 'Sobe mais. O problema todo fica lá em cima.'],
    ['Depois das nuvens tem vento. Depois do vento tem raio. Depois eu te conto.', 'Coluna amarela no céu: sai de baixo. Não é decoração.', 'Bico melhor corta o ar. O ar segura todo mundo, menos quem é pontudo.'],
    ['Na pressão máxima, nariz reto. Moeda torta custa casco.', 'Quer subir mais? Mais tanque. Ainda é tanque. Vai ser tanque por um tempo.', 'Aleta ajuda a corrigir o vento. Parece bobagem até o vento chegar.'],
    ['Falta pouco para o espaço. Falta muito para o resto.', 'Dois tanques por estágio mudam o voo. Olha ali em Mais espaço.', 'Se o ar te segura, encera o foguete. Tem no Laboratório.'],
    ['Agora tem lixo de verdade. Bate e dói. Escudo é na tecla F.', 'Lá em cima o ar não segura mais. Quem manda é o motor.', 'Ímã. Compra um ímã. Moeda não vem sozinha.'],
    ['Radiação gasta o casco, quilômetro a quilômetro. Gerador conserta. Eu avisei antes de avisar.', 'Quanto mais casco, mais longe. Parece óbvio porque é.', 'Separa o estágio vazio. Peso morto paga pedágio.'],
    ['A muralha tem brecha em toda fileira. Procura antes de chegar nela.', 'Pilotar é com você. É para isso que eu não te pago.', 'Agora os voos ficam compridos. Faz um café.'],
    ['Depois da muralha não tem nada. Por dias. Foi o que me disseram.', 'Anéis em fila são atalho. Os três, senão não vale.', 'Tempo acelerado só no vazio. Tem coisa que não dá para pular.'],
    ['Passou da metade. Voltar custa igual. Vai.', 'Guarda paciência para o final. Dizem que tem que pousar.', 'Parei de te cobrar por hoje. Não é pena, é a conta do telefone.'],
    ['Isso é uma ordem: pouso, segura o turbo na hora certa. Cedo demais, acaba o freio.', 'Abaixo de 6 m/s é pouso. Acima de 14 é outra coisa.', 'Quando chegar, eu vou estar lá. Não pergunta como.'],
    ['Plutão? Plutão nem é mais planeta.', 'Voltou? Achei que ia abrir a filial.', 'Pesquisa a Dobra. Ou fica aí. Eu fico.'],
  ];
  /* O tatu é o chefe dela. O chat da firma pega em qualquer altitude, para azar dela.
     c = capivara, t = tatu. Cada conversa é uma lista de falas, na ordem. */
  const CONVERSA = [
    [
      [['t', 'Bom dia. Seu ponto não bateu.'], ['c', 'Bati, chefe. Bati com o foguete.'], ['t', 'Isso não é ponto. Isso é o muro da vizinha.']],
      [['t', 'Você está de folga?'], ['c', 'Tô em viagem de negócios.'], ['t', 'Qual negócio?'], ['c', 'Ainda não cheguei nele.']],
    ],
    [
      [['t', 'Tá subindo torto.'], ['c', 'É o vento, chefe.'], ['t', 'Na firma ninguém culpa o vento.'], ['c', 'Na firma não venta.']],
      [['t', 'Esse raio é na sua conta.'], ['c', 'O raio caiu em mim!'], ['t', 'Justamente. Na sua conta.']],
      [['t', 'Sua mãe ligou na firma.'], ['c', 'O que o senhor falou?'], ['t', 'Que você está em reunião.'], ['c', 'Em altitude, tecnicamente.']],
    ],
    [
      [['t', 'Nariz reto. Olha o meu.'], ['c', 'O seu é torto, chefe.'], ['t', 'É um nariz experiente.']],
      [['t', 'Quanto custa o casco?'], ['c', 'Não sei.'], ['t', 'Sai do seu vale-refeição.'], ['c', 'Eu tenho vale-refeição?'], ['t', 'Não mais.']],
    ],
    [
      [['t', 'Daqui do chão você é um pontinho.'], ['c', 'Daqui de cima o senhor também, chefe.'], ['t', 'Anotei isso.']],
      [['t', 'Falta pouco para o espaço.'], ['c', 'O senhor tá torcendo por mim?'], ['t', 'Tô calculando a multa.']],
    ],
    [
      [['t', 'Isso é o espaço?'], ['c', 'É.'], ['t', 'O espaço não é home office.'], ['c', 'A internet é melhor que a da firma.']],
      [['t', 'Achou minha chave de fenda?'], ['c', 'Ela me achou. Na janela.'], ['t', 'Devolve. É patrimônio.']],
      [['t', 'Tem gente na Estação?'], ['c', 'Tem. Não abriram a porta.'], ['t', 'Deixa um cartão da firma.']],
    ],
    [
      [['t', 'Como está o casco?'], ['c', 'Existe. É o máximo que posso dizer.'], ['t', 'Se começar a brilhar, volta.'], ['c', 'Se eu começar a brilhar, cobro insalubridade.'], ['t', 'Volta não.']],
      [['t', 'Radiação faz mal?'], ['c', 'Faz, chefe.'], ['t', 'Para o foguete, eu perguntei.']],
    ],
    [
      [['t', 'Tem tanto satélite assim?'], ['c', 'Um deles tá passando a novela.'], ['t', 'Qual capítulo?'], ['c', 'O senhor quer que eu bata nele?'], ['t', 'Quero o capítulo.']],
      [['t', 'Bateu em algum?'], ['c', 'Ainda não.'], ['t', 'Quando bater, não dá meu nome.']],
    ],
    [
      [['t', 'O que tem aí?'], ['c', 'Nada. Muito nada. De todos os lados.'], ['t', 'Aproveita e faz o relatório.']],
      [['t', 'Tá com saudade?'], ['c', 'Da marmita, chefe.'], ['t', 'Ela pediu aumento.'], ['c', 'A marmita?'], ['t', 'Dei. Ela rende mais que você.']],
      [['c', 'Chefe, o senhor tá aí?'], ['t', 'Tô. Por quê?'], ['c', 'Nada. É que é muito vazio aqui.'], ['t', 'Isso é hora extra? Não responde.']],
      [['t', 'Fala alguma coisa.'], ['c', 'O senhor mandou eu não falar em serviço.'], ['t', 'Era sobre o serviço na Terra.']],
    ],
    [
      [['t', 'Ninguém da firma foi tão longe.'], ['c', 'Ninguém da firma foi nem na esquina.'], ['t', 'Isso é verdade. O estagiário se perdeu no estacionamento.']],
      [['t', 'Se der errado, fica com o quê?'], ['c', 'Com a vista.'], ['t', 'A vista é da firma.']],
    ],
    [
      [['t', 'Já está vendo a Lua?'], ['c', 'Ela tá me vendo.'], ['t', 'Lembra de frear.'], ['c', 'Lembra de não falar comigo agora, chefe.']],
      [['t', 'Tem uma coisa que preciso te contar quando você chegar.'], ['c', 'O quê?'], ['t', 'Quando você chegar.']],
    ],
    [
      [['t', 'A filial abre às 8.'], ['c', 'Chefe, eu tô indo para Plutão.'], ['t', 'Então abre às 8 de Plutão.']],
    ],
  ];
  /* Quando ela comenta alguma coisa, ele responde. Ele nunca deixa passar. */
  const RESPOSTA_TATU = {
    decolar: ['Volta aqui.', 'Isso é abandono de posto.', 'Quem autorizou? Ninguém. Eu perguntei.', 'Marquei falta.'],
    bater: ['Vai descontar.', 'Eu vi.', 'Anotado na sua ficha.', 'Esse amassado é seu ou da firma?'],
    casco: ['Quanto tempo aguenta?', 'Nem pense em devolver assim.', 'Traz pelo menos o volante.'],
    semComb: ['Quem paga o combustível sou eu?', 'Eu avisei.', 'Tem reembolso não.'],
    turbo: ['Isso gasta.', 'Devagar. A conta é minha.', 'Tem limite de velocidade na firma.'],
    combo: ['Isso é da firma.', 'Declara tudo.', 'Metade é minha. A metade maior.'],
    surto: ['Tudo isso é da firma, viu?', 'Passa o recibo.'],
    triz: ['Foi sorte. Vai sair da sua sorte.', 'Eu ia reclamar se batesse.'],
    marco: ['Hora extra não. Já falei.', 'Isso vira relatório.', 'Bom. Agora volta.', 'Foto com o logo da firma, por favor.'],
    recorde: ['Eu mandei ir tão longe? Mandei voltar.', 'Vou pôr no mural. Como advertência.', 'Até que subiu. Não conta para ninguém que eu disse.'],
    vento: ['Na firma não venta.', 'Corrige. A aleta foi cara.'],
    tempestade: ['Sai de baixo da coluna amarela. É uma ordem.', 'Raio não está no contrato.'],
    raio: ['Vai descontar a eletricidade.', 'Falei da coluna amarela.'],
    maxq: ['Nariz reto. Olha o meu.', 'Reto. É a única coisa que eu peço.'],
    apertou: ['Reto, eu disse.', 'Esse pedaço era caro.'],
    radiacao: ['Liga o escudo. Com a tecla F, antes que eu mande.', 'Insalubridade não. Já vi onde você quer chegar.'],
    muralha: ['Tem brecha em toda fileira. Procura.', 'Não arranha satélite. Um deles é da minha TV.'],
    puxa: ['Não se empolga.', 'Eu sei o que tem lá.'],
    pouso: ['Freia. Segura o turbo.', 'Freia! Isso custou caro!'],
    pouso_perfeito: ['Vi daqui. Não vou elogiar.', 'Aceitável. Limpa os pés.'],
    pouso_bom: ['Aceitável. Vai descontar a poeira.', 'Vi pior. Foi você mesma, ontem.'],
    pouso_duro: ['Esse buraco era da Lua ou é novo?', 'Vai pagar a cratera.'],
    moedas: ['Declara.', 'Isso é da firma.'],
    caixa: ['Abre longe da fiação.', 'Se tiver coisa boa, é minha.'],
    bolha: ['Isso sai do seu salário.', 'Um por voo. Tá caro.'],
    saltar: ['E o foguete?!', 'Volta e pega o foguete.', 'Isso é patrimônio caindo!'],
    estilingue: ['Atalho conta como hora a menos.', 'Passou nos três? Faz de novo.'],
    absurdo: ['Isso é reembolsável?', 'Não encosta. Encostou? Traz.'],
    viu: ['Olha para a frente.', 'Foco, por favor.', 'Não acena. Isso não passa boa imagem.'],
  };
  /* Na oficina e no resultado ela também responde. */
  const CAPI_RESPONDE = {
    oficina: ['Sim, chefe.', 'Anotado. Não.', 'O senhor não tem o que fazer?', 'Entendido. Vou ignorar.', 'Isso é uma ordem ou um desabafo?', 'Vou pôr na lista. Lá embaixo.'],
    encaixe: ['Encaixou, chefe. Deixa.', 'O senhor quer fazer?', 'Tá firme. Ou tá parado.'],
    compra: ['O dinheiro é meu, chefe.', 'Depois eu devolvo. Ou não.', 'É investimento.'],
    pesado: ['Vai subir. Deixa comigo.', 'Peso é uma opinião.'],
    recorde: ['Viu, chefe?', 'Pode pôr no mural.', 'Quero aumento.'],
    casco: ['Foi o senhor que comprou esse casco.', 'Deu problema técnico.', 'Tinha um meteoro ali, chefe.'],
    chao: ['Foi um teste.', 'Subiu por dentro.'],
    normal: ['Volto amanhã, chefe.', 'Ainda dá para ir mais alto.', 'Voltei inteira. Quase.'],
    maxq: ['Agora eu sei, chefe.', 'O nariz estava reto do meu ponto de vista.'],
    tempestade: ['Era uma coluna muito sem graça.', 'O raio que me achou.'],
    radiacao: ['Tô brilhando, chefe. Quero adicional.', 'Ok. Gerador.'],
  };
  /* O tatu cobrando, do primeiro atraso até a Lua virar filial. Uma cobrança por voo, liberada pela distância. */
  const CHEFE = [
    { km: 0.3, txt: 'Cadê você? A reunião é às 9.', resp: 'Tô a caminho. De algum lugar.' },
    { km: 1.5, txt: 'Seu crachá não passou na catraca hoje.', resp: 'A catraca é lá embaixo.' },
    { km: 6, txt: 'O RH perguntou do seu atestado.', resp: 'Escreve aí: altitude.' },
    { km: 20, txt: 'Vi um foguete da janela. Ele tinha a sua cara.', resp: 'Muita gente tem a minha cara.' },
    { km: 50, txt: 'Primeira advertência. Por escrito.', resp: 'Leio quando descer.' },
    { km: 100, txt: 'Isso é o espaço? O espaço não é home office.', resp: 'A internet tá melhor que a da firma.' },
    { km: 400, txt: 'A marmita na geladeira é sua? Ela se mexeu.', resp: 'Não encosta. Ela tá ali desde março.' },
    { km: 1000, txt: 'Segunda advertência. Assine e devolva.', resp: 'Devolvo quando passar aí.' },
    { km: 6000, txt: 'O RH quer saber se foguete dá direito a vale-transporte.', resp: 'Dá. Manda o vale.' },
    { km: 20000, txt: 'Sua vaga na garagem foi para o estagiário.', resp: 'Pode ficar. Tenho órbita.' },
    { km: 40000, txt: 'Terceira advertência. O formulário não tem campo para "espaço".', resp: 'Marca "outros".' },
    { km: 100000, txt: 'Você está demitida por abandono de posto.', resp: 'Qual posto? Daqui não vejo nenhum.' },
    { km: 150000, txt: 'Devolva o crachá pelo correio.', resp: 'O correio não vem aqui. Já perguntei.' },
    { km: 250000, txt: 'Reconsideramos. O estagiário botou fogo na impressora.', resp: 'Manda um abraço pra impressora.' },
    { km: 340000, txt: 'Oferta final: gerente regional, com vale-refeição.', resp: 'Gerente de qual região?' },
    { km: 380000, txt: 'Quem autorizou essa viagem? Preciso do número do chamado.', resp: 'Abre um chamado na Lua. Tô chegando lá.' },
  ];
  /* A rádio da firma, que pega em qualquer lugar menos na firma. */
  const RADIO = [
    'Bom dia, funcionários. Hoje é sexta. Não é, mas seria bom.',
    'Hora certa: não sabemos. O relógio da recepção caiu.',
    'Aviso da cantina: acabou o café. O de ontem volta amanhã.',
    'Recado da diretoria: o Seu Tatu avisou. Está registrado em ata.',
    'Trânsito agora: tudo parado na marginal. Aí em cima, só você.',
    'Dica de saúde: evite o vácuo sem casaco.',
    'Mensagem da diretoria: o bônus foi adiado para depois do bônus.',
    'Pergunta de ouvinte: a Terra é redonda? Quem estiver aí em cima, confere e liga pra gente.',
    'Sorteio do dia: a ouvinte mais distante ganha um ímã de geladeira.',
    'Próxima música: silêncio. No espaço é o que toca.',
    'Aniversariantes do mês: ninguém. Foi cortado.',
    'Previsão do tempo: não tem tempo. Nem previsão.',
    'Achados e perdidos: um parafuso. Quem deixou cair lá de cima, pode buscar.',
    'Treinamento obrigatório amanhã: como não sair voando do estacionamento.',
  ];
  /* Nunca repete as últimas falas de cada lista. */
  const ditas = new Map();
  const sortear = (l) => {
    const recentes = ditas.get(l) || [];
    const livres = l.filter((x) => !recentes.includes(x));
    const q = (livres.length ? livres : l)[Math.floor(Math.random() * (livres.length || l.length))];
    recentes.push(q);
    if (recentes.length > Math.floor(l.length / 2)) recentes.shift();
    ditas.set(l, recentes);
    return q;
  };

  /* Rádio do dia: em algumas datas a rádio da firma sabe o que está acontecendo. */
  function radioDoDia(data) {
    const d = data || new Date();
    const m = d.getMonth() + 1, dia = d.getDate(), sem = d.getDay();
    if (m === 7 && dia === 20) return 'Hoje faz aniversário a primeira pegada na Lua. Quem for agora, por favor, limpe os pés.';
    if (m === 4 && dia === 1) return 'A diretoria informa: todos foram promovidos. Hoje é primeiro de abril.';
    if (m === 12 && dia === 25) return 'Feliz Natal. Se você vir um trenó aí em cima, dê passagem. Ele tem prioridade.';
    if (m === 1 && dia === 1) return 'Feliz ano novo. O bônus de ano passado continua adiado.';
    if (sem === 5) return 'Hoje é sexta. É sexta mesmo. Conferimos duas vezes.';
    return null;
  }

  RL.Personagens = { chapeu, oculos, capivara, rosto, tatu, balao, criarAtor, vestir, FALAS, TATU, TATU_DICA, CONVERSA, RESPOSTA_TATU, CAPI_RESPONDE, CHEFE, RADIO, sortear, radioDoDia };
  RL.Desenho.capivara = capivara;
  RL.Desenho.rostoCapivara = rosto;
})();
