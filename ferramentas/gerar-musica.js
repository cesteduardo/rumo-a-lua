/* Música chiclete sintetizada: dois loops curtos com melodia que gruda, no mesmo espírito dos efeitos.
   Gera arte/musica/*.wav; depois o ffmpeg passa para .ogg. Uso: node ferramentas/gerar-musica.js */
const fs = require('fs');
const path = require('path');
const TAXA = 44100;
const nota = { C3: 48, D3: 50, E3: 52, F3: 53, G3: 55, A3: 57, B3: 59, C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81 };
const freq = (m) => 440 * 2 ** ((m - 69) / 12);

/* Cada música: tempo, acordes (um por compasso) e melodia em colchetes de 8 semicolcheias por compasso (null = pausa, '-' = segura). */
const MUSICAS = {
  oficina: {
    bpm: 112,
    acordes: ['C', 'C', 'F', 'G', 'C', 'A', 'F', 'G', 'C', 'C', 'F', 'G', 'A', 'F', 'G', 'C'],
    melodia: [
      'E5', null, 'G5', 'E5', 'C5', null, 'D5', 'E5',
      'G5', '-', 'E5', null, 'C5', null, null, null,
      'F5', null, 'A5', 'F5', 'C5', null, 'D5', 'F5',
      'G5', '-', 'F5', 'E5', 'D5', null, 'B4', null,
      'E5', null, 'G5', 'E5', 'C5', null, 'D5', 'E5',
      'A5', '-', 'G5', 'E5', 'C5', null, 'E5', null,
      'F5', 'E5', 'D5', 'C5', 'A4', null, 'C5', 'D5',
      'B4', '-', 'C5', 'D5', 'G4', null, null, null,
      'C5', 'C5', 'E5', 'G5', 'E5', null, 'C5', null,
      'D5', 'E5', 'G5', 'E5', 'C5', '-', null, null,
      'A4', 'C5', 'F5', 'A5', 'F5', null, 'C5', null,
      'B4', 'D5', 'G5', 'F5', 'D5', '-', 'B4', null,
      'A4', 'C5', 'E5', 'A5', 'G5', null, 'E5', null,
      'F5', null, 'A5', 'G5', 'F5', 'E5', 'D5', 'C5',
      'D5', '-', 'B4', 'D5', 'G5', '-', 'F5', 'D5',
      'C5', '-', 'E5', 'G5', 'C5', '-', null, null,
    ],
  },
  voo: {
    bpm: 152,
    acordes: ['A', 'F', 'C', 'G', 'A', 'F', 'C', 'G', 'F', 'G', 'A', 'A', 'F', 'G', 'C', 'G'],
    melodia: [
      'A4', 'C5', 'E5', 'A5', 'G5', 'E5', 'C5', 'E5',
      'F5', '-', 'E5', 'C5', 'A4', 'C5', 'D5', 'E5',
      'G5', 'E5', 'C5', 'E5', 'G5', 'A5', 'G5', 'E5',
      'D5', 'G5', 'D5', 'B4', 'G4', 'B4', 'D5', 'G5',
      'A4', 'C5', 'E5', 'A5', 'G5', 'E5', 'C5', 'E5',
      'A5', '-', 'G5', 'F5', 'E5', 'F5', 'G5', 'A5',
      'G5', 'E5', 'C5', 'G4', 'C5', 'E5', 'G5', 'C5',
      'B4', 'D5', 'G5', 'B4', 'D5', '-', null, null,
      'C5', 'F5', 'A5', 'F5', 'C5', 'F5', 'A5', 'G5',
      'D5', 'G5', 'B4', 'G4', 'D5', 'G5', 'A5', 'G5',
      'E5', 'A5', 'C5', 'A4', 'E5', 'A5', 'G5', 'E5',
      'A5', '-', '-', 'G5', 'A5', null, 'E5', null,
      'F5', 'A5', 'C5', 'F5', 'G5', 'F5', 'E5', 'D5',
      'D5', 'E5', 'G5', 'A5', 'G5', 'D5', 'B4', 'G4',
      'C5', 'E5', 'G5', 'C5', 'E5', 'G5', 'C5', 'E5',
      'D5', '-', 'B4', 'D5', 'G5', '-', '-', '-',
    ],
  },
};
const ACORDE = { C: ['C3', 'E4', 'G4', 'C5'], F: ['F3', 'A4', 'C5', 'F5'], G: ['G3', 'B4', 'D5', 'G5'], A: ['A3', 'C5', 'E5', 'A5'] };

