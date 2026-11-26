/* Desenha chapéus, óculos e logotipos do jogo web em PNG para o Godot usar os mesmos. */
import { chromium } from '/home/eduardo/www/Caderno de Ofertas/node_modules/playwright-core/index.mjs';
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
const cache = join(process.env.HOME, '.cache/ms-playwright');
const pasta = readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().pop();
const b = await chromium.launch({ executablePath: join(cache, pasta, 'chrome-linux64/chrome') });
const p = await b.newPage();
await p.goto('file://' + resolve('index.html') + '#teste');
await p.waitForSelector('#bt-novo', { timeout: 30000 });
await p.waitForTimeout(600);
const r = await p.evaluate(() => {
  const saida = {};
  const png = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d')); return c.toDataURL('image/png'); };
  for (const q of RL.ROUPAS.chapeu) if (!['nenhum', 'coroa'].includes(q.id)) saida['chapeu_' + q.id] = png(360, 300, (x) => { x.translate(180, 225); x.scale(3, 3); RL.Personagens.chapeu(x, q.id); });
  for (const q of RL.ROUPAS.oculos) if (q.id !== 'nenhum') saida['oculos_' + q.id] = png(300, 180, (x) => { x.lineWidth = 2; RL.Personagens.oculos(x, q.id, 105, 195, 90, 45, 45); });
  for (const m of RL.MARCAS) saida['logo_' + m.id] = png(560, 150, (x) => { x.scale(2, 2); RL.Desenho.logoMarca(x, m, 140, 37, 272, 62); });
  return saida;
});
const d = resolve('godot/arte/acessorios');
mkdirSync(d, { recursive: true });
for (const [n, u] of Object.entries(r)) writeFileSync(join(d, n + '.png'), Buffer.from(u.split(',')[1], 'base64'));
console.log('imagens:', Object.keys(r).length);
await b.close();
