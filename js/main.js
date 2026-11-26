/* Liga tudo: jogo salvo, troca de telas e início do voo. */
(function () {
  const RL = window.RL;
  const raiz = document.getElementById('tela');
  let limpeza = null;
  const memoria = { tipo: 'motor' };
  const armazem = (() => {
    try {
      return window.localStorage;
    } catch (e) {
      return { setItem() {}, getItem() { return null; }, removeItem() {} };
    }
  })();

  /* Transição de íris, como fim de desenho antigo. */
  const semTransicao = location.hash === '#teste' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const iris = document.getElementById('iris');
  let trocando = false;
  function comIris(trocar) {
    if (semTransicao || trocando) {
      trocar();
      return;
    }
    trocando = true;
    iris.className = 'fecha';
    setTimeout(() => {
      trocar();
      iris.className = 'abre';
      setTimeout(() => {
        iris.className = '';
        trocando = false;
      }, 300);
    }, 280);
  }

  /* Modo de teste: a carteira volta a encher a cada tela e a cada compra salva. */
  const SALDO_TESTE = 999999999999;
  function encherCarteira() {
    if (RL.MODO_DEV) App.jogo.moedas = SALDO_TESTE;
  }

  const App = {
    jogo: RL.carregar(armazem) || RL.jogoNovo(),
    temSalvo() {
      return !!RL.carregar(armazem);
    },
    salvar() {
      encherCarteira();
      App.jogo.visto = Date.now();
      RL.salvar(App.jogo, armazem);
    },
    novo() {
      RL.apagar(armazem);
      App.jogo = RL.jogoNovo();
      RL.completarContratos(App.jogo);
      App.salvar();
      App.ir('historia');
    },
    apagar() {
      RL.apagar(armazem);
      App.jogo = RL.jogoNovo();
      App.ir('abertura');
    },
    continuar() {
      if (App.jogo.vooAtivo) App.lancar(true);
      else App.ir('oficina');
    },
    ir(nome, dados) {
      comIris(() => App.mostrar(nome, dados));
    },
    mostrar(nome, dados) {
      encherCarteira();
      RL.Personagens.vestir(App.jogo.piloto);
      if (limpeza) limpeza();
      limpeza = null;
      if (RL.Voo.atual) RL.Voo.atual.parar();
      raiz.textContent = '';
      raiz.dataset.tela = nome;
      const f = RL.Telas[nome];
      const r = nome === 'oficina' ? f(raiz, memoria) : f(raiz, dados);
      if (typeof r === 'function') limpeza = r;
      RL.Som.config(App.jogo.opcoes.volume, App.jogo.opcoes.som);
      RL.Som.configMusica(App.jogo.opcoes.musica);
      if (App.tocou) RL.Som.musica('oficina');
    },
    lancar(retomar) {
      const j = App.jogo;
      if (!retomar) {
        j.vooAtivo = null;
        if (RL.problemasDoBuild(j.foguete).length) return;
      }
      comIris(() => App.comecarVoo());
    },
    comecarVoo() {
      const j = App.jogo;
      RL.Personagens.vestir(j.piloto);
      if (limpeza) limpeza();
      limpeza = null;
      if (RL.Voo.atual) RL.Voo.atual.parar();
      raiz.textContent = '';
      raiz.dataset.tela = 'voo';
      RL.Som.iniciar();
      RL.Som.configMusica(j.opcoes.musica);
      RL.Som.musica('voo');
      RL.Voo.iniciar(raiz, {
        jogo: j,
        aoSalvar: () => App.salvar(),
        aoOpcoes: () => {
          const voo = RL.Voo.atual;
          const camada = document.createElement('div');
          camada.className = 'camada-opcoes';
          raiz.append(camada);
          RL.Telas.opcoes(camada, { voltar: () => { camada.remove(); voo.est.pausado = true; } });
        },
        aoTerminar: (s, a) => {
          const f = RL.fechamento(s, a, j);
          RL.aplicarFechamento(j, f, s);
          App.salvar();
          App.ir(s.fim === 'lua' ? 'final' : 'resultado', { s, a, fechamento: f });
        },
      });
    },
  };

  /* o código de sempre */
  const CODIGO = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  let codigoPos = 0;
  window.addEventListener('keydown', (e) => {
    codigoPos = e.code === CODIGO[codigoPos] ? codigoPos + 1 : e.code === CODIGO[0] ? 1 : 0;
    if (codigoPos < CODIGO.length) return;
    codigoPos = 0;
    if (RL.revelar(App.jogo, 'codigo')) {
      const j = App.jogo;
      for (const chave of ['chapeu:coroa', 'pescoco:medalha']) if (!j.roupas.includes(chave)) j.roupas.push(chave);
      j.moedas += 1969;
      RL.Som.recorde();
      App.salvar();
      if (RL.Telas.atualizarSaldo) RL.Telas.atualizarSaldo();
    } else RL.Som.clique();
  });

  /* navegador só toca som depois do primeiro clique */
  window.addEventListener('pointerdown', () => {
    if (App.tocou) return;
    App.tocou = true;
    RL.Som.iniciar();
    RL.Som.configMusica(App.jogo.opcoes.musica);
    if (!RL.Voo.atual) RL.Som.musica('oficina');
  });

  RL.App = App;
  RL.Telas.usar(App);
  RL.TelasFinancas(App);
  RL.completarContratos(App.jogo);
  RL.Personagens.vestir(App.jogo.piloto);
  App.fora = RL.receberFora(App.jogo, Date.now());
  if (App.fora.valor > 0) App.salvar();

  const barra = document.getElementById('progresso');
  RL.carregarFiguras(() => RL.Pintura.prepararTudo(
    (p) => { if (barra) barra.style.transform = `scaleX(${p})`; },
    () => {
      const carregando = document.getElementById('carregando');
      if (carregando) carregando.remove();
      App.mostrar('abertura');
    }));
})();
