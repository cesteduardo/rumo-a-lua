/* Dados do jogo. Nada de lógica aqui além das fórmulas das tabelas. */
(function (raiz) {
  const RL = (raiz.RL = raiz.RL || {});

  RL.KM_LUA = 384400;
  RL.KM_FIM = 5000000000;

  const CORES = ['#C8513F', '#E0B23C', '#5E93A8', '#7A9B4E', '#8E6AA8', '#D9774A', '#4F6F9E', '#B8455F', '#3F8F87', '#2F2C3F'];
  const liberar = [0, 1, 3, 7, 15, 40, 100, 500, 3000, 25000, 20000000, 1000000000];
  /* Tanque é o que vence o ar: libera antes das outras peças, e cada um alcança o portão do seguinte. */
  const LIBERAR_TIPO = { tanque: [0, 1.5, 2.5, 4, 7, 12, 20, 40, 400, 5000, 20000000, 1000000000] };

  const NOMES = {
    bico: ['Cone de trânsito', 'Funil de cozinha', 'Bico de pato', 'Ogiva de lata', 'Agulha de tricô', 'Bala de revólver', 'Lápis apontado', 'Sorvete de casquinha', 'Ponta de diamante', 'Bico cósmico', 'Chifre de unicórnio', 'Ponta final'],
    capsula: ['Barril com janela', 'Geladeira furada', 'Cabine de caminhão', 'Aquário reforçado', 'Orelhão blindado', 'Sala de estar', 'Bolha de vidro', 'Banheira fechada', 'Trono pressurizado', 'Suíte presidencial', 'Cabine de ônibus leito', 'Palácio voador'],
    tanque: ['Galão de quintal', 'Botijão', 'Barril de posto', 'Tanque de trator', 'Caixa d’água', 'Tanque de avião', 'Silo de fazenda', 'Tanque criogênico', 'Reservatório de bairro', 'Tanque sem fundo', 'Tanque do vizinho', 'Oceano engarrafado'],
    motor: ['Soprador de folhas', 'Motor de cortador', 'Escapamento turbinado', 'Foguete de festa junina', 'Motor de lancha', 'Turbina de avião', 'Motor químico', 'Motor de plasma', 'Motor de dobra torta', 'Motor do fim do mundo', 'Motor de estrela', 'Motor sem explicação'],
    aleta: ['Tábua de passar', 'Placa de PARE', 'Asa de frango', 'Prancha de surfe', 'Aleta de carro antigo', 'Asa de planador', 'Leme de veleiro', 'Aleta vetorial', 'Asa de titânio', 'Asa de anjo', 'Barbatana de baleia', 'Asa de cometa'],
    lateral: ['Rojão duplo', 'Sifão de refrigerante', 'Extintor de incêndio', 'Tubo de rojão', 'Mini foguete', 'Propulsor de manobra', 'Reforço sólido', 'Reforço pesado', 'Reforço orbital', 'Par de cometas', 'Auxiliar de cometa', 'Auxiliar sem freio'],
    escudo: ['Tampa de panela', 'Porta de carro', 'Colchão velho', 'Chapa de aço', 'Lona de circo', 'Blindagem de banco', 'Casco de tartaruga', 'Campo magnético', 'Bolha de força', 'Escudo teimoso', 'Escudo de asteroide', 'Escudo imaginário'],
    gerador: ['Bicicleta ergométrica', 'Bateria de carro', 'Catavento', 'Painel solar de chinelo', 'Gerador a diesel', 'Pilha gigante', 'Reator de bolso', 'Turbina iônica', 'Núcleo estelar', 'Sol engarrafado', 'Usina de bolso', 'Buraco de energia'],
    antena: ['Cabide de arame', 'Antena de TV', 'Parabólica de vizinho', 'Rádio amador', 'Torre portátil', 'Radar de porto', 'Antena de satélite', 'Telescópio falante', 'Rede profunda', 'Linha direta com a Lua', 'Rádio cósmica', 'Telefone do universo'],
    ima: ['Ímã de geladeira', 'Ímã de ferro-velho', 'Alto-falante aberto', 'Ferradura grande', 'Ferradura enorme', 'Bobina de oficina', 'Eletroímã', 'Ímã de neodímio', 'Atrator orbital', 'Buraco de moedas', 'Ímã planetário', 'Ímã de tudo'],
    carga: ['Caixa de bananas', 'Sacos de ração', 'Encomenda da tia', 'Piano de cauda', 'Estátua do prefeito', 'Contêiner fechado', 'Laboratório alugado', 'Hotel desmontado', 'Satélite do cliente', 'Bandeira gigante', 'Planeta em miniatura', 'A Lua, pequena'],
    cofre: ['Cofrinho de porco', 'Lata de biscoito', 'Caixa registradora', 'Cofre de padaria', 'Cofre de banco', 'Cofre suíço de mentira', 'Mala de dinheiro', 'Caminhão-forte', 'Tesouro pirata', 'Banco central', 'Casa da moeda', 'Cofre infinito'],
    radar: ['Binóculo', 'Vizinho fofoqueiro', 'Lanterna', 'Radar de chuva', 'Radar de polícia', 'Sonar de morcego', 'Radar de aeroporto', 'Olho de águia', 'Mapa estelar', 'Radar cósmico', 'Bola de cristal', 'Sabe-tudo'],
    paraquedas: ['Guarda-chuva', 'Lençol', 'Toalha de mesa', 'Lona de feira', 'Cortina de teatro', 'Paraquedas de verdade', 'Paraquedas duplo', 'Balão reserva', 'Seda de mentira', 'Paraquedas de grife', 'Asa-delta', 'Nuvem particular'],
    enfeite: ['Pato de borracha', 'Dados de pelúcia', 'Cone de festa', 'Bandeirinha', 'Bola de discoteca', 'Flamingo de jardim', 'Gravata', 'Coroa de papel', 'Globo de neve', 'Troféu inventado', 'Capacete do chefe', 'Retrato da família'],
  };

  /* Modelos intermediários: ficam entre dois níveis e entram na prateleira na ordem de preço. */
  const VARIANTES = {
    bico: ['Bico de chaleira', 'Cone de bala de goma', 'Casca de melancia', 'Bico de bule', 'Ponta cromada', 'Sino de igreja', 'Chapéu de mago', 'Bico de tucano', 'Torre de castelo', 'Bico de avião caça', 'Estalactite', 'Ponta de lança'],
    capsula: ['Trailer rosa', 'Ônibus escolar', 'Cabine telefônica', 'Elevador de prédio', 'Torre de pedra', 'Caixa de correio', 'Sauna', 'Camarote', 'Sala de cofre', 'Observatório', 'Estufa', 'Sala do chefe'],
    tanque: ['Lata de leite', 'Tambor de feira', 'Tanque listrado', 'Galão de refrigerante', 'Tanque de perigo', 'Termo gigante', 'Bujão de festa', 'Aquecedor velho', 'Tanque de mergulho', 'Tonel de vinho', 'Tanque de submarino', 'Barril do fim'],
    motor: ['Corneta de metal', 'Secador de cabelo', 'Motor de fusca', 'Trio de escapes', 'Sino verde', 'Aspirador ao contrário', 'Bocal de bombeiro', 'Motor de trem', 'Cano de órgão', 'Anel laranja', 'Motor de cruzeiro', 'Motor emprestado'],
    aleta: ['Porta de geladeira', 'Remo de canoa', 'Pá de ventilador', 'Asa de pombo', 'Prancha de bodyboard', 'Barbatana de tubarão', 'Vela de jangada', 'Lâmina de trator', 'Asa de morcego', 'Asa de libélula', 'Leme de navio', 'Asa de dragão'],
    lateral: ['Par de rojões', 'Duas garrafas agitadas', 'Par de sprays', 'Tubos de ensaio', 'Foguetes de quermesse', 'Par de maçaricos', 'Auxiliar de oficina', 'Auxiliar de corrida', 'Auxiliar de avião', 'Auxiliar de estação', 'Par de cometinhas', 'Auxiliar proibido'],
    escudo: ['Bandeja de lanchonete', 'Tampa de bueiro', 'Pneu de trator', 'Para-choque de ônibus', 'Grade de churrasqueira', 'Porta de cofre', 'Armadura de museu', 'Escudo de gladiador', 'Casco de navio', 'Placa de meteoro', 'Campo teimoso', 'Parede de boleto'],
    gerador: ['Dínamo de bicicleta', 'Bateria de moto', 'Pilha de controle remoto', 'Gato no fio', 'Roda de hamster', 'Gerador de feira', 'Painel de telhado', 'Bateria de caminhão', 'Usina de chuveiro', 'Reator emprestado', 'Raio em lata', 'Tomada universal'],
    antena: ['Palha de aço', 'Antena de carro', 'Rádio de pilha', 'Corneta de fusca', 'Radioamador do vizinho', 'Torre de celular', 'Pipa com fio', 'Disco de pizza', 'Antena do bairro', 'Sinal da padaria', 'Ouvido de elefante', 'Wi-Fi do espaço'],
    ima: ['Ímã de pizzaria', 'Ímã de brinquedo', 'Ferradura de cavalo', 'Motor de liquidificador', 'Ímã de caixa de som', 'Guindaste de sucata', 'Ímã de ressonância', 'Bobina dupla', 'Ímã de usina', 'Atrator de bolso', 'Ímã de satélite', 'Ímã de cometa'],
    carga: ['Caixa de ovos', 'Mudança da vizinha', 'Sofá embrulhado', 'Geladeira de presente', 'Saco de cimento', 'Melancias soltas', 'Estátua de leão', 'Trator desmontado', 'Vaca assustada', 'Parque de diversões', 'Prédio pequeno', 'Encomenda errada'],
    cofre: ['Meia velha', 'Pote de margarina', 'Colchão recheado', 'Caixa de sapato', 'Gaveta com chave', 'Bolso falso', 'Porquinho blindado', 'Cofre de hotel', 'Malote', 'Baú de navio', 'Cofre de cassino', 'Conta na Suíça'],
    radar: ['Luneta de pirata', 'Periscópio', 'Tia na janela', 'Cachorro atento', 'Detector de metal', 'Radar de morcego', 'Pombo-correio', 'Câmera de portaria', 'Satélite do bairro', 'Previsão do tempo', 'Horóscopo', 'Quem avisa amigo é'],
    paraquedas: ['Saco de lixo', 'Capa de chuva', 'Bandeira de time', 'Lençol de casal', 'Tenda de feira', 'Cortina de banheiro', 'Lona de caminhão', 'Vela de barco', 'Paraquedas de brechó', 'Balão de festa', 'Paraquedas militar', 'Asa de seda'],
    enfeite: ['Galinha de borracha', 'Vaso de samambaia', 'Gnomo de jardim', 'Cacto de plástico', 'Antena com bolinha', 'Chapéu de festa', 'Boia de patinho', 'Abajur', 'Espelho retrovisor', 'Sino de vaca', 'Bandeira do bairro', 'Foto três por quatro'],
  };

  const FORMULAS = {
    bico: (i) => ({ massa: 0.15 * 1.2 ** i, arrasto: 1 - 0.05 * i, casco: 5 + 5 * i, base: 60 }),
    capsula: (i) => ({ massa: 1 * 1.15 ** i, casco: 30 * 1.5 ** i, controle: 1 + 0.12 * i, base: 90 }),
    tanque: (i) => ({ massa: 0.15 * 1.3 ** i, combustivel: 1 * 1.4 ** i, casco: 5 * 1.3 ** i, base: 50 }),
    motor: (i) => ({ massa: 0.4 * 1.6 ** i, empuxo: 60 * 2.5 ** i, queima: 0.07 * 1.12 ** i, base: 80 }),
    aleta: (i) => ({ massa: 0.05 * 1.3 ** i, controle: 0.25 + 0.12 * i, arrastoExtra: 0.02, base: 25 }),
    lateral: (i) => ({ massa: 0.1 * 1.5 ** i, empuxo: 30 * 2.5 ** i, base: 60 }),
    cofre: (i) => ({ massa: 0.2 * 1.3 ** i, moeda: 0.08 + 0.06 * i, base: 70 }),
    radar: (i) => ({ massa: 0.06 * 1.2 ** i, sorte: 0.1 + 0.1 * i, base: 65 }),
    paraquedas: (i) => ({ massa: 0.08 * 1.2 ** i, queda: 0.15 + 0.12 * i, base: 55 }),
    escudo: (i) => ({ massa: 0.1 * 1.25 ** i, casco: 15 * 1.5 ** i, reducao: 0.05 + 0.03 * i, base: 45 }),
    gerador: (i) => ({ massa: 0.08 * 1.2 ** i, regen: 0.05 * 1.45 ** i, recarga: 0.01 + 0.006 * i, base: 55 }),
    antena: (i) => ({ massa: 0.03 * 1.2 ** i, pagamento: 0.03 + 0.025 * i, base: 70 }),
    ima: (i) => ({ massa: 0.05 * 1.2 ** i, raio: 30 + 22 * i, base: 40 }),
    carga: (i) => ({ massa: 0.6 * 1.35 ** i, pagamento: 0.08 + 0.05 * i, base: 60 }),
    enfeite: (i) => ({ massa: 0.01, moeda: 0.01 + 0.01 * i, base: 15 }),
  };

  const PRECO_NIVEL = 3.4;
  const PRECO_TIPO = { tanque: 2.7 };
  const GRATIS = { bico: 1, capsula: 1, tanque: 1, motor: 1, lateral: 1 };

  RL.TIPOS = {
    bico: 'Bicos', capsula: 'Cápsulas', tanque: 'Tanques', motor: 'Motores', aleta: 'Aletas', lateral: 'Auxiliares',
    escudo: 'Escudos', gerador: 'Geradores', antena: 'Antenas', ima: 'Ímãs', carga: 'Cargas', cofre: 'Cofres', radar: 'Radares', paraquedas: 'Paraquedas', enfeite: 'Enfeites',
  };

  RL.PECAS = {};
  RL.PECAS_POR_TIPO = {};
  for (const tipo of Object.keys(NOMES)) {
    RL.PECAS_POR_TIPO[tipo] = [];
    NOMES[tipo].forEach((nome, i) => {
      const f = FORMULAS[tipo](i);
      const id = tipo + i;
      const portoes = LIBERAR_TIPO[tipo] || liberar, passoPreco = PRECO_TIPO[tipo] || PRECO_NIVEL;
      const peca = {
        id, tipo, nivel: i, nome, cor: CORES[(i * 3 + tipo.length) % CORES.length],
        preco: i === 0 && GRATIS[tipo] ? 0 : Math.round(f.base * passoPreco ** i),
        requerKm: portoes[i], ...f,
      };
      delete peca.base;
      RL.PECAS[id] = peca;
      RL.PECAS_POR_TIPO[tipo].push(peca);
    });
    /* ids a partir de 12 para não mexer nos jogos salvos */
    VARIANTES[tipo].forEach((nome, k) => {
      const t = k + 0.5;
      const f = FORMULAS[tipo](t);
      const id = tipo + (12 + k);
      const portoes = LIBERAR_TIPO[tipo] || liberar, passoPreco = PRECO_TIPO[tipo] || PRECO_NIVEL;
      const a = portoes[k], b = portoes[Math.min(k + 1, portoes.length - 1)];
      const peca = { id, tipo, nivel: 12 + k, nome, cor: CORES[(k * 5 + tipo.length) % CORES.length], preco: Math.round(f.base * passoPreco ** t), requerKm: a === 0 ? Math.max(1, Math.round(b / 2)) : Math.round(Math.sqrt(a * b)), ...f };
      delete peca.base;
      RL.PECAS[id] = peca;
      RL.PECAS_POR_TIPO[tipo].push(peca);
    });
    RL.PECAS_POR_TIPO[tipo].sort((x, y) => x.preco - y.preco);
  }

  /* Cada enfeite dá um bônus próprio. A ordem segue os ids: 0 a 11 são os principais, 12 a 23 os intermediários. */
  const BONUS_ENFEITE = [
    { queda: 0.25, bonus: 'Queda 25% mais longa' }, { sorte: 0.15, bonus: 'Eventos e caixas +15%' }, { moeda: 0.05, bonus: 'Moedas +5%' }, { controle: 0.15, bonus: 'Direção +0,15' },
    { raio: 42, bonus: 'Ímã pequeno embutido' }, { arrastoPct: 0.04, bonus: 'Resistência -4%' }, { pagamento: 0.06, bonus: 'Pagamento +6%' }, { casco: 30, bonus: 'Casco +30' },
    { recarga: 0.012, bonus: 'Turbo recarrega mais rápido' }, { moeda: 0.14, bonus: 'Moedas +14%' }, { reducao: 0.1, bonus: 'Dano -10%' }, { regen: 0.3, bonus: 'Conserta 0,3 por segundo' },
    { queda: 0.4, bonus: 'Queda 40% mais longa' }, { regen: 0.08, bonus: 'Conserta 0,08 por segundo' }, { sorte: 0.25, bonus: 'Eventos e caixas +25%' }, { casco: 15, bonus: 'Casco +15' },
    { pagamento: 0.03, bonus: 'Pagamento +3%' }, { moeda: 0.08, bonus: 'Moedas +8%' }, { queda: 0.6, bonus: 'Queda 60% mais longa' }, { empuxoPct: 0.03, bonus: 'Empuxo +3%' },
    { controle: 0.3, bonus: 'Direção +0,3' }, { raio: 72, bonus: 'Ímã médio embutido' }, { combPct: 0.04, bonus: 'Combustível +4%' }, { empuxoPct: 0.06, bonus: 'Empuxo +6%' },
  ];
  BONUS_ENFEITE.forEach((b, i) => {
    const q = RL.PECAS['enfeite' + i];
    delete q.moeda;
    Object.assign(q, b);
  });

  /* Pesquisas: 4 ramos, cerca de 150 níveis. */
  const pct = (por) => (n) => (n ? `+${Math.round(por * n * 100)}%` : '0%');
  const menos = (n) => (n ? `-${n * 3}%` : '0%');
  const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
  RL.RAMOS = { motores: 'Motores', estrutura: 'Estrutura', navegacao: 'Navegação', negocios: 'Negócios' };
  RL.PESQUISAS = [
    { id: 'empuxo', ramo: 'motores', nome: 'Empuxo', desc: 'Motores empurram mais.', niveis: 10, base: 60, fator: 2.05, por: 0.08, efeito: pct(0.08) },
    { id: 'combustivel', ramo: 'motores', nome: 'Tanques cheios até a boca', desc: 'Mais combustível em cada tanque.', niveis: 10, base: 50, fator: 2.05, por: 0.08, efeito: pct(0.08) },
    { id: 'turbo', ramo: 'motores', nome: 'Turbo', desc: 'Motores auxiliares empurram mais.', niveis: 10, base: 90, fator: 2, por: 0.1, efeito: pct(0.1) },
    { id: 'recargaTurbo', ramo: 'motores', nome: 'Recarga do turbo', desc: 'Turbo volta mais rápido.', niveis: 10, base: 70, fator: 2, por: 0.12, efeito: pct(0.12) },
    { id: 'estagios', ramo: 'motores', nome: 'Engenharia de estágios', desc: 'Mais estágios no foguete.', niveis: 3, base: 160, fator: 30, por: 1, efeito: (n) => plural(1 + n, 'estágio', 'estágios') },
    { id: 'empilhar', ramo: 'motores', nome: 'Tanques empilhados', desc: 'Mais tanques por estágio.', niveis: 3, base: 40, fator: 25, por: 1, efeito: (n) => plural(1 + n, 'tanque', 'tanques') },

    { id: 'peso', ramo: 'estrutura', nome: 'Liga mais leve', desc: 'Todas as peças pesam menos.', niveis: 10, base: 60, fator: 2.05, por: 0.03, efeito: menos },
    { id: 'arrasto', ramo: 'estrutura', nome: 'Encerar o foguete', desc: 'Menos resistência.', niveis: 10, base: 55, fator: 2.05, por: 0.03, efeito: menos },
    { id: 'casco', ramo: 'estrutura', nome: 'Casco reforçado', desc: 'Aguenta mais pancada.', niveis: 10, base: 45, fator: 2, por: 0.15, efeito: pct(0.15) },
    { id: 'reparo', ramo: 'estrutura', nome: 'Fita adesiva', desc: 'O casco se recupera devagar no voo.', niveis: 10, base: 80, fator: 2, por: 0.1, efeito: (n) => (n ? `${(n * 0.1).toFixed(1).replace('.', ',')} por segundo` : 'Nada') },
    { id: 'modulos', ramo: 'estrutura', nome: 'Espaço para módulos', desc: 'Encaixes para gerador, antena, ímã, carga, cofre, radar e paraquedas.', niveis: 3, base: 120, fator: 8, por: 1, efeito: (n) => (n ? plural(n, 'encaixe', 'encaixes') : 'Nenhum') },

    { id: 'controle', ramo: 'navegacao', nome: 'Direção', desc: 'O foguete vira mais rápido.', niveis: 10, base: 40, fator: 1.95, por: 0.1, efeito: pct(0.1) },
    { id: 'autopiloto', ramo: 'navegacao', requerLua: true, nome: 'Autopiloto', desc: 'Pilota sozinho. Desde o nível 1 desvia. No nível 5 pega moedas. No nível 10 liga o escudo.', niveis: 3, base: 500, fator: 20, por: 1, efeito: (n) => ['Sem', 'Segue reto', 'Desvia', 'Desvia e pega moedas'][n] },
    { id: 'dobra', ramo: 'navegacao', nome: 'Dobra teimosa', desc: 'Depois da Lua: passa direto por ela e multiplica a velocidade.', niveis: 10, base: 3000000, fator: 2.2, por: 1, requerLua: true, efeito: (n) => (n ? `Velocidade x${(2.6 ** n).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : 'Para na Lua') },
    { id: 'tempo', ramo: 'navegacao', nome: 'Aceleração do tempo', desc: 'Pula os trechos vazios da viagem.', niveis: 4, base: 700, fator: 9, por: 1, efeito: (n) => [1, 2, 5, 20, 100][n] + 'x' },
    { id: 'galoes', ramo: 'navegacao', nome: 'Galões no caminho', desc: 'Mais combustível aparece voando.', niveis: 10, base: 90, fator: 2, por: 0.1, efeito: pct(0.1) },
    { id: 'sorte', ramo: 'navegacao', nome: 'Sorte de capivara', desc: 'Eventos pagam melhor.', niveis: 10, base: 70, fator: 2, por: 0.12, efeito: pct(0.12) },

    { id: 'pagamento', ramo: 'negocios', nome: 'Patrocínio', desc: 'Cada km paga mais.', niveis: 10, base: 70, fator: 2.1, por: 0.12, efeito: pct(0.12) },
    { id: 'moeda', ramo: 'negocios', nome: 'Câmbio favorável', desc: 'Moedas valem mais.', niveis: 10, base: 50, fator: 2, por: 0.15, efeito: pct(0.15) },
    { id: 'ima', ramo: 'negocios', nome: 'Bolso magnético', desc: 'Pega moedas de mais longe.', niveis: 10, base: 40, fator: 1.9, por: 0.1, efeito: pct(0.1) },
    { id: 'seguro', ramo: 'negocios', nome: 'Seguro de foguete', desc: 'Paga um extra quando o casco quebra.', niveis: 10, base: 60, fator: 2, por: 0.08, efeito: pct(0.08) },
  ];
  /* Toda pesquisa tem 20 níveis. As de porcentagem andam a meio passo e custam a raiz; as estruturais liberam aos poucos. */
  const ESTRUTURAIS = {
    estagios: { fator: 1.71, efeito: (n) => { const k = 1 + Math.floor(n / 5); return `${k} ${k === 1 ? 'estágio' : 'estágios'}`; } },
    empilhar: { fator: 1.66, efeito: (n) => { const k = Math.min(3, 1 + Math.floor(n / 5)); return `${k} ${k === 1 ? 'tanque' : 'tanques'}`; } },
    modulos: { fator: 1.55, efeito: (n) => { const k = 1 + Math.floor(n / 3); return `${k} ${k === 1 ? 'encaixe' : 'encaixes'}`; } },
    autopiloto: { fator: 1.37, efeito: (n) => ['Sem', 'Desvia dos perigos', 'Desvia e pega moedas', 'Faz tudo, até ligar o escudo'][RL.nivelAutopiloto(n)] },
    tempo: { fator: 1.41, efeito: (n) => RL.NIVEIS_TEMPO[RL.indiceTempo(n)] + 'x' },
  };
  for (const q of RL.PESQUISAS) {
    const e = ESTRUTURAIS[q.id];
    if (e) {
      q.fator = e.fator;
      q.efeito = e.efeito;
    } else {
      q.por /= 2;
      q.fator = q.fator ** 0.68;
      /* a cada 5 níveis, um salto: os multiplicadores pagam x1,5; os outros ganham 2,5 níveis de graça */
      q.salta = true;
      q.multiplica = q.id === 'pagamento' || q.id === 'moeda';
      const original = q.efeito;
      q.efeito = q.multiplica
        ? (n) => {
          const v = (1 + q.por * n) * 1.5 ** Math.floor(n / 5);
          return n ? '×' + v.toFixed(2).replace('.', ',') : '×1';
        }
        : (n) => original((n + 2.5 * Math.floor(n / 5)) / 2);
    }
    q.niveis = 20;
  }
  RL.saltosPesquisa = (n) => Math.floor(n / 5);
  RL.nivelAutopiloto = (n) => (n >= 10 ? 3 : n >= 5 ? 2 : n >= 1 ? 1 : 0);
  RL.indiceTempo = (n) => Math.min(RL.NIVEIS_TEMPO.length - 1, Math.ceil(n / 3));
  RL.PESQUISA = Object.fromEntries(RL.PESQUISAS.map((p) => [p.id, p]));
  /* teto de 10x: a Lua continua levando minutos, e não segundos */
  RL.NIVEIS_TEMPO = [1, 2, 5, 10];

  /* Marcos reais do caminho. */
  RL.MARCOS = [
    { km: 1, nome: 'Acima da caixa d’água', fato: 'Os vizinhos pararam de rir. Alguns.', premio: 30 },
    { km: 2, nome: 'Primeiras nuvens', fato: 'As nuvens baixas ficam por volta de 2 km. São mais molhadas do que parecem.', premio: 60 },
    { km: 5, nome: 'Mais alto que os pombos', fato: 'Daqui para cima, nem pombo se arrisca. Ainda bem.', premio: 110 },
    { km: 8.8, nome: 'Topo do Everest', fato: 'O Everest tem 8,8 km. Você subiu sem casaco.', premio: 170 },
    { km: 12, nome: 'Altitude dos aviões', fato: 'Aviões comerciais voam entre 10 e 12 km. A aeromoça acenou.', premio: 240 },
    { km: 25, nome: 'Camada de ozônio', fato: 'O ozônio fica mais denso por volta de 25 km. Passe protetor.', premio: 420 },
    { km: 39, nome: 'Salto da estratosfera', fato: 'Em 2012, um paraquedista saltou de 39 km. A capivara achou exagero.', premio: 600 },
    { km: 50, nome: 'Estratosfera', fato: 'Acaba aqui a camada onde ficam os balões meteorológicos.', premio: 800 },
    { km: 80, nome: 'Onde os meteoros queimam', fato: 'A maioria das estrelas cadentes some por aqui. Pode fazer o pedido.', premio: 1200 },
    { km: 100, nome: 'Linha de Kármán', fato: 'A 100 km começa oficialmente o espaço. Sem placa nenhuma.', premio: 2000 },
    { km: 200, nome: 'Órbita baixa', fato: 'Muitos satélites passam por aqui. Nenhum dá seta.', premio: 3500 },
    { km: 408, nome: 'Estação Espacial', fato: 'A ISS orbita a cerca de 408 km. Ninguém abriu a porta.', premio: 6000 },
    { km: 1000, nome: 'Cinturão de Van Allen', fato: 'Por volta de 1.000 km começa a faixa de radiação da Terra. O pelo arrepiou.', premio: 12000 },
    { km: 2000, nome: 'Fim da órbita baixa', fato: 'Acima de 2.000 km já não é órbita baixa. O bairro ficou bem pequeno.', premio: 20000 },
    { km: 6371, nome: 'Um raio da Terra', fato: 'Do centro da Terra até a superfície são 6.371 km. Você já subiu tudo isso.', premio: 42000 },
    { km: 12742, nome: 'Uma Terra inteira', fato: 'Cabe uma Terra de 12.742 km entre você e o chão.', premio: 70000 },
    { km: 20200, nome: 'Satélites de GPS', fato: 'Os satélites de GPS ficam a 20.200 km. Agora eles sabem onde você está.', premio: 110000 },
    { km: 35786, nome: 'Órbita geoestacionária', fato: 'A 35.786 km, um satélite fica parado sobre o mesmo ponto da Terra.', premio: 180000 },
    { km: 40075, nome: 'Uma volta ao mundo', fato: 'A Terra tem 40.075 km de circunferência. Dava para ter dado a volta.', premio: 220000 },
    { km: 100000, nome: 'Cem mil quilômetros', fato: 'O chefe parou de ligar. Sinal fraco, ele diz.', premio: 420000 },
    { km: 192200, nome: 'Metade do caminho', fato: 'Metade exata até a Lua. Voltar agora daria o mesmo trabalho.', premio: 750000 },
    { km: 256000, nome: 'Dois terços', fato: 'Ela já parece uma bola de verdade, e não um desenho no céu.', premio: 1000000 },
    { km: 326000, nome: 'A Lua puxa mais', fato: 'Por volta de 326.000 km, a gravidade da Lua vence a da Terra.', premio: 1400000 },
    { km: 384400, nome: 'Lua', fato: 'Distância média de 384.400 km. Sem motivo nenhum, você chegou.', premio: 3000000 },
    { km: 54600000, nome: 'Marte', fato: 'No ponto mais perto, Marte fica a 54,6 milhões de km. Ninguém em casa.', premio: 8000000, planeta: 'marte' },
    { km: 300000000, nome: 'Cinturão de asteroides', fato: 'Fica entre Marte e Júpiter. Dá para passar sem bater, mas tente.', premio: 20000000 },
    { km: 588000000, nome: 'Júpiter', fato: 'A 588 milhões de km, no ponto mais perto. É bem maior do que parecia.', premio: 60000000, planeta: 'jupiter' },
    { km: 1200000000, nome: 'Saturno', fato: 'A cerca de 1,2 bilhão de km. Os anéis são quase só gelo.', premio: 150000000, planeta: 'saturno' },
    { km: 2600000000, nome: 'Urano', fato: 'A cerca de 2,6 bilhões de km, girando de lado. Ninguém explica.', premio: 400000000, planeta: 'urano' },
    { km: 4300000000, nome: 'Netuno', fato: 'A cerca de 4,3 bilhões de km. O chefe não liga mais.', premio: 900000000, planeta: 'netuno' },
    { km: 5000000000, nome: 'Plutão', fato: 'A uns 5 bilhões de km. Ele não é mais planeta, e você também não é mais funcionária.', premio: 2000000000, planeta: 'plutao' },
  ];

  /* Do espaço em diante o prêmio pesa menos: é um empurrão, não um salto de vários voos. */
  for (const m of RL.MARCOS) if (m.km >= 100) m.premio = Math.round(m.premio * 0.4 / 100) * 100;

  /* Velocidades reais para comparar: cada uma ultrapassada vira um pequeno prêmio de orgulho. */
  RL.VELOCIDADES = [
    { kms: 0.028, nome: 'Carro na estrada' },
    { kms: 0.1, nome: 'Carro de Fórmula 1' },
    { kms: 0.25, nome: 'Avião comercial' },
    { kms: 0.343, nome: 'Velocidade do som', som: true },
    { kms: 1, nome: 'Avião mais rápido do mundo' },
    { kms: 7.66, nome: 'Estação Espacial' },
    { kms: 11.2, nome: 'Velocidade de escape da Terra' },
    { kms: 17, nome: 'Sonda Voyager 1' },
    { kms: 29.8, nome: 'A Terra em volta do Sol' },
    { kms: 72, nome: 'Meteoro mais rápido' },
    { kms: 192, nome: 'Sonda solar Parker' },
    { kms: 300000, nome: 'A luz, e a física pediu demissão' },
  ];

  /* Trechos com regra própria. É o que faz cada parte da subida ser um desafio diferente. */
  RL.ZONAS = [
    { id: 'vento', de: 2, ate: 4.5, nome: 'Vento cruzado', texto: 'As rajadas empurram o foguete de lado. Corrija com A e D.' },
    { id: 'tempestade', de: 4.5, ate: 10, nome: 'Tempestade', texto: 'Onde a coluna amarela acender, cai um raio. Saia de baixo.' },
    { id: 'maxq', de: 10, ate: 24, nome: 'Pressão máxima', texto: 'O ar aperta mais aqui. Com o nariz torto, ele arranca o casco.' },
    { id: 'radiacao', de: 1000, ate: 6371, nome: 'Cinturão de radiação', texto: 'Cada quilômetro gasta casco. O escudo segura e o gerador conserta.' },
    { id: 'muralha', de: 34000, ate: 37000, nome: 'Muralha de satélites', texto: 'Fileiras inteiras, com uma brecha em cada uma. Ache a brecha.' },
    { id: 'puxa', de: 326000, ate: 384400, nome: 'A Lua está puxando', texto: 'Daqui em diante ela te leva. Guarde a calma para o pouso.' },
  ];
  RL.zonaEm = (h) => RL.ZONAS.find((z) => h >= z.de && h < z.ate) || null;
  /* Nos trechos difíceis não dá para acelerar o tempo: o desafio tem de ser atravessado. */
  RL.travaTempo = (h) => h < 100 || (h < RL.KM_LUA && ['radiacao', 'muralha', 'puxa'].includes((RL.zonaEm(h) || {}).id));

  /* A viagem contada em capítulos: é a régua de progresso que o jogador vê o tempo todo. */
  RL.CAPITULOS = [
    { ate: 2, nome: 'O quintal', meta: 'Chegar às primeiras nuvens.' },
    { ate: 12, nome: 'Vento e raio', meta: 'Atravessar a tempestade até a altitude dos aviões.' },
    { ate: 39, nome: 'Pressão máxima', meta: 'Sair do ar pesado com o nariz reto.' },
    { ate: 100, nome: 'O último azul', meta: 'Cruzar a Linha de Kármán. Lá começa o espaço.' },
    { ate: 1000, nome: 'O lixo de todo mundo', meta: 'Passar pelo ferro-velho em órbita.' },
    { ate: 6371, nome: 'O cinturão', meta: 'Sobreviver à radiação. Leve escudo.' },
    { ate: 40075, nome: 'A muralha', meta: 'Achar as brechas entre os satélites.' },
    { ate: 192200, nome: 'O vazio', meta: 'Chegar à metade do caminho. Sem desistir.' },
    { ate: 326000, nome: 'Sem volta', meta: 'Chegar aonde a Lua puxa mais que a Terra.' },
    { ate: 384400, nome: 'A chegada', meta: 'Pousar na Lua. De preferência, inteira.' },
    { ate: Infinity, nome: 'Filial', meta: 'Abrir a filial. Ou fugir para Plutão.' },
  ];
  RL.capituloDe = (km) => {
    const i = RL.CAPITULOS.findIndex((c) => km < c.ate);
    const k = i < 0 ? RL.CAPITULOS.length - 1 : i;
    return { i: k, ...RL.CAPITULOS[k], de: k ? RL.CAPITULOS[k - 1].ate : 0 };
  };

  /* Tamanho do foguete em metros (1 unidade do desenho = 5 cm) contra coisas conhecidas. */
  RL.TAMANHOS = [
    { m: 9, nome: 'um poste' }, { m: 12, nome: 'um dirigível de propaganda' }, { m: 15, nome: 'uma caixa d’água' }, { m: 25, nome: 'a igreja do bairro' },
    { m: 30, nome: 'um prédio de dez andares' }, { m: 38, nome: 'uma estátua famosa' }, { m: 60, nome: 'um avião de carreira' }, { m: 100, nome: 'um foguete de verdade' },
  ];
  RL.tamanhoFoguete = (unidades) => {
    const m = Math.round(unidades * 0.05);
    const q = [...RL.TAMANHOS].reverse().find((x) => m >= x.m);
    return { m, texto: q ? `Mais alto que ${q.nome}` : 'Menor que um poste' };
  };

  /* Nomes de foguete que alguém reconhece. */
  RL.NOMES_SECRETOS = {
    marmita: 'Marmita? Ela se mexeu de novo.', chefe: 'Botou meu cargo no foguete. Não vai ter aumento.', tatu: 'Botou meu nome no foguete. Se bater, a multa é sua.',
    capivara: 'Criativo. Vai chamar o próximo de Foguete?', lua: 'Chamou o foguete de Lua e vai para a Lua. Confuso.', rh: 'O RH já sabe.',
  };

  /* Faixas de cenário, por altitude. */
  RL.FAIXAS = [
    { id: 'bairro', nome: 'Bairro', de: 0 },
    { id: 'ceu', nome: 'Céu', de: 2 },
    { id: 'alto', nome: 'Alto da atmosfera', de: 12 },
    { id: 'borda', nome: 'Borda do espaço', de: 100 },
    { id: 'orbita', nome: 'Órbitas', de: 2000 },
    { id: 'vazio', nome: 'O vazio', de: 40000 },
    { id: 'lua', nome: 'Perto da Lua', de: 326000 },
    { id: 'alem', nome: 'Além da Lua', de: 420000 },
  ];

  /* Eventos: voltam o tempo para 1x e mudam o que aparece. */
  RL.EVENTOS = [
    { id: 'revoada', de: 0, ate: 2, nome: 'Revoada!', texto: 'Alguém alimentou os pombos. Passam por baixo e deixam moedas.', dur: 12, tipo: 'cenario', obj: 'passaro' },
    { id: 'trafego', de: 1, ate: 3, nome: 'Tráfego aéreo', texto: 'Ninguém te deu autorização para decolar. Acene.', dur: 12, tipo: 'cenario', obj: 'aviao' },
    { id: 'lixo', de: 3, ate: 5, nome: 'Nuvem de lixo espacial', texto: 'Tem até uma chave de fenda de astronauta aqui.', dur: 14, tipo: 'perigo', obj: 'lixo' },
    { id: 'meteoros', de: 3, ate: 8, nome: 'Chuva de meteoros', texto: 'De longe é bonito.', dur: 15, tipo: 'perigo', obj: 'meteoro' },
    { id: 'moedas', de: 0, ate: 8, nome: 'Chuva de moedas', texto: 'Ninguém sabe de onde vem. Ninguém pergunta.', dur: 12, tipo: 'moedas' },
    { id: 'refri', de: 3, ate: 8, nome: 'Uma máquina de refrigerante', texto: 'Está flutuando. Está ligada. Encoste nela.', dur: 14, tipo: 'absurdo', obj: 'refri' },
    { id: 'sofa', de: 4, ate: 8, nome: 'Um sofá', texto: 'Tem moedas entre as almofadas. Sempre tem.', dur: 14, tipo: 'absurdo', obj: 'sofa' },
    { id: 'pato', de: 5, ate: 8, nome: 'Um pato gigante', texto: 'Ele te olha. Não quer conversa. Encoste nele.', dur: 14, tipo: 'absurdo', obj: 'pato' },
  ];

  /* Os f_ usam as figuras pintadas do jogo. */
  RL.ADESIVOS = ['nenhum', 'estrela', 'caveira', 'raio', 'coracao', 'chama', 'olho', 'alvo', 'banana', 'numero7', 'lua', 'capivara',
    'f_tatu', 'f_cab_feliz', 'f_cab_susto', 'f_cab_triste', 'f_passaro', 'f_enfeite0', 'f_enfeite2', 'f_enfeite3', 'f_enfeite1', 'f_moeda', 'f_galao', 'f_kit', 'f_caixa', 'f_refri', 'f_sofa', 'f_balao', 'f_aviao', 'f_satelite', 'f_meteoro', 'f_lixo', 'f_ima', 'f_bico0'];
  RL.precoAdesivo = (id) => Math.round(90 * 1.24 ** RL.ADESIVOS.indexOf(id));
  RL.PADROES = ['liso', 'listras', 'faixa', 'bolinhas', 'xadrez', 'chamas', 'dentes', 'remendos', 'diagonal', 'ziguezague', 'estrelas', 'escamas', 'raios', 'nuvens', 'caveiras'];
  RL.precoPadrao = (id) => Math.round(120 * 1.9 ** RL.PADROES.indexOf(id));
  RL.RASTROS = [
    { id: 'fogo', nome: 'Fogo' }, { id: 'fumaca', nome: 'Fumaça' }, { id: 'arcoiris', nome: 'Arco-íris' },
    { id: 'bolhas', nome: 'Bolhas' }, { id: 'estrelas', nome: 'Estrelas' }, { id: 'confete', nome: 'Confete' },
  ];
  /* Marcas inventadas que patrocinam o voo. */
  RL.MARCAS = [
    { id: 'seuze', nome: 'Padaria do Seu Zé', curto: 'Seu Zé', slogan: 'Pão de ontem, preço de hoje.', cor: '#E8C46A', tinta: '#6B3A1C', icone: 'pao' },
    { id: 'duasrodas', nome: 'Borracharia Duas Rodas', curto: 'Duas Rodas', slogan: 'Furou? Problema seu.', cor: '#3A3A3A', tinta: '#F0CF62', icone: 'pneu' },
    { id: 'mordida', nome: 'Pet Shop Mordida', curto: 'Mordida', slogan: 'Seu cão volta. Quase sempre.', cor: '#E58BA3', tinta: '#5A1E30', icone: 'osso' },
    { id: 'polosul', nome: 'Sorveteria Polo Sul', curto: 'Polo Sul', slogan: 'Derrete antes de chegar.', cor: '#BFE3E6', tinta: '#2F4A66', icone: 'sorvete' },
    { id: 'devagar', nome: 'Auto Escola Devagar', curto: 'Devagar', slogan: 'Aprovado em só doze anos.', cor: '#F0CF62', tinta: '#33281F', icone: 'cone' },
    { id: 'sossego', nome: 'Funerária Sossego', curto: 'Sossego', slogan: 'Ninguém reclamou até hoje.', cor: '#2F2C3F', tinta: '#EEE9D7', icone: 'flor' },
    { id: 'betofm', nome: 'Rádio Tio Beto FM', curto: 'Tio Beto FM', slogan: 'Só toca aquela mesma.', cor: '#C8513F', tinta: '#FFF8DC', icone: 'radio' },
    { id: 'lento', nome: 'Lava-Rápido Lento', curto: 'Lento', slogan: 'Volte amanhã. Ou depois.', cor: '#5E93A8', tinta: '#FFFDF2', icone: 'gota' },
    { id: 'sofa', nome: 'Academia Sofá', curto: 'Acad. Sofá', slogan: 'Resultado em nenhum dia.', cor: '#8E6AA8', tinta: '#FFFDF2', icone: 'halter' },
    { id: 'quemsabe', nome: 'Consórcio Quem Sabe', curto: 'Quem Sabe', slogan: 'Contemplado em algum momento.', cor: '#7A9B4E', tinta: '#FFFDF2', icone: 'duvida' },
    { id: 'gasosa', nome: 'Gasosa Morna', curto: 'Gasosa Morna', slogan: 'Sempre em temperatura ambiente.', cor: '#D9774A', tinta: '#FFF8DC', icone: 'garrafa' },
    { id: 'asvezes', nome: 'Internet Às Vezes', curto: 'Às Vezes', slogan: 'Conecta quando dá.', cor: '#4F6F9E', tinta: '#FFFDF2', icone: 'sinal' },
    { id: 'deusmelivre', nome: 'Seguros Deus Me Livre', curto: 'Deus Me Livre', slogan: 'Cobre tudo, menos isso.', cor: '#F4F1E4', tinta: '#8A2E26', icone: 'escudo' },
    { id: 'bolacha', nome: 'Biscoito ou Bolacha', curto: 'Biscoito?', slogan: 'Sem comentários.', cor: '#C9A26C', tinta: '#4A2A14', icone: 'biscoito' },
  ];
  RL.MARCA = Object.fromEntries(RL.MARCAS.map((m) => [m.id, m]));

  /* Guarda-roupa do piloto: comprado com moedas. */
  RL.ROUPAS = {
    chapeu: [
      { id: 'nenhum', nome: 'Nada', preco: 0 }, { id: 'bone', nome: 'Boné', preco: 80 }, { id: 'palha', nome: 'Chapéu de palha', preco: 220 },
      { id: 'touca', nome: 'Touca de banho', preco: 500 }, { id: 'gorro', nome: 'Gorro', preco: 1200 }, { id: 'cartola', nome: 'Cartola', preco: 4000 },
      { id: 'viking', nome: 'Capacete viking', preco: 15000 }, { id: 'sombrero', nome: 'Sombrero', preco: 50000 }, { id: 'coroa', nome: 'Coroa de verdade', preco: 200000 },
      { id: 'cone', nome: 'Cone de obra', preco: 150 }, { id: 'caixa', nome: 'Caixa de papelão', preco: 350 }, { id: 'fone', nome: 'Fone de ouvido', preco: 800 },
      { id: 'tiara', nome: 'Tiara de antena', preco: 1800 }, { id: 'abacaxi', nome: 'Abacaxi', preco: 3000 }, { id: 'chef', nome: 'Chapéu de chef', preco: 7000 }, { id: 'cangaceiro', nome: 'Chapéu de cangaceiro', preco: 22000 },
    ],
    oculos: [
      { id: 'nenhum', nome: 'Nada', preco: 0 }, { id: 'redondo', nome: 'Redondo', preco: 120 }, { id: 'escuro', nome: 'Escuro', preco: 600 },
      { id: 'tapa', nome: 'Tapa-olho', preco: 2500 }, { id: 'tres', nome: 'Óculos 3D', preco: 9000 }, { id: 'aviador', nome: 'Aviador', preco: 40000 },
      { id: 'nerd', nome: 'Armação grossa', preco: 200 }, { id: 'coracao', nome: 'Coração', preco: 1500 }, { id: 'estrela', nome: 'Estrela', preco: 4500 }, { id: 'mergulho', nome: 'Máscara de mergulho', preco: 18000 },
    ],
    pescoco: [
      { id: 'nenhum', nome: 'Nada', preco: 0 }, { id: 'lenco', nome: 'Lenço', preco: 100 }, { id: 'gravata', nome: 'Gravata', preco: 700 },
      { id: 'capa', nome: 'Capa', preco: 5000 }, { id: 'medalha', nome: 'Medalha inventada', preco: 30000 },
      { id: 'cachecol', nome: 'Cachecol', preco: 300 }, { id: 'colar', nome: 'Colar de pérolas', preco: 2000 }, { id: 'boia', nome: 'Boia de piscina', preco: 12000 },
    ],
    pelo: [
      { id: 'castanho', nome: 'Castanho', preco: 0, cores: ['#8F6340', '#74492C', '#BE9468', '#A9794E'] },
      { id: 'mel', nome: 'Mel', preco: 300, cores: ['#B98A4E', '#94693A', '#E0BE8C', '#CDA36A'] },
      { id: 'cinza', nome: 'Cinza', preco: 900, cores: ['#7E7F7C', '#5F605E', '#B9BAB5', '#9A9B97'] },
      { id: 'azul', nome: 'Azul sem explicação', preco: 6000, cores: ['#5E86A8', '#456A8A', '#A9C8DC', '#7EA3C0'] },
      { id: 'rosa', nome: 'Rosa de nascença', preco: 25000, cores: ['#C98A9A', '#A96C7C', '#EAC0CA', '#D9A3B0'] },
      { id: 'ruivo', nome: 'Ruivo', preco: 1500 }, { id: 'preto', nome: 'Preto', preco: 3000 }, { id: 'branco', nome: 'Branco', preco: 4500 }, { id: 'verde', nome: 'Verde de limo', preco: 9000 }, { id: 'lilas', nome: 'Lilás', preco: 14000 },
    ],
    traje: [
      { id: 'creme', nome: 'Creme e vermelho', preco: 0, cores: ['#EEE9D7', '#C8513F'] }, { id: 'branco', nome: 'Branco e azul', preco: 200, cores: ['#F7F4EA', '#4F7FA8'] },
      { id: 'laranja', nome: 'Laranja de resgate', preco: 600, cores: ['#E08A3C', '#F7F4EA'] }, { id: 'verde', nome: 'Verde militar', preco: 1500, cores: ['#6F7F4E', '#E0B23C'] },
      { id: 'preto', nome: 'Preto chique', preco: 4000, cores: ['#2F2C3F', '#E0B23C'] }, { id: 'rosa', nome: 'Rosa de festa', preco: 9000, cores: ['#E58BA3', '#F7F4EA'] },
      { id: 'dourado', nome: 'Dourado exagerado', preco: 60000, cores: ['#D8AC3C', '#7E5A1E'] },
    ],
  };
  RL.ROUPA = {};
  for (const tipo of Object.keys(RL.ROUPAS)) for (const r of RL.ROUPAS[tipo]) RL.ROUPA[tipo + ':' + r.id] = r;

  /* Esquemas de cor prontos: corpo, acento e faixa. */
  RL.ESQUEMAS = [
    { nome: 'Bombeiro', corpo: '#C8413C', acento: '#F4F1E4', faixa: '#E0B23C' },
    { nome: 'Céu limpo', corpo: '#F4F1E4', acento: '#4F7FA8', faixa: '#BFE3E6' },
    { nome: 'Sucata', corpo: '#8E8A86', acento: '#A9774E', faixa: '#5E6468' },
    { nome: 'Melancia', corpo: '#6F9149', acento: '#C8413C', faixa: '#F4F1E4' },
    { nome: 'Madrugada', corpo: '#2F2C3F', acento: '#8E6AA8', faixa: '#F0CF62' },
    { nome: 'Chiclete', corpo: '#E58BA3', acento: '#5EA8C4', faixa: '#F7F4EA' },
    { nome: 'Exército', corpo: '#5F7248', acento: '#3A3A3A', faixa: '#C9A26C' },
    { nome: 'Rico', corpo: '#D8AC3C', acento: '#F7F4EA', faixa: '#7E5A1E' },
    { nome: 'Gibi', corpo: '#F0CF62', acento: '#E8604C', faixa: '#23201C' },
    { nome: 'Oceano', corpo: '#35708C', acento: '#BFE9E2', faixa: '#F7F4EA' },
    { nome: 'Corrida', corpo: '#F7F4EA', acento: '#C8413C', faixa: '#23201C' },
    { nome: 'Pôr do sol', corpo: '#E08A3C', acento: '#7E2A52', faixa: '#F0CF62' },
    { nome: 'Lavanda', corpo: '#AE97DB', acento: '#F7CFE3', faixa: '#603F8C' },
    { nome: 'Floresta', corpo: '#2B7049', acento: '#BBD06A', faixa: '#7A3E18' },
    { nome: 'Noite polar', corpo: '#1B2F58', acento: '#7DC2DA', faixa: '#F7F4EA' },
    { nome: 'Cimento', corpo: '#9A9486', acento: '#3F3C36', faixa: '#E0B23C' },
  ];

  /* 60 cores, organizadas por matiz, do claro ao escuro. */
  RL.PALETA = [
    '#FFFFFF', '#E7E2D0', '#BDB7A6', '#9A9486', '#6B675D', '#3F3C36', '#23201C', '#000000',
    '#FBD5CC', '#EE9A8A', '#E8604C', '#C8513F', '#A3362C', '#72221C',
    '#FBDDBF', '#F2B27A', '#E08A3C', '#D9774A', '#B05A24', '#7A3E18',
    '#FBEFB4', '#F0CF62', '#E0B23C', '#C69520', '#94701A',
    '#E0E9A8', '#BBD06A', '#7A9B4E', '#567336', '#364A22',
    '#BFE6C8', '#7CC795', '#3F9E68', '#2B7049',
    '#BFE9E2', '#6FC6BB', '#3F8F87', '#27625D',
    '#CFEDF5', '#BFE3E6', '#7DC2DA', '#5E93A8', '#35708C',
    '#C8D8F2', '#8FAEDD', '#4F6F9E', '#2D4E86', '#1B2F58',
    '#D9CFF0', '#AE97DB', '#8E6AA8', '#603F8C', '#3C2660',
    '#F7CFE3', '#E58BA3', '#D65F92', '#B8455F', '#7E2A52',
    '#A9774E', '#7E5A3A',
  ];
})(typeof globalThis !== 'undefined' ? globalThis : this);
