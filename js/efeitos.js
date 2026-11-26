/* Efeitos em tela: fumaça de desenho animado, faíscas, batidas com letreiro, moedas voando. */
(function () {
  const RL = window.RL;
  const T = '#33281F';
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* Bolha com contorno único: risca tudo grosso e pinta por cima. */
  function nuvemTinta(ctx, x, y, r, lobos, cor) {
    ctx.strokeStyle = T;
    ctx.lineWidth = 3.4;
    ctx.fillStyle = cor;
    ctx.beginPath();
    for (const l of lobos) {
      const lx = x + Math.cos(l.a) * r * l.d, ly = y + Math.sin(l.a) * r * l.d, lr = r * l.r;
      ctx.moveTo(lx + lr, ly);
      ctx.arc(lx, ly, lr, 0, 6.283);
    }
    ctx.stroke();
    ctx.fill();
  }

  const criarLobos = () => {
    const n = 4 + Math.floor(Math.random() * 3);
    const l = [{ a: 0, d: 0, r: 0.72 }];
    for (let i = 0; i < n; i++) l.push({ a: (i / n) * 6.283 + rnd(-0.3, 0.3), d: rnd(0.45, 0.7), r: rnd(0.42, 0.62) });
    return l;
  };

  function burst(ctx, r, pontas, fator) {
    ctx.beginPath();
    for (let i = 0; i < pontas * 2; i++) {
      const a = (i / (pontas * 2)) * 6.283;
      const q = i % 2 ? r * fator : r;
      ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q);
    }
    ctx.closePath();
  }

  function criar() {
    const lista = [];
    const fx = {
      lista,
      puff(x, y, o) {
        const c = o || {};
        lista.push({ k: 'puff', x, y, vx: c.vx || 0, vy: c.vy || 0, r0: c.r || 14, r1: c.r1 || (c.r || 14) * 1.8, vida: c.vida || 0.9, t: 0, cor: c.cor || '#EFEADA', sombra: c.sombra || '#CFC9B6', lobos: criarLobos(), arrasto: c.arrasto == null ? 1 : c.arrasto, atrito: c.atrito || 0 });
      },
      faisca(x, y, n, cor, vel) {
        for (let i = 0; i < n; i++) {
          const a = rnd(0, 6.28), v = rnd(0.35, 1) * (vel || 320);
          lista.push({ k: 'faisca', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: rnd(0.25, 0.55), t: 0, cor: cor || '#F0CF62', arrasto: 0.3 });
        }
      },
      anel(x, y, r1, cor) {
        lista.push({ k: 'anel', x, y, r1, vida: 0.42, t: 0, cor: cor || '#F4F1E4', arrasto: 0.4 });
      },
      pow(x, y, texto, cor) {
        lista.push({ k: 'pow', x, y, texto, vida: 0.62, t: 0, cor: cor || '#F0CF62', rot: rnd(-0.22, 0.22), arrasto: 0.25 });
      },
      brilho(x, y, r, cor) {
        lista.push({ k: 'brilho', x, y, r: r || 12, vida: 0.34, t: 0, cor: cor || '#FFF8DC', arrasto: 0.5, rot: rnd(0, 1) });
      },
      caco(x, y, cor, tam) {
        const a = rnd(0, 6.28), v = rnd(120, 460);
        lista.push({ k: 'caco', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 90, vida: rnd(0.8, 1.5), t: 0, cor, w: tam || rnd(7, 18), h: rnd(5, 12), rot: rnd(0, 6), giro: rnd(-9, 9), g: 420, arrasto: 0.2 });
      },
      moedaVoa(x, y, tx, ty, aoChegar) {
        lista.push({ k: 'moedaVoa', x0: x, y0: y, x, y, tx, ty, vida: 0.46, t: 0, aoChegar, arrasto: 0 });
      },
      capiVoa(x, y, op) {
        lista.push({ k: 'capi', x, y, vx: rnd(-120, 120), vy: -520, vida: 2.6, t: 0, rot: 0, giro: rnd(5, 8) * (Math.random() < 0.5 ? -1 : 1), g: 480, arrasto: 0, op });
      },
      rastro(x, y, tipo, cor, esc) {
        lista.push({ k: 'rastro', tipo, x, y, vx: rnd(-22, 22), vy: rnd(20, 60), vida: rnd(0.5, 1.05), t: 0, r: rnd(4, 10) * esc, cor, rot: rnd(0, 6), arrasto: 0.75 });
      },
      atualizar(dt, vs) {
        for (const p of lista) {
          p.t += dt;
          if (p.g) p.vy += p.g * dt;
          /* a capivara sobe com a explosão e abre o paraquedas no alto */
          if (p.k === 'capi' && p.vy > 20) {
            p.g = 0;
            p.vy = 70;
            p.vx = 0;
            p.giro = 0;
            p.abriu = p.abriu || p.t;
            p.rot = Math.sin((p.t - p.abriu) * 2.2) * 0.14;
          }
          if (p.atrito) {
            p.vx *= 1 - p.atrito * dt;
            p.vy *= 1 - p.atrito * dt;
          }
          if (p.k === 'moedaVoa') {
            const k = Math.min(1, p.t / p.vida);
            const e = k * k * (3 - 2 * k);
            p.x = p.x0 + (p.tx - p.x0) * e;
            p.y = p.y0 + (p.ty - p.y0) * e - Math.sin(k * 3.14) * 40;
            if (k >= 1 && p.aoChegar) {
              p.aoChegar();
              p.aoChegar = null;
            }
          } else {
            p.x += (p.vx || 0) * dt;
            p.y += ((p.vy || 0) + vs * (p.arrasto == null ? 1 : p.arrasto)) * dt;
          }
          if (p.giro) p.rot += p.giro * dt;
        }
        for (let i = lista.length - 1; i >= 0; i--) if (lista[i].t >= lista[i].vida) lista.splice(i, 1);
        if (lista.length > 260) lista.splice(0, lista.length - 260);
      },
      /* com a cena WebGPU, a fumaça sai em aquarela pela GPU (ver enviarFumaca em voo.js) */
      semPuff: false,
      pintar(ctx, tempo) {
        for (const p of lista) {
          if (p.k === 'puff' && fx.semPuff) continue;
          const k = p.t / p.vida;
          switch (p.k) {
            case 'puff': {
              /* cresce rápido e encolhe no fim, sem transparência: é como o desenho faz */
              const cresce = p.r0 + (p.r1 - p.r0) * (1 - (1 - Math.min(1, k * 1.4)) ** 2);
              const r = cresce * (k > 0.7 ? 1 - ((k - 0.7) / 0.3) ** 2 : 1);
              if (r > 0.5) {
                nuvemTinta(ctx, p.x, p.y, r, p.lobos, p.cor);
                ctx.fillStyle = p.sombra;
                ctx.beginPath();
                ctx.arc(p.x + r * 0.26, p.y + r * 0.3, r * 0.46, 0, 6.283);
                ctx.fill();
              }
              break;
            }
            case 'faisca': {
              const f = 1 - k;
              ctx.strokeStyle = p.cor;
              ctx.lineWidth = 2.6 * f + 0.6;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
              ctx.stroke();
              break;
            }
            case 'anel': {
              ctx.strokeStyle = p.cor;
              ctx.lineWidth = 5 * (1 - k) + 0.5;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.r1 * (1 - (1 - k) ** 3), 0, 6.283);
              ctx.stroke();
              break;
            }
            case 'pow': {
              const entra = Math.min(1, k * 7);
              const esc = (k < 0.14 ? 0.7 + entra * 0.55 : 1.25 - Math.min(0.25, (k - 0.14) * 1.4)) * (k > 0.8 ? 1 - (k - 0.8) * 5 : 1);
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rot);
              ctx.scale(esc, esc);
              burst(ctx, 42, 10, 0.68);
              ctx.fillStyle = p.cor;
              ctx.strokeStyle = T;
              ctx.lineWidth = 2.4;
              ctx.fill();
              ctx.stroke();
              ctx.font = "400 21px 'Lilita One',sans-serif";
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = T;
              ctx.fillText(p.texto, 0, 1);
              ctx.restore();
              break;
            }
            case 'brilho': {
              const r = p.r * Math.sin(k * 3.14);
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rot);
              ctx.fillStyle = p.cor;
              ctx.strokeStyle = T;
              ctx.lineWidth = 1.2;
              burst(ctx, r, 4, 0.28);
              ctx.fill();
              ctx.stroke();
              ctx.restore();
              break;
            }
            case 'caco': {
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rot);
              ctx.fillStyle = p.cor;
              ctx.strokeStyle = T;
              ctx.lineWidth = 1.6;
              ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
              ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
              ctx.restore();
              break;
            }
            case 'moedaVoa': {
              ctx.fillStyle = '#E0B23C';
              ctx.strokeStyle = T;
              ctx.lineWidth = 1.6;
              const larg = Math.abs(Math.cos(tempo * 18)) * 9 + 2;
              ctx.beginPath();
              ctx.ellipse(p.x, p.y, larg, 10 - k * 3, 0, 0, 6.283);
              ctx.fill();
              ctx.stroke();
              break;
            }
            case 'capi': {
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rot);
              RL.Desenho.capivara(ctx, 0, p.abriu ? 140 : 56, 0.62, { pose: p.abriu ? 'paraquedas' : 'susto', t: tempo, astronauta: !!p.abriu });
              ctx.restore();
              break;
            }
            case 'rastro': {
              const f = 1 - k;
              ctx.fillStyle = p.cor;
              ctx.strokeStyle = T;
              ctx.lineWidth = 1.2;
              if (p.tipo === 'bolhas') {
                ctx.fillStyle = 'rgba(191,227,230,.35)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * (0.7 + k * 0.5), 0, 6.283);
                ctx.fill();
                ctx.stroke();
              } else if (p.tipo === 'confete') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot + p.t * 8);
                ctx.fillRect(-4.5, -2.2, 9, 4.4);
                ctx.strokeRect(-4.5, -2.2, 9, 4.4);
                ctx.restore();
              } else if (p.tipo === 'estrelas') {
                RL.Desenho.adesivo(ctx, 'estrela', p.x, p.y, p.r * 1.8 * f + 2, p.cor);
              } else if (p.tipo === 'arcoiris') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * f + 2, 0, 6.283);
                ctx.fill();
                ctx.stroke();
              } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * f + 1.5, 0, 6.283);
                ctx.fill();
                if (p.r > 7) ctx.stroke();
              }
              break;
            }
            default:
          }
        }
      },
    };
    return fx;
  }

  /* Mola simples: valor persegue o alvo com sobra. */
  function mola(rigidez, amortece) {
    return {
      v: 0, x: 0, alvo: 0,
      passo(dt) {
        const a = (this.alvo - this.x) * rigidez - this.v * amortece;
        this.v += a * dt;
        this.x += this.v * dt;
        return this.x;
      },
    };
  }

  RL.Efeitos = { criar, mola };
})();