function gerar(m) {
  const por = (60 / m.bpm) / 2; /* colcheia */
  const total = Math.floor(m.acordes.length * 8 * por * TAXA);
  const saida = new Float32Array(total);
  const som = (inicio, dur, f, vol, forma) => {
    const a = Math.floor(inicio * TAXA), n = Math.floor(dur * TAXA);
    let fase = 0;
    for (let i = 0; i < n; i++) {
      const k = i / n;
      fase += f / TAXA;
      const p = fase % 1;
      let v;
      if (forma === 'quadrada') v = p < 0.25 ? 1 : -1;
      else if (forma === 'quadrada2') v = p < 0.5 ? 1 : -1;
      else v = 1 - 4 * Math.abs(p - 0.5);
      const env = Math.min(1, i / 120) * (1 - k) ** 1.3;
      saida[(a + i) % total] += v * env * vol;
    }
  };
  const bumbo = (t) => { let fase = 0; const n = Math.floor(0.11 * TAXA); for (let i = 0; i < n; i++) { const k = i / n; fase += (150 - 110 * k) / TAXA; saida[(Math.floor(t * TAXA) + i) % total] += Math.sin(fase * 6.283) * (1 - k) ** 2 * 0.42; } };
  const prato = (t, vol) => { const n = Math.floor(0.035 * TAXA); for (let i = 0; i < n; i++) { const k = i / n; saida[(Math.floor(t * TAXA) + i) % total] += (Math.random() * 2 - 1) * (1 - k) ** 2 * vol; } };
  m.acordes.forEach((ac, c) => {
    const [b, n1, n2, n3] = ACORDE[ac];
    for (let i = 0; i < 8; i++) {
      const t = (c * 8 + i) * por;
      /* baixo saltitante */
      som(t, por * 0.85, freq(nota[b] + (i % 4 === 2 ? 12 : 0)), 0.3, 'triangulo');
      /* arpejo de fundo */
      som(t, por * 0.6, freq(nota[[n1, n2, n3, n2][i % 4]]), 0.055, 'quadrada2');
      if (i % 4 === 0) bumbo(t);
      if (i % 4 === 2) prato(t, 0.14);
      prato(t, 0.035);
    }
  });
  /* melodia: '-' prolonga a nota anterior */
  m.melodia.forEach((n, i) => {
    if (!n || n === '-') return;
    let dur = 1;
    while (m.melodia[i + dur] === '-') dur++;
    som(i * por, por * dur * 0.95, freq(nota[n]), 0.17, 'quadrada');
  });
  let pico = 0;
  for (const v of saida) pico = Math.max(pico, Math.abs(v));
  const buf = Buffer.alloc(44 + total * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + total * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(TAXA, 24); buf.writeUInt32LE(TAXA * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(total * 2, 40);
  for (let i = 0; i < total; i++) buf.writeInt16LE(Math.round((saida[i] / pico) * 0.8 * 32767), 44 + i * 2);
  return { buf, seg: total / TAXA };
}
const pasta = path.join(__dirname, '../arte/musica');
fs.mkdirSync(pasta, { recursive: true });
for (const [n, m] of Object.entries(MUSICAS)) {
  if (m.melodia.length !== m.acordes.length * 8) throw new Error(n + ': melodia com tamanho errado ' + m.melodia.length);
  const r = gerar(m);
  fs.writeFileSync(path.join(pasta, n + '.wav'), r.buf);
  console.log(n, r.seg.toFixed(1) + ' s');
}
