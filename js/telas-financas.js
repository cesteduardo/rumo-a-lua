/* Telas de dinheiro e recompensas: contratos, banco e conquistas. */
(function () {
  const RL = window.RL;
  const fmt = (n) => Math.floor(n).toLocaleString('pt-BR');

  function telas(App) {
    const { el, botao, fundo, barra, atualizarSaldo } = RL.Telas;
    const jogo = () => App.jogo;

    function contratos(raiz) {
      const j = jogo();
      RL.completarContratos(j);
      const lista = el('div', { class: 'contratos', id: 'contratos' });
      const nota = el('p', { class: 'contratos-nota' });
      const painelMarcas = el('section', { class: 'patrocinio', id: 'patrocinio' });
      const logo = (m, w, h) => {
        const c = el('canvas', { width: w * 2, height: h * 2, style: `width:${w}px;height:${h}px`, class: 'logo-marca', role: 'img', 'aria-label': m.nome });
        const x = c.getContext('2d');
        x.scale(2, 2);
        const pintarLogo = () => { x.clearRect(0, 0, w, h); RL.Desenho.logoMarca(x, m, w / 2, h / 2, w - 4, h - 4); };
        pintarLogo();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(pintarLogo);
        return c;
      };
      raiz.append(fundo(RL.Pintura.parque, 'apagado'), barra('contratos'),
        el('main', { class: 'tela-contratos entrar' },
          el('header', { class: 'contratos-cab' }, el('h2', {}, 'Mural de contratos'), nota),
          lista, painelMarcas));
      function desenharMarcas() {
        painelMarcas.textContent = '';
        const lim = RL.limiteMarcas(j);
        const vagas = j.pintura.marcas.length;
        painelMarcas.append(el('header', {}, el('h2', {}, `No casco: ${vagas} de ${lim}`),
          el('p', {}, 'Cumpra um contrato para assinar com a marca. Cada logotipo no foguete paga 4% a mais. A pesquisa Patrocínio abre mais vagas.')));
        const grade = el('div', { class: 'grade-marcas' });
        for (const m of RL.MARCAS) {
          const assinada = j.assinadas.includes(m.id);
          const usa = j.pintura.marcas.includes(m.id);
          const bt = el('button', {
            class: 'marca' + (usa ? ' usando' : '') + (assinada ? '' : ' sem-contrato'), type: 'button', 'data-marca': m.id, disabled: !assinada,
            title: assinada ? m.slogan : 'Cumpra um contrato com essa marca', 'aria-pressed': usa ? 'true' : 'false',
            onclick: () => {
              if (RL.alternarMarca(j, m.id)) {
                RL.Som.encaixe();
                App.salvar();
                desenharMarcas();
              } else RL.Som.erro();
            },
          }, logo(m, 196, 58), el('small', {}, assinada ? m.slogan : 'Sem contrato ainda'));
          grade.append(bt);
        }
        painelMarcas.append(grade);
      }
      function desenhar() {
        atualizarSaldo();
        desenharMarcas();
        nota.textContent = `Pagam sozinhos no fim do voo em que forem cumpridos. Você já cumpriu ${fmt(j.estat.contratos)}.`;
        lista.textContent = '';
        j.contratos.forEach((c, i) => {
          const custo = RL.custoTrocar(c);
          lista.append(el('article', { class: 'contrato', 'data-contrato': i, style: `--giro:${[-1.2, 0.8, -0.5][i % 3]}deg` },
            el('span', { class: 'percevejo' }),
            c.marca ? logo(RL.MARCA[c.marca], 290, 74) : null,
            c.marca ? el('small', { class: 'slogan' }, RL.MARCA[c.marca].slogan) : el('small', {}, c.de),
            el('h3', {}, c.texto),
            el('div', { class: 'contrato-pe' },
              el('b', { class: 'premio' }, el('span', { class: 'icone-moeda' }), fmt(c.premio)),
              botao(`Trocar por ${fmt(custo)}`, () => {
                if (RL.trocarContrato(j, i)) {
                  App.salvar();
                  desenhar();
                } else RL.Som.erro();
              }, 'bt-mini', { disabled: j.moedas < custo, 'data-trocar': i }))));
        });
      }
      desenhar();
    }

    function banco(raiz) {
      const j = jogo();
      const corpo = el('main', { class: 'banco entrar', id: 'banco' });
      raiz.append(fundo(RL.Pintura.parque, 'apagado'), barra('banco'), corpo);
      const fatias = (valor, f, id) => el('div', { class: 'opcoes-texto' }, [[0.25, '25%'], [0.5, '50%'], [1, 'Tudo']].map(([p, n]) => botao(n, () => {
        if (f(Math.floor(valor * p))) {
          RL.Som.compra();
          App.salvar();
          desenhar();
        } else RL.Som.erro();
      }, 'bt-mini', { disabled: valor < 1, 'data-acao-banco': id + '-' + n })));
      function desenhar() {
        atualizarSaldo();
        corpo.textContent = '';
        const b = j.banco;
        const disp = RL.disponivelEmprestimo(j);
        corpo.append(
          el('section', { class: 'cofre' },
            el('h2', {}, 'Poupança'),
            el('p', { class: 'valor-grande', id: 'poupanca' }, fmt(b.poupanca)),
            el('p', {}, `Rende ${Math.round(RL.RENDIMENTO * 100)}% a cada voo, com teto de metade do seu melhor pagamento.`),
            el('h3', {}, 'Guardar'), fatias(j.moedas, (v) => RL.depositar(j, v), 'depositar'),
            el('h3', {}, 'Sacar'), fatias(b.poupanca, (v) => RL.sacar(j, v), 'sacar')),
          el('section', { class: 'cofre' + (b.divida > 0 ? ' em-divida' : '') },
            el('h2', {}, 'Empréstimo'),
            el('p', { class: 'valor-grande', id: 'divida' }, b.divida > 0 ? '-' + fmt(b.divida) : 'Nome limpo'),
            el('p', {}, `Juros fixos de ${Math.round(RL.JUROS_EMPRESTIMO * 100)}%. Até quitar, ${Math.round(RL.PARCELA * 100)}% de cada pagamento vai para a dívida. Dá para pegar até ${fmt(disp)}.`),
            el('h3', {}, 'Pegar'), fatias(disp, (v) => RL.pegarEmprestimo(j, v), 'pegar'),
            el('h3', {}, 'Pagar agora'), fatias(Math.min(b.divida, j.moedas), (v) => RL.pagarDivida(j, v), 'pagar')),
          extrato());
      }
      function extrato() {
        const maior = Math.max(1, ...j.extrato.map((e) => e.total));
        const graf = el('div', { class: 'grafico', role: 'img', 'aria-label': 'Pagamento dos últimos voos' });
        for (const e of [...j.extrato].reverse()) graf.append(el('i', { style: `height:${Math.max(4, (e.total / maior) * 100)}%`, title: `Voo ${e.voo}: ${fmt(e.total)}` }));
        const linhas = j.extrato.length
          ? el('table', { class: 'tabela-extrato' },
            el('thead', {}, el('tr', {}, el('th', {}, 'Voo'), el('th', {}, 'Km'), el('th', {}, 'Recebido'))),
            el('tbody', {}, j.extrato.map((e) => el('tr', {}, el('td', {}, String(e.voo)), el('td', {}, RL.fmtKm(e.km)), el('td', {}, '+' + fmt(e.total))))))
          : el('p', {}, 'Nenhum voo ainda. O caixa está esperando.');
        return el('section', { class: 'cofre extrato' }, el('h2', {}, 'Extrato'), j.extrato.length ? graf : null, linhas,
          el('p', { class: 'nota' }, `Total ganho: ${fmt(j.estat.ganho)}. Melhor pagamento: ${fmt(j.melhorPago)}.`));
      }
      desenhar();
    }

    const NOMES_ITEM = { padroes: 'Padrão', adesivos: 'Adesivo', rastros: 'Rastro' };
    function conquistas(raiz) {
      const j = jogo();
      const feitas = j.conquistas.length;
      const grade = el('div', { class: 'grade-conquistas' });
      for (const c of RL.CONQUISTAS) {
        const ok = j.conquistas.includes(c.id);
        const oculto = c.segredo && !ok;
        grade.append(el('article', { class: 'conquista' + (ok ? ' feita' : '') + (oculto ? ' oculta' : ''), 'data-conquista': c.id },
          el('h3', {}, oculto ? 'Segredo' : c.nome),
          el('p', {}, oculto ? 'O tatu sabe, mas não conta.' : c.desc),
          oculto ? null : el('small', {}, `${fmt(c.premio)} moedas` + (c.libera ? ` + ${NOMES_ITEM[c.libera[0]].toLowerCase()}` : ''))));
      }
      raiz.append(fundo(() => RL.Pintura.faixa('orbita')), barra('conquistas'),
        el('main', { class: 'tela-conquistas entrar' },
          el('header', { class: 'contratos-cab' }, el('h2', {}, 'Conquistas'), el('p', { class: 'contratos-nota' }, `${feitas} de ${RL.CONQUISTAS.length}. Segredos achados: ${RL.CONQUISTAS.filter((c) => c.segredo && j.conquistas.includes(c.id)).length} de ${RL.CONQUISTAS.filter((c) => c.segredo).length}.`)),
          grade));
    }

    Object.assign(RL.Telas, { contratos, banco, conquistas });
  }

  RL.TelasFinancas = telas;
})();
