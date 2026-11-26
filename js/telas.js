/* Menus do jogo. */
(function () {
  const RL = window.RL;
  const D = () => RL.Desenho;
  const P = new Proxy({}, { get: (_, k) => RL.Personagens[k] });
  const fmt = (n) => Math.floor(n).toLocaleString('pt-BR');
  const limitar = (x, a, b) => Math.max(a, Math.min(b, x));

  function el(tag, attrs, ...filhos) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v === true) e.setAttribute(k, '');
      else if (v !== false && v != null) e.setAttribute(k, v);
    }
    for (const f of filhos.flat()) if (f != null) e.append(f);
    return e;
  }
  const botao = (txt, onclick, cls, extra) => el('button', { class: 'bt ' + (cls || ''), type: 'button', onclick: (ev) => { RL.Som.iniciar(); RL.Som.clique(); onclick(ev); }, ...(extra || {}) }, txt);

  let App = null;
  const jogo = () => App.jogo;

  function fundo(pintura, filtro) {
    const c = el('canvas', { class: 'fundo' + (filtro ? ' ' + filtro : '') });
    const ajustar = () => {
      if (!c.isConnected) {
        window.removeEventListener('resize', ajustar);
        return;
      }
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      RL.Pintura.cobrir(c.getContext('2d'), pintura(), c.width, c.height);
    };
    requestAnimationFrame(ajustar);
    window.addEventListener('resize', ajustar);
    return c;
  }

  /* ---------- Barra de cima ---------- */
  function barra(atual) {
    const nav = el('nav', { class: 'nav' });
    for (const [id, nome] of [['oficina', 'Oficina'], ['pintura', 'Pintura'], ['laboratorio', 'Laboratório'], ['contratos', 'Contratos'], ['banco', 'Banco'], ['mapa', 'Mapa'], ['conquistas', 'Conquistas'], ['opcoes', 'Opções']]) {
      nav.append(botao(nome, () => App.ir(id), 'bt-nav' + (id === atual ? ' atual' : ''), { 'data-tela': id }));
    }
    return el('header', { class: 'barra' },
      el('div', { class: 'carteira', id: 'carteira' }, el('span', { class: 'icone-moeda' }), el('b', { id: 'saldo' }, textoSaldo())),
      nav,
      el('div', { class: 'recorde' }, 'Recorde ', el('b', {}, RL.fmtKm(jogo().recorde) + ' km')));
  }
  const textoSaldo = () => (RL.MODO_DEV ? '∞' : fmt(jogo().moedas));
  function atualizarSaldo() {
    const s = document.getElementById('saldo');
    if (s) s.textContent = textoSaldo();
  }

  /* ---------- Abertura ---------- */
  function abertura(raiz) {
    const tem = !!App.temSalvo();
    const j = jogo();
    const c = el('canvas', { class: 'palco palco-titulo' });
    const letras = (txt, i0) => [...txt].map((l, i) => el('i', { style: `--i:${i0 + i}` }, l === ' ' ? ' ' : l));
    raiz.append(fundo(RL.Pintura.parque), c,
      el('div', { class: 'logo' },
        el('h1', { 'aria-label': 'Rumo à Lua' }, el('b', {}, letras('Rumo à', 0)), el('span', {}, letras('Lua', 6))),
        el('p', { class: 'chamada' }, 'Fica só a 384.400 km.')),
      el('nav', { class: 'menu-inicial', 'aria-label': 'Menu principal' },
        tem ? botao('Continuar', () => App.continuar(), 'bt-principal', { id: 'bt-continuar' }) : null,
        botao(tem ? 'Novo jogo' : 'Começar', () => {
          if (tem && !confirm('Começar de novo apaga o jogo salvo. Continuar?')) return;
          App.novo();
        }, tem ? '' : 'bt-principal', { id: 'bt-novo' }),
        botao('Opções', () => App.ir('opcoes'), '', { id: 'bt-opcoes-titulo' }),
        tem && j.voos ? el('p', { class: 'titulo-recorde' }, `Recorde: ${RL.fmtKm(j.recorde)} km`) : null));

    const fx = RL.Efeitos.criar();
    const nuvens = [0, 1, 2].map((n) => ({ n, x: Math.random(), y: 0.03 + n * 0.09, v: 0.006 + n * 0.003 }));
    const folhas = Array.from({ length: 9 }, (_, i) => ({ x: Math.random(), y: Math.random(), v: 0.02 + Math.random() * 0.03, f: i * 1.7, c: ['#6E9A45', '#A3C062', '#8E9F4E'][i % 3], e: 0.7 + Math.random() * 0.6 }));
    const t0 = performance.now();
    let ultimo = t0, prox = 0, mx = 0.5, my = 0.5;

    c.addEventListener('pointermove', (e) => { mx = e.clientX / c.width; my = e.clientY / c.height; });
    /* cutucar a Lua também tem limite */
    let cutucouLua = 0;
    c.addEventListener('pointerdown', (e) => {
      const r = Math.min(c.height * 0.265, c.width * 0.19);
      if (Math.hypot(e.clientX - c.width / 2, e.clientY - c.height * 0.275) > r) return;
      RL.Som.clique();
      if (++cutucouLua >= 7) {
        const ch = document.querySelector('.chamada');
        if (ch) ch.textContent = 'Ela te viu. Fica só a 384.400 km.';
        if (RL.revelar(j, 'lua')) {
          RL.Som.marco();
          App.salvar();
        }
      }
    });

    const laco = (agora) => {
      if (!c.isConnected) return;
      const dt = Math.max(0, Math.min(0.05, (agora - ultimo) / 1000));
      ultimo = agora;
      const t = agora / 1000;
      const idade = (agora - t0) / 1000;
      if (c.width !== window.innerWidth || c.height !== window.innerHeight) {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
      }
      const ctx = c.getContext('2d');
      const H = c.height, W = c.width;
      ctx.clearRect(0, 0, W, H);

      /* Lua nascendo atrás do logotipo */
      const sobe = 1 - (1 - Math.min(1, idade / 1.15)) ** 3;
      const moonR = Math.min(H * 0.265, W * 0.19);
      const moonX = W * 0.5 + (mx - 0.5) * -10, moonY = H * 0.275 + (1 - sobe) * H * 0.34 + (my - 0.5) * -6;
      const halo = ctx.createRadialGradient(moonX, moonY, moonR * 0.9, moonX, moonY, moonR * 1.32);
      halo.addColorStop(0, 'rgba(255,250,225,.6)');
      halo.addColorStop(1, 'rgba(255,250,225,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 1.32, 0, 6.283);
      ctx.fill();
      ctx.save();
      ctx.translate(moonX, moonY);
      ctx.rotate(t * 0.012);
      ctx.drawImage(RL.Pintura.lua(), -moonR, -moonR, moonR * 2, moonR * 2);
      ctx.restore();

      ctx.globalAlpha = 0.5;
      for (const n of nuvens) {
        n.x = (n.x + n.v * dt) % 1.3;
        const img = RL.Pintura.nuvem(n.n);
        ctx.drawImage(img, (n.x - 0.2) * W, n.y * H, img.width, img.height);
      }
      ctx.globalAlpha = 1;
      /* folhas caindo das árvores */
      for (const f of folhas) {
        f.y += f.v * dt;
        if (f.y > 1.05) {
          f.y = -0.05;
          f.x = Math.random();
        }
        const fxx = f.x * W + Math.sin(t * 1.4 + f.f) * 22, fy = f.y * H;
        ctx.save();
        ctx.translate(fxx, fy);
        ctx.rotate(Math.sin(t * 1.9 + f.f) * 1.1);
        ctx.scale(f.e, f.e);
        ctx.fillStyle = f.c;
        ctx.strokeStyle = D().TRACO;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.quadraticCurveTo(0, -6, 7, 0);
        ctx.quadraticCurveTo(0, 6, -7, 0);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      requestAnimationFrame(laco);
    };
    requestAnimationFrame(laco);
  }

  /* ---------- História curta do começo ---------- */
  const QUADROS = [
    { fundo: 'parque', texto: 'Esta é uma capivara. Ela tem um emprego e devia estar nele agora.' },
    { fundo: 'noite', texto: 'Ontem à noite ela olhou para a Lua e pensou: fica só a 384.400 km.' },
    { fundo: 'parque', texto: 'Seu chefe, um tatu de capacete, disse para não fazer isso. Ela pegou um galão de quintal e um soprador de folhas. Ele veio junto, para continuar dizendo.' },
  ];
  function historia(raiz) {
    let i = 0;
    const c = el('canvas', { class: 'palco' });
    const txt = el('p', { class: 'historia-texto' });
    const bt = botao('Próximo', () => {
      i++;
      if (i >= QUADROS.length) return fim();
      mostrar();
    }, 'bt-principal', { id: 'bt-historia' });
    const fim = () => {
      jogo().abertura = true;
      App.salvar();
      App.ir('oficina');
    };
    raiz.append(c, el('div', { class: 'historia' }, txt, el('div', { class: 'historia-botoes' }, botao('Pular', fim), bt)));
    function mostrar() {
      const q = QUADROS[i];
      txt.textContent = q.texto;
      bt.textContent = i === QUADROS.length - 1 ? 'Ir para a oficina' : 'Próximo';
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      const ctx = c.getContext('2d');
      const W = c.width, H = c.height;
      if (q.fundo === 'noite') {
        RL.Pintura.cobrir(ctx, RL.Pintura.faixa('vazio'), W, H);
        const r = Math.min(W, H) * 0.22;
        ctx.drawImage(RL.Pintura.lua(), W * 0.68 - r, H * 0.3 - r, r * 2, r * 2);
        D().capivara(ctx, W * 0.3, H * 0.92, H / 340, { pose: 'parada', olhar: 1 });
        P.tatu(ctx, W * 0.16, H * 0.92, H / 460, { vira: false });
      } else {
        RL.Pintura.cobrir(ctx, RL.Pintura.parque(), W, H);
        D().capivara(ctx, W * 0.42, H * 0.86, H / 340, { pose: i === 0 ? 'parada' : 'aponta', olhar: 1 });
        if (i > 0) P.tatu(ctx, W * 0.24, H * 0.86, H / 460, {});
      }
    }
    mostrar();
  }

  /* ---------- Bancada: canvas com o foguete e os encaixes ---------- */
  function criarBancada(opcoes) {
    const c = el('canvas', { class: 'bancada', id: 'bancada' });
    let trans = { x: 0, y: 0, e: 1 }, L = null;
    const fx = RL.Efeitos.criar();
    const molaPop = RL.Efeitos.mola(320, 15);
    molaPop.x = molaPop.alvo = 1;
    const molaBalanco = RL.Efeitos.mola(60, 5);
    let popCaminho = null, festa = 0, ultimo = performance.now();
    let fala = null, falaAte = 0, falaInicio = 0, proxFala = performance.now() + 3500;
    let falaCapi = null, capiDe = 0, capiAte = 0;
    const capi = RL.Personagens.criarAtor('chave');
    /* cutucar o tatu tem limite */
    let cutucadas = 0;
    const RECLAMA = ['Ei.', 'Para.', 'Eu sei que você está fazendo isso.', 'Sou seu chefe. Isso vai para a sua ficha.', 'Tá. Toma aí seu segredo. Agora para.'];
    c.addEventListener('pointerdown', (ev) => {
      const r = c.getBoundingClientRect();
      const qx = ev.clientX - r.left, qy = ev.clientY - r.top;
      if (opcoes.semCapivara || Math.abs(qx - (r.width - Math.max(58, r.width * 0.1))) > 55 || qy < r.height - 120) return;
      fala = RECLAMA[Math.min(RECLAMA.length - 1, Math.floor(cutucadas / 2))];
      falaInicio = performance.now();
      falaAte = falaInicio + 2400;
      proxFala = falaInicio + 9000;
      if (++cutucadas >= 9 && RL.revelar(jogo(), 'cutucou')) {
        RL.Som.marco();
        App.salvar();
      } else RL.Som.clique();
    });
    if (opcoes.rolavel) {
      c.addEventListener('wheel', (ev) => {
        if (!b.sobra) return;
        ev.preventDefault();
        b.rolagem = limitar((b.rolagem || 0) - ev.deltaY, 0, b.sobra);
        b.pintar();
      }, { passive: false });
    }
    const b = {
      c, selecionado: opcoes.selecionado || null, destaque: null, foguete: () => jogo().foguete,
      ajustar() {
        const r = c.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        c.width = r.width * dpr;
        c.height = r.height * dpr;
        c.style.width = r.width + 'px';
        c.style.height = r.height + 'px';
        b.dpr = dpr;
        b.pintar();
      },
      pintar() {
        if (!c.isConnected || !c.width) return;
        const ctx = c.getContext('2d');
        ctx.setTransform(b.dpr, 0, 0, b.dpr, 0, 0);
        const W = c.width / b.dpr, H = c.height / b.dpr;
        ctx.clearRect(0, 0, W, H);
        if (opcoes.cena && opcoes.cena(ctx, W, H)) return;
        const build = b.foguete();
        const lim = opcoes.semFantasma ? null : RL.limites(jogo());
        L = D().layout(build, lim);
        /* de pé sobre a base, no meio, com a dupla dos lados sem encostar */
        const pe = H - 62;
        const inteiro = Math.min(1.7, (pe - 18) / Math.max(L.altura, 1), (W - 150) / 200);
        /* Foguete alto não encolhe até virar fio: fica grande e a roda do mouse percorre.
           Ao arrastar uma peça, mostra o foguete inteiro para achar o encaixe. */
        const grande = opcoes.rolavel ? Math.min(Math.max(inteiro, 0.62), (W - 150) / 200) : inteiro;
        const alvoE = b.destaque ? inteiro : grande;
        b.eSuave = b.eSuave ? b.eSuave + (alvoE - b.eSuave) * 0.18 : alvoE;
        if (Math.abs(b.eSuave - alvoE) < 0.002) b.eSuave = alvoE;
        const e = b.eSuave;
        const sobra = Math.max(0, L.altura * e - (pe - 18));
        b.rolagem = limitar(b.rolagem || 0, 0, sobra);
        b.sobra = sobra;
        const rol = b.rolagem;
        trans = { x: W / 2, y: pe - L.altura * e + rol, e };
        if (!opcoes.semBase) {
          ctx.save();
          ctx.translate(W / 2, pe + rol);
          D().plataforma(ctx, 40 * Math.max(0.8, e), L.altura * e, 0, performance.now() / 1000, true);
          ctx.restore();
        }
        ctx.save();
        ctx.translate(trans.x, trans.y);
        ctx.scale(e, e);
        ctx.translate(0, L.altura);
        ctx.rotate(molaBalanco.x);
        ctx.translate(0, -L.altura);
        const t = performance.now() / 1000;
        /* no chão a capivara está de pé ao lado: a cabine só tem piloto quando o foguete está no ar */
        const opF = { lim, t, semPiloto: true };
        if (popCaminho && Math.abs(molaPop.x - 1) > 0.012) D().desenharFoguete(ctx, build, jogo().pintura, { ...opF, pop: { caminho: popCaminho, s: molaPop.x } });
        else if (opcoes.vivo) D().desenharFoguete(ctx, build, jogo().pintura, opF);
        else D().pintarSprite(ctx, build, jogo().pintura, opF);
        if (opcoes.sobreposicao) opcoes.sobreposicao(ctx, e);
        ctx.lineWidth = 1.6 / e;
        b.avisoRolar = opcoes.rolavel && sobra > 0 && !b.destaque;
        for (const s of L.slots) {
          const sel = b.selecionado === s.caminho;
          const aceitaAlvo = b.destaque && RL.aceita(s.caminho).includes(b.destaque);
          if (s.id && !sel && !aceitaAlvo) continue;
          ctx.setLineDash(s.id ? [] : [5 / e, 4 / e]);
          ctx.strokeStyle = sel ? '#C8513F' : aceitaAlvo ? '#3F8F87' : 'rgba(35,32,28,.62)';
          ctx.fillStyle = sel ? (opcoes.semFantasma ? 'rgba(200,81,63,0)' : 'rgba(200,81,63,.2)') : aceitaAlvo ? 'rgba(63,143,135,.28)' : 'rgba(255,255,255,.3)';
          const q = (x) => {
            ctx.beginPath();
            ctx.rect(x, s.y, s.w, s.h);
            if (!s.id || aceitaAlvo || sel) ctx.fill();
            ctx.stroke();
          };
          q(s.x);
          if (s.espelho) q(-s.x - s.w);
          if (!s.id && s.h <= 20) {
            ctx.fillStyle = 'rgba(35,32,28,.75)';
            ctx.font = `400 ${15}px 'Lilita One',sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', s.x + s.w / 2, s.y + s.h / 2 + 1);
          }
        }
        ctx.setLineDash([]);
        ctx.restore();
        if (b.avisoRolar) {
          /* o foguete passou da tela: avisa que dá para percorrer */
          ctx.save();
          ctx.font = "21px 'Patrick Hand',sans-serif";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.lineJoin = 'round';
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#F4F1E4';
          ctx.fillStyle = '#33281F';
          const msg = rol < sobra ? 'Role o mouse para subir' : 'Role o mouse para descer';
          ctx.strokeText(msg, W / 2, 16);
          ctx.fillText(msg, W / 2, 16);
          ctx.restore();
        }
        if (W > 430 && !opcoes.semCapivara) {
          const t = performance.now() / 1000;
          const agora = performance.now();
          capi.pose(festa > 0 ? 'comemora' : 'chave');
          const cx = Math.max(46, W * 0.1), tx = W - Math.max(58, W * 0.1);
          capi.pintar(ctx, cx, H - 8, Math.min(1.02, H / 600), { t, olhar: 1, chave: festa <= 0 });
          P.tatu(ctx, tx, H - 8, Math.min(0.95, H / 580), { t, falando: agora < falaAte, vira: true, pulo: festa > 0 });
          if (agora < falaAte && fala) P.balao(ctx, tx - 16, H - 78, fala, W, { larg: 226, fonte: 21, escala: Math.min(1, (agora - falaInicio) / 130) });
          /* e ela responde */
          if (falaCapi && agora > capiDe && agora < capiAte) P.balao(ctx, cx + 22, H - 8 - 186 * Math.min(1.02, H / 600), falaCapi, W, { larg: 200, fonte: 21, escala: Math.min(1, (agora - capiDe) / 130) });
        }
        fx.pintar(ctx, performance.now() / 1000);
      },
      dizer(chave) {
        const agora = performance.now();
        /* metade das vezes o tatu diz algo útil para o capítulo em que o jogador está */
        const dicas = chave === 'oficina' && Math.random() < 0.55 ? P.TATU_DICA[RL.capituloDe(jogo().recorde).i] : null;
        fala = P.sortear(dicas || P.TATU[chave]);
        falaInicio = agora;
        falaAte = agora + 2800;
        proxFala = agora + 11000;
        const respostas = P.CAPI_RESPONDE[chave];
        falaCapi = respostas && Math.random() < 0.7 ? P.sortear(respostas) : null;
        capiDe = agora + 2300;
        capiAte = capiDe + 2800;
      },
      encaixou(caminho) {
        popCaminho = caminho;
        molaPop.x = 1.32;
        molaPop.v = 0;
        molaBalanco.v += 0.34 * (Math.random() < 0.5 ? -1 : 1);
        festa = 0.7;
        const s = L && L.slots.find((q) => q.caminho === caminho);
        if (s) {
          const px = trans.x + (s.x + s.w / 2) * trans.e, py = trans.y + (s.y + s.h / 2) * trans.e;
          for (let i = 0; i < 6; i++) fx.puff(px + (Math.random() - 0.5) * s.w * trans.e, py + (Math.random() - 0.5) * s.h * trans.e * 0.6, { r: 4, r1: 11, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 70, vida: 0.42, arrasto: 0, atrito: 2 });
        }
      },
      laco(agora) {
        if (!c.isConnected) return;
        const dt = Math.max(0, Math.min(0.05, (agora - ultimo) / 1000));
        ultimo = agora;
        molaPop.passo(dt);
        molaBalanco.passo(dt);
        fx.atualizar(dt, 0);
        festa = Math.max(0, festa - dt);
        capi.atualizar(dt, performance.now() / 1000);
        if (agora > proxFala && !opcoes.semCapivara) b.dizer('oficina');
        b.pintar();
        requestAnimationFrame(b.laco);
      },
      aTela(x, y) {
        const r = c.getBoundingClientRect();
        return { x: r.left + trans.x + x * trans.e, y: r.top + trans.y + y * trans.e };
      },
      observar() {
        const ro = new ResizeObserver(() => b.ajustar());
        ro.observe(c.parentElement);
        requestAnimationFrame(b.laco);
        return () => ro.disconnect();
      },
      pontoLocal(cx, cy) {
        const r = c.getBoundingClientRect();
        return { x: (cx - r.left - trans.x) / trans.e, y: (cy - r.top - trans.y) / trans.e };
      },
      slotEm(cx, cy) {
        const r = c.getBoundingClientRect();
        const x = (cx - r.left - trans.x) / trans.e, y = (cy - r.top - trans.y) / trans.e;
        if (!L) return null;
        for (const s of [...L.slots].reverse()) {
          const dentro = (sx) => x >= sx && x <= sx + s.w && y >= s.y && y <= s.y + s.h;
          if (dentro(s.x) || (s.espelho && dentro(-s.x - s.w))) return s;
        }
        return null;
      },
    };
    RL.Bancada = b;
    return b;
  }

  /* ---------- Oficina ---------- */
  function estatPeca(p) {
    const f = (x, d) => (+x.toFixed(d || 1)).toLocaleString('pt-BR');
    switch (p.tipo) {
      case 'bico': return `Arrasto ${Math.round(p.arrasto * 100)}% · Casco +${f(p.casco, 0)}`;
      case 'capsula': return `Casco +${f(p.casco, 0)} · Controle ${f(p.controle)}`;
      case 'tanque': return `Combustível ${f(p.combustivel)} t · Peso ${f(p.massa, 2)} t`;
      case 'motor': return `Empuxo ${f(p.empuxo, 0)} kN · Peso ${f(p.massa, 1)} t`;
      case 'aleta': return `Controle +${f(p.controle, 2)}`;
      case 'lateral': return `Turbo +${f(p.empuxo, 0)} kN · Sem combustível`;
      case 'cofre': return `Moedas +${Math.round(p.moeda * 100)}%`;
      case 'radar': return `Eventos e caixas +${Math.round(p.sorte * 100)}%`;
      case 'paraquedas': return `Queda +${Math.round(p.queda * 100)}% de tempo`;
      case 'escudo': return `Casco +${f(p.casco, 0)} · Dano -${Math.round(p.reducao * 100)}%`;
      case 'gerador': return `Conserta ${f(p.regen, 2)}/s · Recarrega o turbo`;
      case 'antena': return `Pagamento +${Math.round(p.pagamento * 100)}%`;
      case 'ima': return `Puxa moedas a ${Math.round(p.raio * 3.2)} px`;
      case 'carga': return `Pagamento +${Math.round(p.pagamento * 100)}% · Pesa ${f(p.massa, 1)} t`;
      case 'enfeite': return p.bonus;
      default: return '';
    }
  }

  function textoTempo(seg) {
    if (seg < 90) return Math.round(seg) + ' s';
    return Math.round(seg / 60) + ' min';
  }

  /* Encaixa uma peça onde ela mais faz sentido: vaga vazia primeiro. */
  function encaixeDe(j, tipo) {
    const lista = D().layout(j.foguete, RL.limites(j)).slots.filter((s) => RL.aceita(s.caminho).includes(tipo));
    return lista.find((s) => !s.id) || lista[0] || null;
  }

  /* A melhor próxima compra: o que dá para pagar agora, ou o que falta menos para pagar. */
  function proximaCompra(j) {
    if (RL.problemasDoBuild(j.foguete).length) return null;
    const base = RL.simular(RL.atributos(j.foguete, j)).h;
    const ops = [];
    for (const l of Object.values(RL.PECAS_POR_TIPO)) {
      for (const p of l.filter((q) => !j.pecas.includes(q.id) && RL.pecaLiberada(j, q) && q.preco > 0).slice(0, 2)) {
        const alvo = encaixeDe(j, p.tipo);
        if (!alvo) continue;
        const copia = JSON.parse(JSON.stringify(j.foguete));
        RL.encaixar(copia, alvo.caminho, p.id);
        if (RL.problemasDoBuild(copia).length) continue;
        const km = RL.simular(RL.atributos(copia, j)).h;
        if (km > base * 1.01) ops.push({ tipo: 'peca', id: p.id, nome: p.nome, preco: p.preco, km });
      }
    }
    for (const id of ['empuxo', 'combustivel', 'peso', 'arrasto']) {
      const preco = RL.custoPesquisa(j, id);
      if (!isFinite(preco)) continue;
      const copia = { ...j, pesquisa: { ...j.pesquisa, [id]: RL.nivelPesquisa(j, id) + 1 } };
      const km = RL.simular(RL.atributos(j.foguete, copia)).h;
      if (km > base * 1.002) ops.push({ tipo: 'pesquisa', id, nome: RL.PESQUISA[id].nome, preco, km });
    }
    if (!ops.length) return null;
    const nota = (o) => (o.km / Math.max(base, 0.1) - 1) / o.preco;
    const dentro = ops.filter((o) => o.preco <= j.moedas).sort((a, b) => nota(b) - nota(a));
    const melhor = dentro[0] || ops.sort((a, b) => a.preco - b.preco)[0];
    return { ...melhor, ganho: melhor.km - base, pode: melhor.preco <= j.moedas };
  }

  function comprarAlvo(j, c) {
    if (c.tipo === 'pesquisa') return RL.comprarPesquisa(j, c.id);
    if (!RL.comprarPeca(j, c.id)) return false;
    const alvo = encaixeDe(j, RL.PECAS[c.id].tipo);
    if (alvo) RL.encaixar(j.foguete, alvo.caminho, c.id);
    return true;
  }

  function oficina(raiz, memoria) {
    const j = jogo();
    let tipoAtual = (memoria && memoria.tipo) || 'motor';
    const b = criarBancada({ rolavel: true });
    const centro = el('section', { class: 'centro' }, b.c);
    const prancheta = el('aside', { class: 'prancheta' });
    const prateleira = el('div', { class: 'prateleira', id: 'prateleira' });
    const abasTipo = el('div', { class: 'tipos' });
    const lado = el('aside', { class: 'loja' }, abasTipo, prateleira);
    const lancar = botao('LANÇAR', () => App.lancar(), 'bt-lancar', { id: 'bt-lancar' });
    const avisos = el('p', { class: 'avisos-build', role: 'status' });
    raiz.append(fundo(RL.Pintura.parque, 'apagado'), barra('oficina'),
      el('div', { class: 'oficina entrar' }, prancheta, el('div', { class: 'meio' }, centro, el('div', { class: 'rodape-oficina' }, avisos, lancar)), lado));

    const encaixesValidos = (tipo) => D().layout(j.foguete, RL.limites(j)).slots.filter((s) => RL.aceita(s.caminho).includes(tipo));

    function encaixar(caminho, id) {
      RL.encaixar(j.foguete, caminho, id);
      RL.Som.encaixe();
      App.salvar();
      desenharTudo();
      if (id) {
        b.encaixou(caminho);
        if (Math.random() < 0.5) b.dizer('encaixe');
      }
    }

    function colocar(id) {
      const p = RL.PECAS[id];
      const lista = encaixesValidos(p.tipo);
      if (!lista.length) {
        RL.Som.erro();
        avisos.textContent = 'Sem encaixe livre para essa peça.';
        return;
      }
      const alvo = lista.find((s) => s.caminho === b.selecionado) || lista.find((s) => !s.id) || lista[0];
      b.selecionado = alvo.caminho;
      encaixar(alvo.caminho, id);
    }

    function comprar(id) {
      if (!RL.comprarPeca(j, id)) {
        RL.Som.erro();
        return;
      }
      RL.Som.compra();
      colocar(id);
      b.dizer('compra');
      App.salvar();
    }

    function preverAlcance(id) {
      const p = RL.PECAS[id];
      const lista = encaixesValidos(p.tipo);
      if (!lista.length) return null;
      const alvo = lista.find((s) => s.caminho === b.selecionado) || lista.find((s) => !s.id) || lista[0];
      const copia = JSON.parse(JSON.stringify(j.foguete));
      RL.encaixar(copia, alvo.caminho, id);
      if (RL.problemasDoBuild(copia).length) return null;
      return RL.simular(RL.atributos(copia, j)).h;
    }

    /* A peça ao alcance do bolso que mais empurra o foguete, por moeda gasta. */
    function melhorCompra() {
      if (RL.problemasDoBuild(j.foguete).length) return null;
      const base = RL.simular(RL.atributos(j.foguete, j)).h;
      let melhor = null, nota = 0;
      for (const l of Object.values(RL.PECAS_POR_TIPO)) {
        const lista = l.filter((p) => !j.pecas.includes(p.id) && RL.pecaLiberada(j, p) && j.moedas >= p.preco && p.preco > 0).slice(-2);
        for (const p of lista) {
          const km = preverAlcance(p.id);
          if (km == null || km <= base * 1.01) continue;
          const n = (km / Math.max(base, 0.1) - 1) / p.preco;
          if (n > nota) {
            nota = n;
            melhor = p;
          }
        }
      }
      return melhor;
    }

    function blocoMeta() {
      const prox = RL.MARCOS.find((m) => j.recorde < m.km);
      const c = RL.capituloDe(j.recorde);
      const fim = Math.min(c.ate, RL.KM_FIM);
      const ini = Math.log10(1 + c.de);
      const pc = Math.max(2, Math.min(100, ((Math.log10(1 + j.recorde) - ini) / (Math.log10(1 + fim) - ini)) * 100));
      return el('div', { class: 'meta', id: 'meta' },
        jornada(c.i),
        el('small', {}, `Capítulo ${c.i + 1} de ${RL.CAPITULOS.length}`),
        el('b', {}, c.nome),
        el('p', { class: 'meta-texto' }, c.meta),
        el('div', { class: 'barra-lua' }, el('i', { style: `width:${pc}%` })),
        prox ? el('small', {}, `Próximo marco: ${prox.nome}, ${RL.fmtKm(prox.km)} km. Prêmio de ${fmt(prox.premio)}.`) : el('small', {}, 'Acabou o mapa.'));
    }

    /* Mais lugar no foguete: compra direto, sem precisar ir ao Laboratório. */
    function blocoEspaco() {
      const l = RL.limites(j);
      const atual = { modulos: l.modulos, empilhar: l.tanques, estagios: l.estagios };
      return el('div', { class: 'espaco-loja', id: 'espaco-loja' },
        el('b', {}, 'Mais espaço no foguete'),
        Object.keys(RL.ESPACOS).map((id) => {
          const custo = RL.custoEspaco(j, id);
          const nome = RL.ESPACOS[id].nome;
          return el('div', { class: 'espaco-linha' },
            el('span', {}, `${nome[0].toUpperCase() + nome.slice(1)}: ${atual[id]} ${atual[id] === 1 ? 'vaga' : 'vagas'}`),
            isFinite(custo)
              ? botao(fmt(custo), () => {
                if (!RL.comprarEspaco(j, id)) {
                  RL.Som.erro();
                  return;
                }
                RL.Som.salto();
                b.dizer('compra');
                App.salvar();
                desenharTudo();
              }, 'bt-mini bt-preco', { 'data-espaco': id, disabled: j.moedas < custo })
              : el('small', {}, 'No máximo'));
        }));
    }

    function blocoBolha() {
      const custo = RL.custoBolha(j);
      return el('div', { class: 'bolha-loja', id: 'bolha-loja' },
        el('div', {}, el('b', {}, `Escudo de bolha: ${fmt(j.bolhas.qtd)}`), el('small', {}, `Tecla ${textoTecla(j.opcoes.teclas.escudo)} no voo. ${RL.BOLHA_SEG} segundos sem dano. Fica mais caro a cada compra.`)),
        botao(fmt(custo), () => {
          if (!RL.comprarBolha(j)) {
            RL.Som.erro();
            return;
          }
          RL.Som.compra();
          b.dizer('compra');
          App.salvar();
          atualizarSaldo();
          desenharPrancheta();
        }, 'bt-mini bt-preco', { id: 'bt-bolha', disabled: j.moedas < custo }));
    }

    function blocoHoje() {
      const h = RL.placarHoje(j, Date.now());
      if (!h.voos) return null;
      const minutos = Math.round(h.segundos / 60);
      return el('div', { class: 'hoje' },
        el('small', {}, 'Hoje'),
        el('b', {}, `${fmt(h.voos)} ${h.voos === 1 ? 'voo' : 'voos'} · +${RL.fmtKm(Math.max(0, j.recorde - h.kmInicio))} km`),
        h.segundos >= 1500 ? el('small', {}, 'Boa sentada. A Lua não sai do lugar até amanhã.') : el('small', {}, `+${fmt(h.ganho)} moedas em ${minutos} min de voo`));
    }

    function desenharPrancheta(previa) {
      prancheta.textContent = '';
      const a = RL.atributos(j.foguete, j);
      const problemas = RL.problemasDoBuild(j.foguete);
      const sim = problemas.length ? null : RL.simular(a);
      const massa = RL.massaAtual(RL.novoVoo(a), a);
      const empuxo = a.estagios[0] ? a.estagios[0].empuxo : 0;
      const comb = a.estagios.reduce((t, e) => t + (e.queima ? e.combustivel / e.queima : 0), 0);
      const linha = (n, v) => el('div', { class: 'dado' }, el('span', {}, n), el('b', {}, v));
      prancheta.append(
        el('h2', {}, 'Prancheta'),
        blocoMeta(),
        el('div', { class: 'alcance' }, el('small', {}, 'Alcance estimado'), el('strong', { id: 'alcance' }, sim ? RL.fmtKm(sim.h) + ' km' : '---')),
        (() => { const t = RL.tamanhoFoguete(D().layout(j.foguete, null).altura); return el('p', { class: 'tamanho-foguete', id: 'tamanho-foguete' }, `${t.m} m de foguete. ${t.texto}.`); })(),
        previa != null && sim ? el('p', { class: 'previa' + (previa >= sim.h ? ' sobe' : ' desce') }, `Com essa peça: ${RL.fmtKm(previa)} km`) : el('p', { class: 'previa' }, sim ? (sim.h > 0 ? `Voo de ${textoTempo(sim.t)}` : 'Não sai do chão') : ''),
        linha('Peso', massa.toFixed(1).replace('.', ',') + ' t'),
        linha('Empuxo', fmt(empuxo) + ' kN'),
        linha('Motor ligado', textoTempo(comb)),
        linha('Casco', fmt(a.casco)),
        linha('Controle', a.controle.toFixed(1).replace('.', ',')),
        linha('Pagamento', '+' + Math.round((a.pagamento - 1) * 100) + '%'),
        blocoEspaco(),
        blocoBolha(),
        blocoHoje());
      const s = b.selecionado;
      if (s) {
        const id = RL.ler(j.foguete, s);
        prancheta.append(el('div', { class: 'encaixe-info' },
          el('small', {}, 'Encaixe escolhido'),
          el('b', {}, id ? RL.PECAS[id].nome : 'Vazio'),
          id ? botao('Tirar peça', () => { encaixar(s, null); }, 'bt-mini', { id: 'bt-tirar' }) : null));
      }
    }

    function desenharLoja() {
      abasTipo.textContent = '';
      /* olhou a aba: os itens dela deixam de ser novidade */
      for (const p of RL.PECAS_POR_TIPO[tipoAtual]) if (RL.pecaLiberada(j, p) && j.moedas >= p.preco) j.vistos[p.id] = 1;
      for (const tipo of Object.keys(RL.TIPOS)) {
        const nova = RL.PECAS_POR_TIPO[tipo].some((p) => !j.pecas.includes(p.id) && RL.pecaLiberada(j, p) && j.moedas >= p.preco && !j.vistos[p.id]);
        abasTipo.append(botao(RL.TIPOS[tipo], () => { tipoAtual = tipo; memoria.tipo = tipo; desenharLoja(); }, 'bt-tipo' + (tipo === tipoAtual ? ' atual' : '') + (nova ? ' tem-novo' : ''), { 'data-tipo': tipo }));
      }
      prateleira.textContent = '';
      const dica = melhorCompra();
      for (const b0 of abasTipo.children) if (dica && b0.dataset.tipo === dica.tipo && dica.tipo !== tipoAtual && !j.vistos[dica.id]) b0.classList.add('com-dica');
      const usadas = new Set(D().layout(j.foguete, null).slots.map((s) => s.id));
      for (const p of RL.PECAS_POR_TIPO[tipoAtual]) {
        const dono = j.pecas.includes(p.id);
        const livre = RL.pecaLiberada(j, p);
        const carta = el('article', { class: 'carta' + (dono ? ' dono' : '') + (!livre ? ' trancada' : '') + (usadas.has(p.id) ? ' em-uso' : '') + (dica && dica.id === p.id ? ' recomendada' : ''), 'data-peca': p.id });
        if (dica && dica.id === p.id) carta.append(el('span', { class: 'selo-compra' }, 'Melhor compra'));
        const mini = D().miniatura(p, 92);
        const info = el('div', { class: 'carta-info' }, el('h3', {}, livre ? p.nome : '???'), el('p', {}, livre ? estatPeca(p) : `Chegue a ${fmt(p.requerKm)} km`));
        carta.append(mini, info);
        if (dono) {
          if (usadas.has(p.id)) {
            const coluna = el('div', { class: 'carta-acoes' }, el('span', { class: 'equipado', 'data-acao': 'equipado' }, 'Equipado'));
            if (encaixesValidos(p.tipo).some((q) => !q.id)) coluna.append(botao('Mais um', () => colocar(p.id), 'bt-mini', { 'data-acao': 'encaixar' }));
            carta.append(coluna);
          } else {
            carta.append(botao('Encaixar', () => colocar(p.id), 'bt-mini bt-encaixar', { 'data-acao': 'encaixar' }));
          }
          ligarArraste(carta, p);
        } else if (livre) {
          carta.append(botao(fmt(p.preco), () => comprar(p.id), 'bt-mini bt-preco', { disabled: j.moedas < p.preco, 'data-acao': 'comprar' }));
        }
        if (livre) {
          carta.addEventListener('pointerenter', () => desenharPrancheta(preverAlcance(p.id)));
          carta.addEventListener('pointerleave', () => desenharPrancheta());
        }
        prateleira.append(carta);
      }
    }

    function ligarArraste(carta, p) {
      carta.addEventListener('pointerdown', (ev) => {
        if (ev.button !== 0 || ev.target.closest('button')) return;
        ev.preventDefault();
        const x0 = ev.clientX, y0 = ev.clientY;
        let fantasma = null;
        const mover = (e) => {
          if (!fantasma && Math.hypot(e.clientX - x0, e.clientY - y0) > 6) {
            fantasma = D().miniatura(p, 92);
            fantasma.className = 'fantasma';
            document.body.append(fantasma);
            b.destaque = p.tipo;
            b.pintar();
          }
          if (fantasma) {
            fantasma.style.transform = `translate(${e.clientX - 46}px,${e.clientY - 46}px)`;
          }
        };
        const soltar = (e) => {
          window.removeEventListener('pointermove', mover);
          window.removeEventListener('pointerup', soltar);
          if (!fantasma) return;
          fantasma.remove();
          b.destaque = null;
          const s = b.slotEm(e.clientX, e.clientY);
          if (s && RL.aceita(s.caminho).includes(p.tipo)) {
            b.selecionado = s.caminho;
            encaixar(s.caminho, p.id);
          } else {
            b.pintar();
          }
        };
        window.addEventListener('pointermove', mover);
        window.addEventListener('pointerup', soltar);
      });
    }

    function desenharTudo() {
      atualizarSaldo();
      b.pintar();
      desenharPrancheta();
      desenharLoja();
      const problemas = RL.problemasDoBuild(j.foguete);
      const sim = problemas.length ? null : RL.simular(RL.atributos(j.foguete, j));
      const pesado = sim && sim.h === 0;
      lancar.disabled = problemas.length > 0;
      avisos.textContent = problemas[0] || (pesado ? 'Pesado demais: esse foguete não sai do chão. Tire peso ou use um motor mais forte.' : '');
      if (pesado) b.dizer('pesado');
    }

    b.c.addEventListener('click', (e) => {
      const s = b.slotEm(e.clientX, e.clientY);
      b.selecionado = s ? s.caminho : null;
      if (s) {
        const tipos = RL.aceita(s.caminho);
        if (!tipos.includes(tipoAtual)) {
          tipoAtual = tipos[0];
          memoria.tipo = tipoAtual;
        }
        RL.Som.clique();
      }
      desenharTudo();
    });
    b.c.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const s = b.slotEm(e.clientX, e.clientY);
      if (s && s.id) encaixar(s.caminho, null);
    });

    const parar = b.observar();
    requestAnimationFrame(() => {
      b.ajustar();
      desenharTudo();
    });
    if (App.fora && App.fora.valor > 0) {
      const f = App.fora;
      App.fora = null;
      const horas = f.horas < 1 ? Math.round(f.horas * 60) + ' minutos' : f.horas.toFixed(1).replace('.', ',') + ' horas';
      const aviso = el('button', { class: 'boas-vindas', type: 'button', id: 'boas-vindas', onclick: () => aviso.remove() },
        el('b', {}, `+${fmt(f.valor)} moedas`), el('span', {}, `Em ${horas} fora, as marcas e a vaquinha do bairro pagaram.`));
      raiz.append(aviso);
      RL.Som.marco();
      setTimeout(() => aviso.remove(), 7000);
    }
    return parar;
  }

  /* ---------- Pintura ---------- */
  function amostra(cor, ativo, onclick, rotulo) {
    return el('button', { class: 'cor' + (ativo ? ' atual' : ''), type: 'button', style: `background:${cor}`, 'aria-label': rotulo || cor, onclick: () => { RL.Som.clique(); onclick(cor); } });
  }

  const NOME_PADRAO = { liso: 'Liso', listras: 'Listras', faixa: 'Faixa', bolinhas: 'Bolinhas', xadrez: 'Xadrez', chamas: 'Chamas', dentes: 'Dentes', remendos: 'Remendos', diagonal: 'Diagonal', ziguezague: 'Zigue-zague', estrelas: 'Estrelas', escamas: 'Escamas', raios: 'Raios', nuvens: 'Nuvens', caveiras: 'Caveiras' };

  /* Amostra do padrão de verdade no botão, em vez de só o nome. */
  function amostraPadrao(n, t) {
    const c = el('canvas', { width: 76, height: 48, class: 'mini-padrao' });
    const x = c.getContext('2d');
    x.fillStyle = (t && t.a) || '#C8513F';
    x.fillRect(0, 0, 76, 48);
    x.scale(1.3, 1.3);
    D().aplicarPadrao(x, { x: 0, y: 0, w: 58.5, h: 37 }, n, (t && t.b) || '#EEE9D7');
    return c;
  }

  function pintura(raiz) {
    const j = jogo();
    let modo = 'peca';
    let adesivoSel = null;
    let arraste = null;
    const b = criarBancada({
      semFantasma: true, semCapivara: true,
      cena: (ctx, W, H) => {
        if (modo !== 'piloto') return false;
        const t = performance.now() / 1000;
        const esc = Math.min(2.6, H / 225);
        D().capivara(ctx, W * 0.4, H - 18, esc, { pose: 'parada', t, olhar: Math.sin(t * 0.8) });
        /* como ela fica na cabine, com o capacete */
        const R = Math.min(W * 0.16, 86), cx = W - R - 16, cy = R + 22;
        ctx.save();
        ctx.fillStyle = '#BFE3E6';
        ctx.strokeStyle = '#5E6468';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 6.283);
        ctx.fill();
        ctx.clip();
        D().rostoCapivara(ctx, cx, cy - R * 0.08, R * 0.66, { t, humor: null, astronauta: true, olhar: Math.sin(t * 0.8) });
        ctx.restore();
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#5E6468';
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 6.283);
        ctx.stroke();
        P.tatu(ctx, W * 0.84, H - 18, esc * 0.6, { t, vira: true });
        return true;
      },
      sobreposicao: (ctx, e) => {
        if (modo !== 'adesivos' || !adesivoSel) return;
        const s = adesivoSel.s || 22;
        const lx = adesivoSel.logo ? s * 1.8 : s * 0.82, ly = adesivoSel.logo ? s * 0.68 : s * 0.82;
        ctx.save();
        ctx.translate(adesivoSel.x, adesivoSel.y);
        ctx.rotate(adesivoSel.r || 0);
        ctx.strokeStyle = '#C8513F';
        ctx.lineWidth = 1.8 / e;
        ctx.setLineDash([5 / e, 4 / e]);
        ctx.strokeRect(-lx, -ly, lx * 2, ly * 2);
        ctx.restore();
      },
    });
    const painel = el('aside', { class: 'painel-pintura', id: 'painel-pintura' });
    const hangar = el('aside', { class: 'hangar' });
    const abas = el('div', { class: 'abas-pintura' });
    const conteudo = el('div', { class: 'conteudo-pintura' });
    painel.append(abas, conteudo);
    raiz.append(fundo(RL.Pintura.parque, 'apagado'), barra('pintura'),
      el('div', { class: 'oficina entrar' }, hangar, el('div', { class: 'meio' }, el('section', { class: 'centro' }, b.c)), painel));
    const primeira = () => D().layout(j.foguete, null).slots.find((s) => s.id && s.tipo !== 'enfeite');
    const secao = (titulo, ...c) => el('section', { class: 'grupo' }, el('h3', {}, titulo), ...c);

    /* Desfazer: guarda como estava antes de cada mudança de pintura. */
    const pilhaDesfazer = [];
    function guardarDesfazer() {
      pilhaDesfazer.push(JSON.stringify({ pintura: j.pintura, piloto: j.piloto }));
      if (pilhaDesfazer.length > 30) pilhaDesfazer.shift();
    }
    let confirmando = false;
    function voltarTudo() {
      guardarDesfazer();
      const novo = RL.jogoNovo();
      j.pintura = { ...novo.pintura, marcas: [] };
      j.piloto = { ...novo.piloto };
      P.vestir(j.piloto);
      adesivoSel = null;
      confirmando = false;
      RL.Som.encaixe();
      mudou();
    }

    function tinta() {
      const c = b.selecionado;
      if (!j.pintura.pecas[c]) j.pintura.pecas[c] = {};
      return j.pintura.pecas[c];
    }
    function mudou() {
      App.salvar();
      b.pintar();
      desenhar();
    }

    function desenharAbas() {
      abas.textContent = '';
      for (const [id, nome] of [['peca', 'Peça'], ['adesivos', 'Adesivos'], ['esquemas', 'Esquemas'], ['piloto', 'Piloto']]) {
        abas.append(botao(nome, () => { modo = id; adesivoSel = null; desenhar(); }, 'bt-mini' + (modo === id ? ' atual' : ''), { 'data-modo': id }));
      }
    }

    function modoPeca() {
      const sel = b.selecionado;
      const id = sel && RL.ler(j.foguete, sel);
      if (!id) {
        conteudo.append(el('h2', {}, 'Escolha uma peça'), el('p', {}, 'Clique em uma parte do foguete para pintar.'));
        return;
      }
      const t = tinta();
      const p = RL.PECAS[id];
      conteudo.append(
        el('h2', {}, p.nome),
        secao('Cor principal',
          el('div', { class: 'cores' }, RL.PALETA.map((c) => amostra(c, t.a === c, () => { guardarDesfazer(); t.a = c; mudou(); })),
            el('label', { class: 'cor-livre' }, 'Outra', el('input', { type: 'color', value: t.a || p.cor, oninput: (e) => { t.a = e.target.value; App.salvar(); b.pintar(); } })))),
        secao('Segunda cor',
          el('div', { class: 'cores' }, RL.PALETA.map((c) => amostra(c, t.b === c, () => { guardarDesfazer(); t.b = c; if (!t.padrao || t.padrao === 'liso') t.padrao = 'listras'; mudou(); })),
            el('label', { class: 'cor-livre' }, 'Outra', el('input', { type: 'color', value: t.b || '#EEE9D7', oninput: (e) => { t.b = e.target.value; App.salvar(); b.pintar(); } })))),
        secao('Padrão',
          el('div', { class: 'padroes' }, RL.PADROES.map((n) => {
            const ok = j.libera.padroes.includes(n);
            const preco = RL.precoPadrao(n);
            const pode = ok || j.moedas >= preco;
            const bt = el('button', {
              class: 'bt-padrao' + ((t.padrao || 'liso') === n ? ' atual' : '') + (ok ? '' : ' a-venda'), type: 'button', 'data-padrao': n, disabled: !pode,
              onclick: () => {
                if (!ok) {
                  j.moedas -= preco;
                  j.libera.padroes.push(n);
                  RL.Som.compra();
                  atualizarSaldo();
                } else RL.Som.clique();
                guardarDesfazer();
                t.padrao = n;
                mudou();
              },
            }, amostraPadrao(n, t), el('small', {}, ok ? NOME_PADRAO[n] : fmt(preco)));
            return bt;
          }))),
        secao('Repetir',
          el('div', { class: 'opcoes-texto' },
            botao('Em peças do mesmo tipo', () => {
              guardarDesfazer();
              for (const s of D().layout(j.foguete, null).slots) if (s.id && RL.PECAS[s.id].tipo === p.tipo) j.pintura.pecas[s.caminho] = { ...t };
              mudou();
            }, 'bt-mini', { id: 'bt-tipo-todo' }),
            botao('Em todo o foguete', () => {
              guardarDesfazer();
              for (const s of D().layout(j.foguete, null).slots) j.pintura.pecas[s.caminho] = { ...t };
              mudou();
            }, 'bt-mini', { id: 'bt-todas' }),
            botao('Esta peça ao original', () => { guardarDesfazer(); delete j.pintura.pecas[sel]; mudou(); }, 'bt-mini', { id: 'bt-peca-original' }))));
    }

    function posLogo(id) {
      if (!j.pintura.marcaPos) j.pintura.marcaPos = {};
      if (!j.pintura.marcaPos[id]) {
        const L = D().layout(j.foguete, null);
        const i = j.pintura.marcas.indexOf(id);
        j.pintura.marcaPos[id] = { x: 0, y: L.altura * 0.62 + i * 26 - 20, s: 20, r: 0, logo: id };
      }
      return j.pintura.marcaPos[id];
    }

    function modoAdesivos() {
      conteudo.append(el('h2', {}, 'Adesivos'),
        el('p', { class: 'nota' }, 'Clique para colar. Arraste no foguete para mover; a roda do mouse muda o tamanho.'),
        el('div', { class: 'adesivos' }, RL.ADESIVOS.filter((n) => n !== 'nenhum').map((n) => {
          const liberado = j.libera.adesivos.includes(n);
          const preco = RL.precoAdesivo(n);
          const c = el('canvas', { width: 96, height: 96 });
          D().adesivo(c.getContext('2d'), n, 48, 48, 58, '#F0CF62');
          return el('button', {
            class: 'bt-adesivo' + (liberado ? '' : ' a-venda'), type: 'button', disabled: !liberado && j.moedas < preco, 'data-adesivo': n,
            title: liberado ? null : `Comprar por ${fmt(preco)}`, 'aria-label': n,
            onclick: () => {
              if (!liberado) {
                j.moedas -= preco;
                j.libera.adesivos.push(n);
                RL.Som.compra();
                atualizarSaldo();
              } else RL.Som.encaixe();
              const L = D().layout(j.foguete, null);
              const novo = { id: n, x: (Math.random() - 0.5) * 30, y: L.altura * (0.3 + Math.random() * 0.3), s: 26, r: (Math.random() - 0.5) * 0.3, cor: '#F0CF62' };
              j.pintura.adesivos.push(novo);
              adesivoSel = novo;
              mudou();
            },
          }, c, liberado ? null : el('small', {}, fmt(preco)));
        })));
      if (adesivoSel) {
        const a = adesivoSel;
        const leve = () => { App.salvar(); b.pintar(); };
        conteudo.append(secao(a.logo ? 'Este logotipo' : 'Este adesivo',
          el('label', { class: 'campo' }, 'Tamanho', el('input', { type: 'range', min: a.logo ? 12 : 10, max: a.logo ? 34 : 80, value: a.s, id: 'ades-tam', oninput: (e) => { a.s = +e.target.value; leve(); } })),
          el('label', { class: 'campo' }, 'Giro', el('input', { type: 'range', min: -3.14, max: 3.14, step: 0.05, value: a.r, oninput: (e) => { a.r = +e.target.value; leve(); } })),
          a.logo || String(a.id).startsWith('f_') ? null : el('div', { class: 'cores' }, RL.PALETA.map((c) => amostra(c, a.cor === c, () => { a.cor = c; mudou(); }))),
          a.logo ? null : el('div', { class: 'opcoes-texto' },
            botao('Espelhar', () => { a.espelho = !a.espelho; mudou(); }, 'bt-mini', { id: 'bt-espelhar' }),
            botao('Duplicar', () => { const n = { ...a, x: a.x + 14, y: a.y + 14 }; j.pintura.adesivos.push(n); adesivoSel = n; mudou(); }, 'bt-mini', { id: 'bt-duplicar' }),
            botao('Para frente', () => { const l = j.pintura.adesivos; l.splice(l.indexOf(a), 1); l.push(a); mudou(); }, 'bt-mini'),
            botao('Tirar', () => { j.pintura.adesivos = j.pintura.adesivos.filter((x) => x !== a); adesivoSel = null; mudou(); }, 'bt-mini', { id: 'bt-tirar-ades' })),
          a.logo ? botao('Voltar ao lugar automático', () => { delete j.pintura.marcaPos[a.logo]; adesivoSel = null; mudou(); }, 'bt-mini') : null));
      }
      const usadas = j.pintura.marcas;
      conteudo.append(secao('Patrocinadores no casco',
        usadas.length
          ? el('div', { class: 'logos-casco' }, usadas.map((id) => {
            const m = RL.MARCA[id];
            const c = el('canvas', { width: 300, height: 88 });
            D().logoMarca(c.getContext('2d'), m, 150, 42, 286, 72);
            return el('button', { class: 'logo-casco' + (adesivoSel && adesivoSel.logo === id ? ' atual' : ''), type: 'button', 'data-logo': id, title: m.slogan, onclick: () => { RL.Som.clique(); adesivoSel = posLogo(id); mudou(); } }, c);
          }))
          : el('p', { class: 'nota' }, 'Nenhum ainda. Escolha em Contratos, depois de assinar com uma marca.')));
      conteudo.append(secao('Nome do foguete',
        el('input', { class: 'campo-nome', type: 'text', maxlength: 16, value: j.pintura.nome || '', placeholder: 'Ninguém batiza um foguete', id: 'nome-foguete', 'aria-label': 'Nome do foguete', oninput: (e) => {
          j.pintura.nome = e.target.value;
          const reconhecido = RL.NOMES_SECRETOS[e.target.value.trim().toLowerCase()];
          if (reconhecido && RL.revelar(j, 'nome')) RL.Som.marco();
          if (reconhecido) e.target.title = reconhecido;
          App.salvar();
          b.pintar();
        } })));
    }

    function aplicarEsquema(q) {
      guardarDesfazer();
      const nova = {};
      for (const s of D().layout(j.foguete, null).slots) {
        if (!s.id) continue;
        const t = RL.PECAS[s.id].tipo;
        if (t === 'enfeite') continue;
        const acento = ['bico', 'aleta', 'lateral', 'escudo'].includes(t);
        nova[s.caminho] = { a: t === 'motor' ? q.faixa : acento ? q.acento : q.corpo, b: q.faixa };
        if (t === 'tanque' && j.libera.padroes.includes('listras') && /t0$/.test(s.caminho)) nova[s.caminho].padrao = 'listras';
      }
      j.pintura.pecas = nova;
      mudou();
    }

    function modoEsquemas() {
      conteudo.append(el('h2', {}, 'Esquemas prontos'),
        el('div', { class: 'esquemas' }, RL.ESQUEMAS.map((q) => el('button', { class: 'esquema', type: 'button', 'data-esquema': q.nome, onclick: () => { RL.Som.encaixe(); aplicarEsquema(q); } },
          el('span', { class: 'faixas' }, el('i', { style: `background:${q.corpo}` }), el('i', { style: `background:${q.acento}` }), el('i', { style: `background:${q.faixa}` })), q.nome))),
        el('div', { class: 'opcoes-texto margem' },
          botao('Sortear', () => {
            const c = () => RL.PALETA[Math.floor(Math.random() * RL.PALETA.length)];
            aplicarEsquema({ corpo: c(), acento: c(), faixa: c() });
          }, 'bt-mini', { id: 'bt-sortear' }),
          botao('Cores originais', () => { guardarDesfazer(); j.pintura.pecas = {}; mudou(); }, 'bt-mini', { id: 'bt-original' })));
    }

    const NOME_ROUPA = { traje: 'Traje de voo', chapeu: 'Na cabeça', oculos: 'Nos olhos', pescoco: 'No pescoço', pelo: 'Pelo' };
    function modoPiloto() {
      conteudo.append(el('h2', {}, 'Piloto'),
        el('div', { class: 'opcoes-texto margem' },
          botao('Sortear do que já tenho', () => {
            guardarDesfazer();
            for (const tipo of Object.keys(RL.ROUPAS)) {
              const meus = RL.ROUPAS[tipo].filter((r) => j.roupas.includes(tipo + ':' + r.id) || r.preco === 0);
              j.piloto[tipo] = meus[Math.floor(Math.random() * meus.length)].id;
            }
            P.vestir(j.piloto);
            mudou();
          }, 'bt-mini', { id: 'bt-piloto-sorte' }),
          botao('Piloto ao original', () => { guardarDesfazer(); j.piloto = { ...RL.jogoNovo().piloto }; P.vestir(j.piloto); mudou(); }, 'bt-mini', { id: 'bt-piloto-original' })));
      for (const tipo of Object.keys(NOME_ROUPA)) {
        conteudo.append(secao(NOME_ROUPA[tipo], el('div', { class: 'opcoes-texto' }, RL.ROUPAS[tipo].map((r) => {
          const dono = j.roupas.includes(tipo + ':' + r.id);
          const atual = j.piloto[tipo] === r.id;
          return botao(dono ? r.nome : `${r.nome} · ${fmt(r.preco)}`, () => {
            guardarDesfazer();
            if (RL.comprarRoupa(j, tipo, r.id)) {
              if (!dono) RL.Som.compra();
              P.vestir(j.piloto);
              atualizarSaldo();
              mudou();
            } else RL.Som.erro();
          }, 'bt-mini' + (atual ? ' atual' : '') + (dono ? '' : ' bt-loja'), { disabled: !dono && j.moedas < r.preco, 'data-roupa': tipo + ':' + r.id });
        }))));
      }
    }

    function desenhar() {
      desenharAbas();
      conteudo.textContent = '';
      ({ peca: modoPeca, adesivos: modoAdesivos, esquemas: modoEsquemas, piloto: modoPiloto })[modo]();

      hangar.textContent = '';
      hangar.append(
        el('div', { class: 'desfazer-linha' },
          botao('Desfazer', () => {
            const u = pilhaDesfazer.pop();
            if (!u) return;
            const v = JSON.parse(u);
            j.pintura = v.pintura;
            j.piloto = v.piloto;
            P.vestir(j.piloto);
            adesivoSel = null;
            RL.Som.clique();
            mudou();
          }, 'bt-mini', { id: 'bt-desfazer', disabled: !pilhaDesfazer.length }),
          confirmando
            ? botao('Certeza? Clique de novo', voltarTudo, 'bt-mini bt-perigo', { id: 'bt-tudo-original' })
            : botao('Voltar tudo ao original', () => { confirmando = true; RL.Som.clique(); desenhar(); }, 'bt-mini', { id: 'bt-tudo-original' })),
        el('h2', {}, 'Rastro'),
        el('div', { class: 'opcoes-texto' }, RL.RASTROS.map((r) => { const ok = j.libera.rastros.includes(r.id); return botao(ok ? r.nome : '???', () => { j.pintura.rastro = r.id; mudou(); }, 'bt-mini' + (j.pintura.rastro === r.id ? ' atual' : ''), { 'data-rastro': r.id, disabled: !ok, title: ok ? null : 'Libere em Conquistas ou nas caixas' }); })),
        el('h3', {}, 'Cor da chama'),
        el('div', { class: 'cores' }, RL.PALETA.filter((_, i) => i % 3 === 0).map((c) => amostra(c, j.pintura.corRastro === c, () => { guardarDesfazer(); j.pintura.corRastro = c; mudou(); })),
          el('label', { class: 'cor-livre' }, 'Outra', el('input', { type: 'color', value: j.pintura.corRastro || '#E08A3C', oninput: (e) => { j.pintura.corRastro = e.target.value; App.salvar(); } }))),
        el('h2', { class: 'hangar-titulo' }, 'Hangar'),
        el('div', { class: 'vagas' }, j.hangar.map((v, i) => {
          const canvas = el('canvas', { width: 70, height: 110 });
          if (v) {
            const c = canvas.getContext('2d');
            const L = D().layout(v.build, null);
            const e = Math.min(0.7, 100 / L.altura);
            c.translate(35, 5);
            c.scale(e, e);
            D().desenharFoguete(c, v.build, v.pintura, { semPiloto: true });
          }
          return el('div', { class: 'vaga' }, canvas,
            botao('Guardar', () => { j.hangar[i] = { build: JSON.parse(JSON.stringify(j.foguete)), pintura: JSON.parse(JSON.stringify(j.pintura)) }; mudou(); }, 'bt-mini', { 'data-guardar': i }),
            v ? botao('Usar', () => { j.foguete = JSON.parse(JSON.stringify(v.build)); j.pintura = { adesivos: [], nome: '', marcas: [], marcaPos: {}, ...JSON.parse(JSON.stringify(v.pintura)) }; b.selecionado = null; adesivoSel = null; mudou(); }, 'bt-mini', { 'data-usar': i }) : null);
        })));
    }

    /* Clique e arraste no foguete: escolhe peça ou move adesivo */
    b.c.addEventListener('pointerdown', (e) => {
      const q = b.pontoLocal(e.clientX, e.clientY);
      if (modo === 'adesivos') {
        const logos = j.pintura.marcas.map((id) => (j.pintura.marcaPos || {})[id]).filter(Boolean);
        const a = [...j.pintura.adesivos].reverse().find((x) => Math.hypot(x.x - q.x, x.y - q.y) < (x.s || 22) * 0.8)
          || logos.find((x) => Math.abs(x.x - q.x) < x.s * 1.8 && Math.abs(x.y - q.y) < x.s * 0.68);
        if (a) {
          arraste = { a, dx: a.x - q.x, dy: a.y - q.y };
          b.c.setPointerCapture(e.pointerId);
          if (adesivoSel !== a) {
            adesivoSel = a;
            desenhar();
          }
        } else if (adesivoSel) {
          adesivoSel = null;
          desenhar();
        }
        return;
      }
      if (modo === 'piloto' || modo === 'esquemas') return;
      const s = b.slotEm(e.clientX, e.clientY);
      if (s && s.id) {
        b.selecionado = s.caminho;
        RL.Som.clique();
        b.pintar();
        desenhar();
      }
    });
    b.c.addEventListener('pointermove', (e) => {
      if (!arraste) return;
      const q = b.pontoLocal(e.clientX, e.clientY);
      arraste.a.x = q.x + arraste.dx;
      arraste.a.y = q.y + arraste.dy;
    });
    const largar = () => {
      if (arraste) {
        arraste = null;
        App.salvar();
      }
    };
    b.c.addEventListener('pointerup', largar);
    b.c.addEventListener('pointercancel', largar);
    b.c.addEventListener('wheel', (e) => {
      if (modo !== 'adesivos' || !adesivoSel) return;
      e.preventDefault();
      adesivoSel.s = Math.max(10, Math.min(adesivoSel.logo ? 34 : 80, (adesivoSel.s || 22) - Math.sign(e.deltaY) * 2));
      const t = document.getElementById('ades-tam');
      if (t) t.value = adesivoSel.s;
      App.salvar();
    }, { passive: false });

    const parar = b.observar();
    requestAnimationFrame(() => {
      const p = primeira();
      if (p) b.selecionado = p.caminho;
      b.ajustar();
      desenhar();
    });
    return parar;
  }

  /* ---------- Laboratório ---------- */
  function laboratorio(raiz) {
    const j = jogo();
    const grade = el('main', { class: 'lab entrar', id: 'lab' });
    raiz.append(fundo(RL.Pintura.parque, 'apagado'), barra('laboratorio'), grade);
    function desenhar() {
      atualizarSaldo();
      grade.textContent = '';
      for (const [id, nome] of Object.entries(RL.RAMOS)) {
        const col = el('section', { class: 'ramo' }, el('h2', {}, nome));
        for (const q of RL.PESQUISAS.filter((x) => x.ramo === id && (!x.requerLua || j.chegouLua))) {
          const n = RL.nivelPesquisa(j, q.id);
          const cheio = n >= q.niveis;
          const custo = RL.custoPesquisa(j, q.id);
          const pts = el('div', { class: 'niveis', 'aria-label': `Nível ${n} de ${q.niveis}` });
          for (let i = 0; i < q.niveis; i++) pts.append(el('i', { class: (i < n ? 'ok' : '') + (q.salta && (i + 1) % 5 === 0 ? ' salto' : '') }));
          const proxSalto = q.salta && !cheio ? (Math.floor(n / 5) + 1) * 5 : 0;
          col.append(el('article', { class: 'pesquisa' + (cheio ? ' cheia' : ''), 'data-pesquisa': q.id },
            el('h3', {}, q.nome),
            el('p', {}, q.desc),
            pts,
            proxSalto ? el('small', { class: 'prox-salto' }, n + 1 === proxSalto ? (q.multiplica ? 'Próximo nível: SALTO ×1,5!' : 'Próximo nível: SALTO!') : `Salto no nível ${proxSalto}`) : null,
            el('div', { class: 'pesquisa-pe' },
              el('span', {}, cheio ? q.efeito(n) : `${q.efeito(n)} → ${q.efeito(n + 1)}`),
              cheio ? el('b', {}, 'Completo') : botao(fmt(custo), () => {
                if (RL.comprarPesquisa(j, q.id)) {
                  const saltou = q.salta && RL.nivelPesquisa(j, q.id) % 5 === 0;
                  if (saltou) RL.Som.salto();
                  else RL.Som.compra();
                  App.salvar();
                  desenhar();
                  if (saltou) {
                    const c = grade.querySelector(`[data-pesquisa="${q.id}"]`);
                    if (c) c.classList.add('saltou');
                  }
                } else RL.Som.erro();
              }, 'bt-mini bt-preco', { disabled: j.moedas < custo, 'data-comprar': q.id }))));
        }
        grade.append(col);
      }
    }
    desenhar();
  }

  /* ---------- Mapa ---------- */
  /* Mapa: a subida inteira numa tela só que rola, do quintal a Plutão, passando pelos céus pintados. */
  function mapa(raiz) {
    const j = jogo();
    const paradas = [{ km: 0, nome: 'Quintal', fato: 'Onde tudo começou. O chefe ainda não sabe.', premio: 0, ponto: 'terra' }, ...RL.MARCOS];
    const proximo = paradas.findIndex((m) => j.recorde < m.km);
    const atual = proximo < 0 ? paradas.length - 1 : proximo - 1;
    const PASSO = 215, ALTURA_TOTAL = 300 + PASSO * (paradas.length - 1) + 120;
    const yDe = (i) => ALTURA_TOTAL - 210 - i * PASSO;
    const xDe = (i) => (i === 0 ? 50 : 50 + Math.sin(i * 1.15) * 30);

    const interno = el('div', { class: 'mapa-interno', style: `height:${ALTURA_TOTAL}px` });
    const c = el('canvas', { class: 'mapa-ceu' });
    const rolo = el('div', { class: 'mapa-rolo', id: 'mapa-palco' }, interno);
    interno.append(c);
    const detalhe = el('aside', { class: 'mapa-detalhe', id: 'mapa-detalhe', 'aria-live': 'polite' });
    raiz.append(fundo(() => RL.Pintura.faixa('orbita')), barra('mapa'), el('main', { class: 'mapa-novo entrar' }, rolo, detalhe));

    function mostrar(i) {
      const m = paradas[i];
      const ok = j.recorde >= m.km;
      detalhe.textContent = '';
      detalhe.append(
        el('small', {}, i === 0 ? 'Partida' : `${fmt(m.km)} km da Terra`),
        el('h2', {}, ok ? m.nome : '???'),
        el('p', {}, ok ? m.fato : 'Ninguém daqui chegou tão longe.'),
        m.premio ? el('p', { class: 'mapa-premio' + (ok ? ' pago' : '') }, ok ? `Prêmio recebido: ${fmt(m.premio)}` : `Prêmio na primeira chegada: ${fmt(m.premio)}`) : null,
        el('hr', {}),
        el('div', { class: 'dado' }, el('span', {}, 'Recorde'), el('b', {}, RL.fmtKm(j.recorde) + ' km')),
        el('div', { class: 'dado' }, el('span', {}, 'Voos'), el('b', {}, fmt(j.voos))),
        el('div', { class: 'dado' }, el('span', {}, 'Paradas'), el('b', {}, `${atual + 1} de ${paradas.length}`)),
        el('div', { class: 'barra-lua', 'aria-hidden': 'true' }, el('i', { style: `width:${(atual / (paradas.length - 1)) * 100}%` })),
        proximo >= 0 ? el('p', { class: 'nota' }, `Falta ${RL.fmtKm(paradas[proximo].km - j.recorde)} km para a próxima parada.`) : el('p', { class: 'nota' }, 'Acabou o mapa. Parabéns, eu acho.'),
        botao('Ir para onde estou', () => irPara(atual, true), 'bt-mini', { id: 'bt-onde-estou' }));
      rolo.querySelectorAll('.parada').forEach((q, k) => q.classList.toggle('escolhida', k === i));
    }

    function irPara(i, suave) {
      const alvo = yDe(i) - rolo.clientHeight * 0.55;
      rolo.scrollTo({ top: alvo, behavior: suave ? 'smooth' : 'auto' });
    }

    paradas.forEach((m, i) => {
      const ok = j.recorde >= m.km;
      const grande = m.ponto || m.planeta || m.nome === 'Lua';
      const ic = el('canvas', { width: 280, height: 280, class: grande ? 'astro' : 'pino' });
      const x = ic.getContext('2d');
      const nome = m.ponto || m.planeta || (m.nome === 'Lua' ? 'lua' : null);
      if (nome === 'terra') x.drawImage(RL.Pintura.terra(), 10, 10, 260, 260);
      else if (nome === 'lua') x.drawImage(RL.Pintura.lua(), 10, 10, 260, 260);
      else if (nome) x.drawImage(RL.Pintura.planeta(nome), -140, 0, 560, 280);
      else {
        x.fillStyle = ok ? '#F0CF62' : '#6B6787';
        x.strokeStyle = '#33281F';
        x.lineWidth = 12;
        x.beginPath();
        x.arc(140, 140, 112, 0, 6.283);
        x.fill();
        x.stroke();
        x.fillStyle = ok ? '#33281F' : '#D8D5E4';
        x.font = "400 130px 'Lilita One',sans-serif";
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillText(ok ? '★' : '?', 140, 146);
      }
      const direita = xDe(i) < 50;
      interno.append(el('button', {
        class: 'parada' + (ok ? ' feita' : '') + (i === atual ? ' aqui' : '') + (direita ? ' rotulo-direita' : ''), type: 'button', 'data-parada': i,
        style: `left:${xDe(i)}%;top:${yDe(i)}px`, onclick: () => { RL.Som.clique(); mostrar(i); },
      }, ic, el('span', { class: 'rotulo' }, el('b', {}, ok ? m.nome : '???'), el('small', {}, i === 0 ? 'Partida' : `${fmt(m.km)} km`))));
    });

    function pintarCeu() {
      if (!c.isConnected) return;
      const W = interno.clientWidth, H = ALTURA_TOTAL;
      c.width = W;
      c.height = H;
      const x = c.getContext('2d');
      const faixaEm = (i) => {
        const k = RL.indiceFaixa(paradas[Math.max(0, Math.min(paradas.length - 1, i))].km);
        const id = RL.FAIXAS[k].id;
        return id === 'bairro' ? 'ceu' : id;
      };
      /* céu feito de fatias: cada altura mistura a faixa das duas paradas vizinhas */
      const FATIA = 8;
      for (let y = 0; y < H; y += FATIA) {
        const u = Math.max(0, (yDe(0) - y) / PASSO);
        const a = Math.floor(u), t = u - a;
        const pintaFaixa = (id, alfa) => {
          const img = RL.Pintura.faixa(id);
          const e = img.width / W;
          x.globalAlpha = alfa;
          x.drawImage(img, 0, (y * e) % (img.height - FATIA * e), img.width, FATIA * e, 0, y, W, FATIA);
        };
        pintaFaixa(faixaEm(a), 1);
        if (faixaEm(a + 1) !== faixaEm(a)) pintaFaixa(faixaEm(a + 1), t);
      }
      x.globalAlpha = 1;
      /* o quintal embaixo de tudo */
      const q = RL.Pintura.parqueVoo();
      const al = (q.height * W) / q.width;
      x.drawImage(q, 0, H - al, W, al);

      /* trajeto */
      const pts = paradas.map((_, i) => [(xDe(i) / 100) * W, yDe(i)]);
      const traca = (ate) => {
        x.beginPath();
        x.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i <= ate; i++) {
          const [a0, b0] = pts[i - 1], [a1, b1] = pts[i];
          x.bezierCurveTo(a0, b0 - PASSO * 0.45, a1, b1 + PASSO * 0.45, a1, b1);
        }
      };
      x.lineCap = 'round';
      x.setLineDash([2, 15]);
      x.strokeStyle = 'rgba(255,253,242,.85)';
      x.lineWidth = 6;
      traca(pts.length - 1);
      x.stroke();
      x.setLineDash([]);
      if (atual > 0) {
        x.strokeStyle = '#33281F';
        x.lineWidth = 11;
        traca(atual);
        x.stroke();
        x.strokeStyle = '#F0CF62';
        x.lineWidth = 6;
        traca(atual);
        x.stroke();
      }
    }

    /* o foguete do jogador marca onde ele parou */
    const marcador = el('canvas', { class: 'mapa-foguete', width: 240, height: 360 });
    const L = D().layout(j.foguete, null);
    const mx = marcador.getContext('2d');
    const eM = Math.min(1.1, 300 / Math.max(1, L.altura));
    mx.translate(120, 26);
    mx.scale(eM, eM);
    if (!RL.problemasDoBuild(j.foguete).length) D().pintarSprite(mx, j.foguete, j.pintura, { t: 1 });
    marcador.style.left = `calc(${xDe(atual)}% + ${xDe(atual) < 50 ? -128 : 40}px)`;
    marcador.style.top = `${yDe(atual) - 118}px`;
    interno.append(marcador);

    requestAnimationFrame(() => {
      pintarCeu();
      irPara(atual, false);
    });
    mostrar(Math.max(0, proximo < 0 ? atual : proximo));
  }

  /* A viagem inteira numa fileira de pontos: dá para ver de relance o quanto já andou. */
  function jornada(atual) {
    return el('ol', { class: 'jornada', 'aria-label': `Capítulo ${atual + 1} de ${RL.CAPITULOS.length}` },
      RL.CAPITULOS.map((c, i) => el('li', { class: i < atual ? 'feito' : i === atual ? 'atual' : '', title: c.nome })));
  }

  /* ---------- Resultado ---------- */
  const MOTIVO = {
    casco: 'O casco desistiu.',
    combustivel: 'Acabou o combustível.',
    encerrado: 'Você mandou parar.',
    semforca: 'Esse foguete nem saiu do chão.',
    lua: 'Chegou na Lua.',
    pousou: 'Voltou inteiro. Mais ou menos.',
    plutao: 'Chegou em Plutão. Acabou o mapa.',
  };

  const NOME_ITEM = { padroes: 'Padrão novo', adesivos: 'Adesivo novo', rastros: 'Rastro novo' };

  function resultado(raiz, d) {
    const f = d.fechamento;
    /* Quanto falta para a próxima compra, e um botão que compra e já lança. */
    function blocoAlvo() {
      const j = jogo();
      const prox = RL.MARCOS.find((m) => j.recorde < m.km);
      const c = proximaCompra(j);
      const meta = prox ? el('p', { class: 'res-proximo' }, `Próxima meta: ${prox.nome}, a ${RL.fmtKm(prox.km)} km. Prêmio: ${fmt(prox.premio)}.`) : null;
      if (!c) return meta;
      const antes = Math.max(0, j.moedas - f.total);
      const pcAntes = Math.min(100, (antes / c.preco) * 100), pcDepois = Math.min(100, (j.moedas / c.preco) * 100);
      const barra0 = el('i', { style: `width:${pcAntes}%` });
      requestAnimationFrame(() => setTimeout(() => { barra0.style.width = pcDepois + '%'; }, 900));
      return el('div', { class: 'res-alvo' }, meta,
        el('div', { class: 'barra-lua' }, barra0),
        c.pode
          ? botao(`Comprar ${c.nome} (+${RL.fmtKm(c.ganho)} km) e lançar · ${fmt(c.preco)}`, () => {
            if (comprarAlvo(j, c)) {
              RL.Som.compra();
              App.salvar();
              App.lancar();
            } else RL.Som.erro();
          }, 'bt-comprar-lancar', { id: 'bt-comprar-lancar' })
          : el('p', { class: 'res-proximo' }, `Faltam ${fmt(c.preco - j.moedas)} para ${c.nome} (+${RL.fmtKm(c.ganho)} km).`));
    }
    const lista = el('dl', { class: 'recibo' });
    const itens = f.itens.filter((i) => i[1] > 0);
    const presentes = [
      ...f.novos.map((m) => ({ c: 'pm-marco', t: m.nome })),
      ...f.contratos.map((c) => ({ c: 'pm-contrato', t: `${c.de}: +${fmt(c.premio)}` })),
      ...(f.novasMarcas || []).map((m) => ({ c: 'pm-marca', t: `Assinou com ${m.curto}!` })),
      ...f.conquistas.map((c) => ({ c: 'pm-conquista', t: c.nome })),
      ...f.caixasItens.filter((c) => c.tipo !== 'moedas').map((c) => ({ c: 'pm-caixa', t: NOME_ITEM[c.tipo] })),
    ];
    const c = el('canvas', { class: 'palco' });
    raiz.append(fundo(RL.Pintura.parque, 'apagado'), c,
      el('main', { class: 'resultado' },
        el('p', { class: 'motivo' }, MOTIVO[d.s.fim] || ''),
        el('h1', { id: 'res-km' }, '0 km'),
        jornada(RL.capituloDe(jogo().recorde).i),
        el('p', { class: 'res-capitulo' }, (() => { const q = RL.capituloDe(jogo().recorde); return `Capítulo ${q.i + 1}: ${q.nome}. ${q.meta}`; })()),
        f.recorde ? el('p', { class: 'selo' }, 'Novo recorde!') : el('p', { class: 'selo-apagado' }, `Recorde: ${RL.fmtKm(jogo().recorde)} km`),
        el('div', { class: 'recibo-rolagem' }, lista),
        presentes.length ? el('ul', { class: 'marcos-novos' }, presentes.map((p, i) => el('li', { class: p.c, style: `--i:${i + itens.length}` }, p.t))) : null,
        el('div', { class: 'res-total' }, el('span', {}, 'Total'), el('b', { id: 'res-total' }, '0')),
        blocoAlvo(),
        el('div', { class: 'res-botoes' },
          botao('Voltar à oficina', () => App.ir('oficina'), '', { id: 'bt-oficina' }),
          botao('Lançar de novo', () => App.lancar(), 'bt-principal', { id: 'bt-denovo' }))));
    itens.forEach(([n, v], i) => lista.append(el('dt', { style: `--i:${i}` }, n), el('dd', { style: `--i:${i}` }, '+' + fmt(v))));
    if (f.parcela) lista.append(el('dt', { class: 'negativo' }, 'Parcela do empréstimo'), el('dd', { class: 'negativo' }, '-' + fmt(f.parcela)));
    if (f.rendimento) lista.append(el('dt', { class: 'lateral' }, 'Poupança rendeu'), el('dd', { class: 'lateral' }, '+' + fmt(f.rendimento)));
    /* a distância sobe primeiro, com som subindo junto */
    const kmEl = document.getElementById('res-km');
    const t0Km = performance.now();
    let notaKm = 0;
    const contaKm = (agora) => {
      if (!kmEl.isConnected) return;
      const p = Math.min(1, (agora - t0Km) / 850);
      const v = f.km * (1 - (1 - p) ** 3);
      kmEl.textContent = RL.fmtKm(v) + ' km';
      if (Math.floor(p * 12) > notaKm && p < 1) {
        notaKm = Math.floor(p * 12);
        RL.Som.moeda(notaKm * 3);
      }
      if (p < 1) requestAnimationFrame(contaKm);
    };
    requestAnimationFrame(contaKm);
    if (f.recorde) setTimeout(() => RL.Som.recorde(), 850);
    const alvo = document.getElementById('res-total');
    const t0 = performance.now();
    const espera = 850 + Math.min(600, itens.length * 70);
    const conta = (t) => {
      if (!alvo.isConnected) return;
      const p = Math.min(1, Math.max(0, (t - t0 - espera) / 700));
      alvo.textContent = fmt(f.total * (1 - (1 - p) ** 3));
      if (p > 0 && p < 1 && Math.floor(t / 70) !== Math.floor((t - 16) / 70)) RL.Som.pago();
      if (p < 1) requestAnimationFrame(conta);
    };
    requestAnimationFrame(conta);
    const pose = f.recorde ? 'comemora' : d.s.fim === 'casco' || d.s.fim === 'semforca' ? 'triste' : 'parada';
    const chaveFala = d.s.causa && P.TATU[d.s.causa] ? d.s.causa : f.recorde ? 'recorde' : d.s.fim === 'casco' ? 'casco' : d.s.fim === 'semforca' ? 'chao' : 'normal';
    const fala = P.sortear(P.TATU[chaveFala]);
    const falaCapi = P.CAPI_RESPONDE[chaveFala] ? P.sortear(P.CAPI_RESPONDE[chaveFala]) : null;
    const capi = RL.Personagens.criarAtor('parada');
    const t0Cena = performance.now();
    let ultimoCena = t0Cena;
    const cena = (agora) => {
      if (!c.isConnected) return;
      if (c.width !== window.innerWidth || c.height !== window.innerHeight) {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
      }
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);
      const dtC = Math.max(0, Math.min(0.05, (agora - ultimoCena) / 1000));
      ultimoCena = agora;
      if (agora - t0Cena > 260) capi.pose(pose);
      capi.atualizar(dtC, agora / 1000);
      if (c.width > 900) {
        const es = Math.min(1.45, c.height / 500);
        capi.pintar(ctx, c.width * 0.13, c.height * 0.92, es, { t: agora / 1000, olhar: 1 });
        const tx = c.width * 0.84;
        const passou = agora - t0Cena - 700;
        P.tatu(ctx, tx, c.height * 0.92, es * 0.95, { t: agora / 1000, vira: true, falando: passou > 0 && passou < 2600, pulo: f.recorde });
        if (passou > 0) P.balao(ctx, tx - 20, c.height * 0.92 - 75 * es, fala, c.width, { larg: 230, escala: Math.min(1, passou / 130) });
        if (falaCapi && passou > 2400) P.balao(ctx, c.width * 0.11, c.height * 0.92 - 195 * es, falaCapi, c.width, { larg: 170, escala: Math.min(1, (passou - 2400) / 130) });
      }
      requestAnimationFrame(cena);
    };
    requestAnimationFrame(cena);
  }

  /* ---------- Final ---------- */
  function final(raiz, d) {
    const c = el('canvas', { class: 'palco' });
    const f = d.fechamento;
    const j = jogo();
    const horas = j.tempoJogado / 3600;
    raiz.append(fundo(RL.Pintura.soloLua), c,
      el('main', { class: 'final' },
        el('h1', {}, 'Chegou.'),
        el('p', {}, { perfeito: 'Depois de 384.400 km, a capivara pousou sem levantar poeira, fincou a toalha e ficou olhando em volta.', bom: 'Depois de 384.400 km, a capivara quicou uma vez, fincou a toalha e ficou olhando em volta.', duro: 'Depois de 384.400 km, a capivara chegou antes do foguete. O foguete chegou aos poucos.' }[d.s.pousoNota] || 'Depois de 384.400 km, a capivara fincou a toalha e ficou olhando em volta.'),
        el('p', { class: 'final-tira' }, '“É menor do que parecia”, ela pensou. Foi uma longa viagem para pensar isso.'),
        el('p', {}, 'O chefe já estava lá. “Eu avisei”, disse o tatu. Nunca explicou como chegou.'),
        el('p', {}, '“Já que está aí, a Lua agora é filial. Você abre às 8. Traga o crachá.”'),
        el('dl', { class: 'recibo' }, el('dt', {}, 'Voos'), el('dd', {}, fmt(j.voos)), el('dt', {}, 'Tempo voando'), el('dd', {}, horas < 1 ? Math.round(horas * 60) + ' min' : horas.toFixed(1).replace('.', ',') + ' h'), el('dt', {}, 'Batidas ao longo da vida'), el('dd', {}, fmt(j.estat.batidas)), el('dt', {}, 'Pagamento deste voo'), el('dd', {}, '+' + fmt(f.total))),
        el('p', { class: 'final-libera' }, 'Liberado no Laboratório: Autopiloto e Dobra.'),
        el('p', {}, 'Dá para continuar voando, tentar um pouso perfeito ou fugir para Plutão.'),
        botao('Voltar para a Terra', () => App.ir('oficina'), 'bt-principal', { id: 'bt-voltar-terra' })));
    requestAnimationFrame(() => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      const ctx = c.getContext('2d');
      const W = c.width, H = c.height, y = H * 0.76;
      const L = D().layout(j.foguete, null, { desde: d.s.estagio });
      /* mesma proporção da oficina: o foguete é bem maior que a capivara */
      const e = Math.min(1.3, (H * 0.62) / L.altura);
      ctx.save();
      ctx.translate(W * 0.24, y - L.altura * e);
      ctx.scale(e, e);
      /* na Lua só chega o que sobrou do foguete */
      D().pintarSprite(ctx, j.foguete, j.pintura, { t: 1, desde: d.s.estagio, semPiloto: true });
      ctx.restore();
      const xc = W * 0.4, esc = Math.max(0.55, Math.min(1, e * 0.62));
      ctx.strokeStyle = '#33281F';
      ctx.lineWidth = 3;
      const xb = xc + 100 * esc, yb = y - 280 * esc;
      ctx.beginPath();
      ctx.moveTo(xb, y + 6);
      ctx.lineTo(xb, yb);
      ctx.stroke();
      ctx.lineWidth = 1.8;
      ctx.fillStyle = '#C8513F';
      ctx.fillRect(xb, yb, 72 * esc, 42 * esc);
      ctx.strokeRect(xb, yb, 72 * esc, 42 * esc);
      D().adesivo(ctx, 'capivara', xb + 36 * esc, yb + 21 * esc, 30 * esc);
      D().capivara(ctx, xc, y + 8, esc, { pose: 'comemora', t: 0.3 });
      P.tatu(ctx, W * 0.09, y + 18, esc * 0.95, { vira: false });
    });
  }

  /* ---------- Opções ---------- */
  const NOME_TECLA = { esquerda: 'Inclinar para a esquerda', direita: 'Inclinar para a direita', turbo: 'Turbo', soltar: 'Soltar estágio', escudo: 'Escudo de bolha', autopiloto: 'Autopiloto', tempo: 'Acelerar o tempo', pausa: 'Pausar' };
  const textoTecla = (c) => c.replace(/^Key/, '').replace(/^Digit/, '').replace('Arrow', '').replace('Space', 'Espaço').replace('Escape', 'Esc').replace('Left', 'Esquerda').replace('Right', 'Direita').replace('Up', 'Cima').replace('Down', 'Baixo');

  function opcoes(raiz, d) {
    const j = jogo();
    const o = j.opcoes;
    const voltar = d && d.voltar;
    const corpo = el('main', { class: 'opcoes', id: 'opcoes' });
    if (!voltar) raiz.append(fundo(RL.Pintura.parque, 'apagado'), j.abertura ? barra('opcoes') : null);
    raiz.append(corpo);
    function desenhar() {
      corpo.textContent = '';
      corpo.append(el('h2', {}, 'Opções'));
      corpo.append(el('label', { class: 'campo' }, 'Volume', el('input', { type: 'range', min: 0, max: 1, step: 0.05, value: o.volume, id: 'volume', oninput: (e) => { o.volume = +e.target.value; RL.Som.config(o.volume, o.som); App.salvar(); } })));
      corpo.append(el('label', { class: 'campo' }, 'Música', el('input', { type: 'range', min: 0, max: 1, step: 0.05, value: o.musica, id: 'musica', oninput: (e) => { o.musica = +e.target.value; RL.Som.configMusica(o.musica); App.salvar(); } })));
      corpo.append(el('label', { class: 'campo marcar' }, el('input', { type: 'checkbox', checked: o.som, onchange: (e) => { o.som = e.target.checked; RL.Som.config(o.volume, o.som); App.salvar(); } }), 'Som ligado'));
      corpo.append(el('label', { class: 'campo marcar' }, el('input', { type: 'checkbox', checked: o.movimentoReduzido, onchange: (e) => { o.movimentoReduzido = e.target.checked; App.salvar(); } }), 'Sem tremor na tela'));
      corpo.append(el('div', { class: 'campo' }, 'Controle',
        el('div', { class: 'opcoes-texto' }, [['auto', 'Automático'], ['teclado', 'Só teclado'], ['mouse', 'Só mouse']].map(([v, n]) => botao(n, () => { o.controle = v; App.salvar(); desenhar(); }, 'bt-mini' + (o.controle === v ? ' atual' : ''), { 'data-controle': v })))));
      const lista = el('div', { class: 'teclas' });
      for (const [k, nome] of Object.entries(NOME_TECLA)) {
        const b = botao(textoTecla(o.teclas[k]), () => {
          b.textContent = 'Aperte uma tecla';
          const pegar = (e) => {
            e.preventDefault();
            e.stopPropagation();
            o.teclas[k] = e.code;
            App.salvar();
            window.removeEventListener('keydown', pegar, true);
            desenhar();
          };
          window.addEventListener('keydown', pegar, true);
        }, 'bt-mini', { 'data-tecla': k });
        lista.append(el('div', { class: 'tecla-linha' }, el('span', {}, nome), b));
      }
      corpo.append(el('h3', {}, 'Teclas'), lista, el('p', { class: 'nota' }, 'A e D também inclinam; seta para cima e W também são turbo. No mouse, o foguete segue o cursor, o botão esquerdo é turbo e o direito solta o estágio.'));
      corpo.append(el('div', { class: 'opcoes-pe' },
        botao('Tela cheia', () => {
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
        }),
        voltar ? botao('Voltar', voltar, 'bt-principal', { id: 'bt-voltar-opcoes' }) : (!j.abertura ? botao('Voltar', () => App.ir('abertura')) : null),
        botao('Apagar jogo salvo', () => {
          if (confirm('Apagar todo o progresso? Não tem volta.')) App.apagar();
        }, 'bt-perigo', { id: 'bt-apagar' })));
    }
    desenhar();
  }

  RL.Telas = {
    usar(app) {
      App = app;
    },
    abertura, historia, oficina, pintura, laboratorio, mapa, resultado, final, opcoes, el, botao, fundo, barra, atualizarSaldo,
  };
})();
