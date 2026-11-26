/* Janela do jogo no computador (Electron). Tela cheia por padrão; F11 alterna. */
const { app, BrowserWindow, Menu } = require('electron');
const path = require('node:path');

function abrir() {
  const teste = process.env.RUMO_TESTE === '1';
  const win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 1024, minHeight: 640, fullscreen: !teste, show: !teste, autoHideMenuBar: true,
    backgroundColor: '#1E1B3A', title: 'Rumo à Lua',
    webPreferences: { backgroundThrottling: false, contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  Menu.setApplicationMenu(null);
  win.webContents.on('before-input-event', (e, tecla) => {
    if (tecla.type === 'keyDown' && tecla.key === 'F11') win.setFullScreen(!win.isFullScreen());
  });
  win.loadFile(path.join(__dirname, '..', 'index.html'), teste ? { hash: 'teste' } : undefined);
  if (teste) {
    win.webContents.once('did-finish-load', async () => {
      await new Promise((r) => setTimeout(r, 6000));
      const ok = await win.webContents.executeJavaScript("!!document.querySelector('#bt-novo') && document.fonts.check('20px \"Lilita One\"')");
      console.log('janela abriu e achou o menu e a fonte:', ok);
      console.log('cena WebGPU:', await win.webContents.executeJavaScript('RL.CenaGPU.pronto.then(() => RL.CenaGPU.ok)'));
      app.exit(ok ? 0 : 1);
    });
  }
}
/* Cena WebGPU do voo: no Linux o Chromium ainda pede estas chaves. Sem placa compatível,
   o jogo volta sozinho ao desenho 2D. */
app.commandLine.appendSwitch('enable-unsafe-webgpu');
if (process.platform === 'linux') app.commandLine.appendSwitch('enable-features', 'Vulkan');
app.whenReady().then(abrir);
app.on('window-all-closed', () => app.quit());
