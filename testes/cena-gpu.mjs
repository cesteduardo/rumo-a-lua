/* Fotos da cena WebGPU do voo em várias altitudes, lidas direto da GPU.
   Uso: node testes/cena-gpu.mjs <pasta-das-fotos> [largura altura]
   O Chrome headless não mostra canvas WebGPU no print: a página junta fundo, 2D e frente
   (RL.Voo.atual.gpu.capturar) e a foto final põe essa imagem atrás do painel de verdade. */
import { chromium } from '/home/eduardo/www/Caderno de Ofertas/node_modules/playwright-core/index.mjs';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { createServer } from 'node:http';

const PERF = process.argv.includes('--perf');
const args = process.argv.slice(2).filter((a) => a !== '--perf');
const fotos = resolve(args[0] || 'testes/saida-gpu');
mkdirSync(fotos, { recursive: true });
const W = +(args[1] || 1920), H = +(args[2] || 1080);
const cache = join(process.env.HOME, '.cache/ms-playwright');
const pasta = readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().pop();
const browser = await chromium.launch({
  executablePath: join(cache, pasta, 'chrome-linux64/chrome'), headless: true,
  args: ['--headless=new', '--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-angle=vulkan', '--ignore-gpu-blocklist', '--disable-vulkan-surface', '--mute-audio', '--autoplay-policy=no-user-gesture-required'],
  ignoreDefaultArgs: ['--disable-gpu', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader', '--headless'],
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const erros = [];
page.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') erros.push(m.type() + ': ' + m.text() + ' ' + JSON.stringify(m.location())); });
page.on('dialog', (d) => d.accept());

/* mede quanto cada quadro gasta de JavaScript (atualizar + pintar + painel) */
await page.addInitScript(() => {
  window.__js = [];
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (f) => raf((t) => { const a = performance.now(); f(t); window.__js.push(performance.now() - a); });
});
/* servidor local: em file:// a arte do Runway suja o canvas e a captura não pode ler os pixels */
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg' };
const raiz = resolve('.');
const srv = createServer((q, r) => {
  try {
    const f = join(raiz, decodeURIComponent(q.url.split('?')[0].split('#')[0]));
    if (!f.startsWith(raiz)) throw new Error('fora');
    const corpo = readFileSync(f);
    r.writeHead(200, { 'content-type': TIPOS[extname(f)] || 'application/octet-stream' });
    r.end(corpo);
  } catch (e) { r.writeHead(404); r.end(); }
}).listen(0, '127.0.0.1');
await new Promise((ok) => srv.once('listening', ok));
await page.goto(`http://127.0.0.1:${srv.address().port}/index.html${PERF ? '?perf' : ''}${process.env.SEMGPU ? (PERF ? '&' : '?') + 'semgpu' : ''}#dev`);
await page.waitForSelector('#bt-novo', { timeout: 60000 });
console.log('WebGPU ligada:', await page.evaluate(() => RL.CenaGPU.ok));
await page.waitForTimeout(1600);
await page.screenshot({ path: join(fotos, '00-abertura.png') });
await page.click('#bt-novo');
for (let i = 0; i < 3; i++) { await page.waitForSelector('#bt-historia'); await page.click('#bt-historia'); }
await page.waitForSelector('#bt-lancar');
await page.click('#bt-lancar');
await page.waitForSelector('.voo');

async function foto(nome) {
  const url = await page.evaluate(() => RL.Voo.atual.gpu.capturar());
  await page.evaluate((u) => {
    const v = document.querySelector('.voo');
    v.querySelectorAll(':scope > canvas').forEach((c) => { c.style.visibility = 'hidden'; });
    v.style.background = `url(${u}) 0 0 / 100% 100% no-repeat`;
  }, url);
  await page.screenshot({ path: join(fotos, nome + '.png') });
  await page.evaluate(() => {
    const v = document.querySelector('.voo');
    v.querySelectorAll(':scope > canvas').forEach((c) => { c.style.visibility = ''; });
    v.style.background = '';
  });
  console.log('foto', nome);
}

if (PERF) {
  /* 5 s em cada altitude, com o turbo ligado: tempo de GPU por quadro e intervalo entre quadros */
  const TRECHOS = [0, 1.6, 6, 30, 120, 1500, 40000, 300000, 378000];
  await page.waitForFunction(() => RL.Voo.atual.s.decolou, null, { timeout: 15000 });
  await page.keyboard.down('KeyW');
  const est = (v) => { const o = [...v].sort((a, b) => a - b); const m = v.reduce((a, b) => a + b, 0) / v.length; return `média ${m.toFixed(2)}  p99 ${o[Math.floor(o.length * 0.99)].toFixed(2)}  máx ${o[o.length - 1].toFixed(2)}  (n=${v.length})`; };
  const todosG = [], todosI = [];
  for (const km of TRECHOS) {
    if (km) await page.evaluate((k) => RL.Voo.atual.devPular(k), km);
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => new Promise((ok) => {
      if (RL.CenaGPU.tempos) RL.CenaGPU.tempos.length = 0;
      window.__js.length = 0;
      const iv = []; let ant = performance.now();
      const fim = ant + 5000;
      const q = (t) => { iv.push(t - ant); ant = t; if (t < fim) requestAnimationFrame(q); else ok({ g: (RL.CenaGPU.tempos || [0]).slice(), iv, js: window.__js.slice() }); };
      requestAnimationFrame(q);
    }));
    todosG.push(...r.g); todosI.push(...r.iv.slice(1));
    console.log(String(km).padStart(7), 'km  GPU', est(r.g), '| quadro', est(r.iv.slice(1)), '| JS', est(r.js));
  }
  console.log('TOTAL     GPU', est(todosG), '| quadro', est(todosI));
  console.log('quadros de GPU acima de 11 ms:', todosG.filter((x) => x > 11).length, '| intervalos acima de 20 ms:', todosI.filter((x) => x > 20).length);
  console.log(erros.join('\n') || 'sem erros no console');
  await browser.close();
  srv.close();
  process.exit(0);
}

await page.waitForTimeout(700);
await foto('01-plataforma');
await page.waitForFunction(() => RL.Voo.atual.s.decolou, null, { timeout: 15000 });
await page.waitForTimeout(350);
await foto('015-ignicao');
await page.keyboard.down('KeyW');
await page.waitForTimeout(1100);
console.log('na GPU:', JSON.stringify(await page.evaluate(() => RL.Voo.atual.gpu.contagem)), 'puffs no jogo:', await page.evaluate(() => RL.Voo.atual.fx.lista.filter((p) => p.k === 'puff').length), 'scroll', await page.evaluate(() => RL.Voo.atual.est.scroll | 0));
await foto('02-decolagem');
await page.keyboard.up('KeyW');
const POSES = [['03-nuvens', 1.6], ['04-tempestade', 6], ['05-alto', 30], ['06-borda', 120], ['07-orbita', 1500], ['08-longe', 40000], ['09-perto-lua', 300000], ['10-lua', 378000]];
for (const [nome, km] of POSES) {
  await page.evaluate((k) => RL.Voo.atual.devPular(k), km);
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(1200);
  await foto(nome);
  await page.keyboard.up('KeyW');
}
const gpuOk = await page.evaluate(() => RL.CenaGPU.ok);
console.log('GPU ainda ligada no fim:', gpuOk);
console.log(erros.join('\n') || 'sem erros no console');
await browser.close();
srv.close();
