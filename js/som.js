/* Sons sintetizados. Só tocam depois do primeiro clique, como o navegador exige. */
(function () {
  const RL = window.RL;
  let ac = null, mestre = null, motorGanho = null, motorFiltro = null, volume = 0.6, ligado = true;

  function iniciar() {
    if (ac) {
      if (ac.state === 'suspended') ac.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    mestre = ac.createGain();
    mestre.gain.value = ligado ? volume : 0;
    mestre.connect(ac.destination);
    const n = ac.sampleRate * 2, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    let u = 0;
    for (let i = 0; i < n; i++) {
      u = u * 0.97 + (Math.random() * 2 - 1) * 0.03;
      d[i] = u * 3;
    }
    const f = ac.createBufferSource();
    f.buffer = buf;
    f.loop = true;
    const filtro = ac.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 420;
    motorFiltro = filtro;
    motorGanho = ac.createGain();
    motorGanho.gain.value = 0;
    f.connect(filtro);
    filtro.connect(motorGanho);
    motorGanho.connect(mestre);
    f.start();
  }

  function tom(freq, dur, tipo, vol, ate, atraso) {
    if (!ac) return;
    const t = ac.currentTime + (atraso || 0);
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo || 'triangle';
    o.frequency.setValueAtTime(freq, t);
    if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol || 0.15, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(mestre);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  /* Música: loops em arquivo, gerados por ferramentas/gerar-musica.js. Troca com a tela. */
  const faixas = {};
  let faixaAtual = null, volMusica = 0.5;
  function tocarMusica(nome) {
    if (faixaAtual === nome) return;
    if (faixaAtual && faixas[faixaAtual]) faixas[faixaAtual].pause();
    faixaAtual = nome;
    if (!nome) return;
    if (!faixas[nome]) {
      const a = new Audio('arte/musica/' + nome + '.ogg');
      a.loop = true;
      a.onerror = () => { a.onerror = null; a.src = 'arte/musica/' + nome + '.mp3'; };
      faixas[nome] = a;
    }
    faixas[nome].volume = ligado ? volMusica * volume : 0;
    faixas[nome].currentTime = 0;
    const p = faixas[nome].play();
    if (p && p.catch) p.catch(() => { faixaAtual = null; });
  }

  RL.Som = {
    musica: tocarMusica,
    configMusica(v) {
      volMusica = v;
      if (faixaAtual && faixas[faixaAtual]) faixas[faixaAtual].volume = ligado ? v * volume : 0;
    },
    iniciar,
    config(v, on) {
      volume = v;
      ligado = on;
      if (mestre) mestre.gain.value = on ? v : 0;
      if (faixaAtual && faixas[faixaAtual]) faixas[faixaAtual].volume = on ? volMusica * v : 0;
    },
    /* quanto mais rápido, mais agudo: o ouvido sente a velocidade antes do olho */
    motor(n, veloc, salto) {
      if (!motorGanho) return;
      motorGanho.gain.setTargetAtTime(n * 0.5, ac.currentTime, 0.12);
      motorFiltro.frequency.setTargetAtTime(300 + (veloc || 0) * 1500 + (salto ? 900 : 0), ac.currentTime, 0.2);
    },
    clique: () => tom(520, 0.07, 'triangle', 0.09, 390),
    encaixe: () => { tom(180, 0.08, 'square', 0.07, 110); tom(620, 0.06, 'triangle', 0.08, 0, 0.04); },
    compra: () => { tom(520, 0.09, 'triangle', 0.1); tom(780, 0.14, 'triangle', 0.1, 0, 0.08); },
    erro: () => tom(170, 0.16, 'square', 0.06, 120),
    /* cada moeda da sequência sobe um degrau da escala */
    moeda: (combo) => {
      const degraus = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
      const f = 760 * 2 ** (degraus[Math.min(degraus.length - 1, Math.floor((combo || 0) / 3))] / 12);
      tom(f, 0.09, 'triangle', 0.07, f * 1.5);
    },
    bolha: () => { tom(300, 0.3, 'sine', 0.13, 900); tom(600, 0.22, 'triangle', 0.05, 1500, 0.05); },
    turbo: () => tom(180, 0.4, 'sawtooth', 0.07, 620),
    bum: () => { tom(90, 0.5, 'sawtooth', 0.2, 30); tom(180, 0.2, 'square', 0.08, 50); },
    recorde: () => { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tom(f, 0.26, 'triangle', 0.11, 0, i * 0.09)); },
    salto: () => { [392, 523, 784, 1047].forEach((f, i) => tom(f, 0.18, 'square', 0.06, 0, i * 0.07)); },
    batida: () => tom(130, 0.22, 'sawtooth', 0.14, 50),
    soltar: () => tom(300, 0.18, 'square', 0.08, 90),
    evento: () => { tom(392, 0.13, 'square', 0.06); tom(523, 0.2, 'square', 0.06, 0, 0.13); },
    marco: () => { [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.2, 'triangle', 0.1, 0, i * 0.11)); },
    explosao: () => tom(160, 0.7, 'sawtooth', 0.18, 30),
    pago: () => tom(1200, 0.05, 'triangle', 0.05),
  };
})();
