# Transcrição do conselho: Rumo à Lua (20261102-1640)

## Pergunta original
O que pode ser melhorado em proporção, estilo, animações, progressão, economia e diálogos?

## Pergunta enquadrada
Jogo de navegador destinado à Steam, com os dados medidos da simulação, das figuras, das falas e das animações. Cada conselheiro recebeu esses dados; a Pessoa de fora recebeu só o mínimo e as fotos.

## Respostas
# Respostas anônimas do conselho

## Resposta A
Segunda de manhã: Eduardo joga 20 minutos, com som ligado, e anota o que irrita. Ninguém jogou nem ouviu o jogo. Depois, nesta ordem, tudo sem gastar crédito:

1. Bugs visíveis (meio dia): capacete desalinhado, personagem sob o HUD, pombos na frente do cesto, tatu sem capacete de obra. Entrega foto antes/depois.
2. Proporção (1 dia): tabela única de tamanhos. Dirigível limitado a 420 px, pombo sobe para uns 70. Foguete com largura mínima na tela e oficina com zoom que preencha o painel. É o que Eduardo mais vai notar.
3. Economia (1 a 2 dias): colocar metas como asserts em testes/economia.js: Lua perto do voo 50, não 80. Nenhum voo acima de 12 minutos. Velocidade máxima só no fim, não no voo 45. No máximo 4 compras por voo. Sem o salto de 7x entre os voos 35 e 40.
4. Corte (meio dia): 360 peças viram só as 77 com desenho próprio. 21 pesquisas x 20 níveis viram 8 x 10. Recolorida parece enrolação, e cortar é mais barato que desenhar. O corte muda a curva, então rodo a simulação de novo depois dele.
5. Diálogos (1 dia): apagar as falas mortas de colisão. Escrever 60 falas por distância e fracasso, para cobrir o voo longo. Eduardo aprova numa folha só, é texto de graça.
6. Animação (1 dia): trocar 28 frequências por 4 ritmos e rodar criaturas a 12 fps em passos, para parecer desenho. Não dá para inventar batida de asa sem arte nova, então a fatia esticada fica por ora.

Só depois:
7. Arte: confirmar por escrito os direitos comerciais antes de comprar plano. Com a lista fechada, gerar tudo de uma vez: fumaça e chama em sprite, asas em 2 quadros, mais rostos, módulos finais diferentes entre si.

O que sai primeiro: itens 1 e 2, porque Eduardo aprova olhando. Os itens 3 a 6 são uma versão jogável até a Lua em cerca de uma semana. Essa versão vai para 3 testadores externos. Planetas até Plutão ficam congelados até alguém terminar a Lua.

## Resposta B
Primeira impressão: a capivara com emprego me ganha em dois segundos. A abertura é o melhor momento do jogo. Em seguida a oficina me joga 8 abas, 16 categorias e 7 estatísticas antes do primeiro voo. "Empuxo", "Casco", "Controle", "Pagamento +0%" e "Módulo: 1 vaga" não dizem nada a quem nunca jogou. Mostre só LANÇAR e Motores, e libere o resto voando.

Proporção: no começo o foguete é um personagem. No fim vira um palito de 40 peças, com a capivara, o cone e os enfeites do tamanho de pixels. O jogo apaga o que me fez comprar. O foguete final precisa de câmera ou recorte que mantenha a cara dela grande. O pássaro e o balão cobrindo o painel de queda também confundem: a capivara de paraquedas fica atrás da régua, no canto, justo quando é a piada.

Estilo: aquarela com traço grosso é a identidade e funciona. Painéis escuros de HUD e a fonte pixelada dos números parecem de outro jogo.

Animação: só vi fotos, mas "Caindo!" com "Pular a queda" visível sugere que a própria queda é tediosa. Se eu quero pular, algo falhou.

Progressão: a régua "Terra a Lua" é ótima. "Bom. Faltam só uns milhares" é a melhor promessa do jogo. Mas 80 voos e 10 horas não aparecem em nenhuma tela, e voos de 45 minutos não cabem na cabeça de quem veio de um voo de 25 segundos. Isso é refund garantido no Steam ou tela parada com autopiloto. Corte para no máximo 5 minutos.

Economia: "+258.966" e "261.072" na tela, mas 1.841 na oficina e prêmio de 1.000.000: os números perdem peso. "Comprar Lata de leite e lançar · 101" é o melhor botão do jogo, mantenha. Já "+4% → +8%, Salto no nível 5" é planilha.

Diálogo: é o maior trunfo, e curto. A marmita é perfeita. Mas é só português: confirme o idioma da página do Steam antes de tudo, porque piada não traduz sozinha. O balão fica num canto enquanto olho moedas no centro, ou seja, leio ou jogo. Pause o perigo nas falas boas ou encurte.

## Resposta C
Falha fatal: progressão. A velocidade trava em 180 km/s no voo 45. Os últimos 35 voos, quase metade do jogo, só compram tanque para um voo mais longo. Pior: a esse teto, Marte no ponto mais próximo leva 3,5 dias e Plutão mais de um ano. A promessa "até Plutão" é aritmeticamente impossível sem dobra ou salto, e isso precisa ser resolvido antes de qualquer arte.

Voo. Sem colisão com pássaro, avião e balão, o que pode dar errado em 45 minutos? Se só restar pegar moeda, o voo final é uma espera. O simulador também não prova nada: mede um robô, não o tédio de um humano. Ninguém jogou até o fim, então "10,3 horas" é só um chute.

Economia. De 6 a 17 compras por voo, mais o "comprar X e lançar", não é decisão, é o jogo clicando sozinho. O foguete final com 7 módulos idênticos mostra que existe uma resposta ótima e que os 360 itens são decoração. Corte drasticamente: 21 pesquisas com 20 níveis, banco e contratos parecem volume, não profundidade.

Proporção. O protagonista é o foguete, e ele vira um fiozinho na oficina e no voo. Num jogo de montar, isso é erro central. Abandone a escala realista: alargue a pilha e limite o recuo da câmera.

Estilo. 283 peças são recolorações, e o comprador da Steam percebe na segunda aba. Melhor 40 peças distintas do que 360. Com 1,1 crédito não há arte para mais nada. E vender com direitos comerciais não confirmados pode derrubar o projeto inteiro: confirme isso primeiro.

Animação. Senos suaves a 60 fps deixam tudo flutuando igual e brigam com o cartoon. Use poses seguradas, em 12 fps, e corrija o capacete e o tatu sem capacete.

Diálogos. As falas são boas, mas todas têm a mesma piada de firma. São 16 marcos em 45 minutos, com longos silêncios depois de horas de repetição. O humor vai cansar antes da Lua.

Som. Som nunca ouvido é som inexistente.

## Resposta D
O maior ativo subavaliado é a capivara que devia estar no trabalho. "Ela tem um emprego" é um gancho de loja, e hoje é só uma piada de intro. Vale transformar isso na espinha do jogo.

Diálogos (maior retorno, e custa zero crédito). Faça do chefe uma trama: mensagens que evoluem, advertência, RH, demissão por abandono de posto em órbita, oferta de promoção ao chegar na Lua. O voo de 45 min vira programa de rádio, com rádio da firma, ouvintes, as 14 marcas falsas patrocinando e o tatu narrando. As falas de colisão mortas viram quase-acidentes e comentários. Isso gera clipe de streamer.

Progressão. Velocidade travada do voo 45 ao 80 é a maior oportunidade escondida: são 35 voos pedindo um verbo novo, como estilingue gravitacional, carona em cometa ou modo cruzeiro. O salto de 2.481 para 18.798 km (voos 35 a 40) deveria ser um evento encenado, a "virada" do jogo. Steam devolve dinheiro até 2 horas de jogo, então a primeira grande surpresa precisa cair antes disso. A demo termina nela, pronta para a Next Fest.

Proporção e estilo. O foguete é o troféu, e hoje é um fio. Deixe-o largo, absurdo, uma gambiarra visível: sofá amarrado, máquina de refrigerante como módulo. Oficina e resultado geram um cartão-postal aquarelado compartilhável do foguete de cada jogador, marketing gratuito. Menos peças que mudam a silhueta valem mais que 360 recoloridas.

Animação. Deadpan combina com pouco quadro. Personagens a 8-12 fps com poses seguradas ficam mais autorais do que seno suave, e isso é só código sobre a arte existente.

Economia. Troque o holerite genérico: resultado como relatório de despesas à firma, empréstimo do banco como piada recorrente. Compre menos vezes, compras maiores e mais comemoradas.

Horizonte. Plutão é conteúdo pós-lançamento pronto: DLC gratuita por planeta mantém a página viva. Ângulo extra: capivara viaja bem fora do Brasil, então localize em inglês desde já.

## Resposta E
A pergunta está errada. "O que melhorar" supõe que o jogo já está de pé, e ninguém jogou até o fim nem ouviu o som. O problema real é outro: fazer alguém pagar para sentir "uma capivara com emprego chegou à Lua, ridiculamente". Tudo que não serve a isso é peso.

Progressão (a raiz). São 10,3 horas para repetir um gesto. A velocidade trava no voo 45, então 35 voos só esperam mais tempo. Um voo de 45 minutos com 16 falas é tela de descanso. Meta: Lua em 25 a 30 voos, 3 a 4 horas, voo máximo de 6 a 8 minutos. A distância real fica no número; o tempo não precisa ser proporcional a ela. Planetas só se a Lua provar que diverte.

Economia. De 6 a 17 compras por voo, com botão de um clique, não é decisão. O foguete final com 7 módulos iguais prova que existe uma resposta ótima. Corte para 5 ou 6 linhas com troca real e 1 ou 2 compras que mudem o voo seguinte. Banco, contratos e 21 pesquisas saem até alguém sentir falta.

Proporção. Faltam regras, não ajustes de pixel. O foguete é o protagonista e a recompensa visível: altura fixa na tela, com o mundo diminuindo em volta. Se a compra não aparece, ela não existe. Na oficina, ele precisa encher a tela.

Estilo. 360 peças com 77 desenhos é inflação; assuma 77 ou menos, cada uma distinta. Antes de gerar mais arte, confirme os direitos comerciais: sem isso, não há produto na Steam.

Animações. Seno a 60 fps denuncia o código, e é justamente isso que Eduardo rejeita. Com 1,1 de crédito, use poses em 12 fps só para capivara, tatu, paraquedas e fumaça. O resto pode ficar quase parado, como piada seca.

Diálogos. É o maior diferencial, mas são frases soltas. Dê um arco: o emprego, o chefe, a marmita, com desfecho na Lua. Apague as falas mortas.

Primeiro passo: três pessoas jogam 30 minutos com som, e você anota onde param.


## Revisões e mapa do anonimato
# Mapa do anonimato
A = Executor | B = Pessoa de fora | C = Contrário | D = Expansionista | E = Primeiros princípios
(Os textos das respostas estão em conselho-respostas-anonimas.md.)

# Revisões

## Revisor 1 (foco geral)
Mais forte: D. É a única que aceita o voo longo e trabalha dentro dele: rádio da firma, patrocinadores, quase-acidentes no lugar das falas mortas. Também propõe um verbo novo para os 35 voos com velocidade travada e põe a surpresa antes do limite de reembolso. Falta ordem de execução, e o sofá e a máquina de refrigerante pedem arte com só 1,1 crédito. A tem a melhor sequência, mas "nenhum voo acima de 12 minutos" contraria a decisão de Eduardo.
Ponto cego: B. Avaliou só por fotos e manda cortar o voo para 5 minutos, derrubando uma decisão já tomada. Ignora direitos comerciais, som, custo de arte e prioridade. E, com meta de 6 a 8 minutos, erra do mesmo jeito, e C trata a falta de colisão como defeito, embora seja decisão.
Todas perderam: a aceleração do tempo. Na ESPEC, acelerar remove obstáculos e paga moedas por taxa fixa. Todas julgam os 45 minutos como tempo bruto. Ninguém definiu o multiplicador, se acelerar compensa mais que pilotar, nem as horas reais com aceleração. Também faltou a declaração de IA na Steam e o porte futuro depois da web, que pode refazer o polimento.

## Revisor 2 (foco nos números; rodou a simulação)
Mais forte: D. Trabalha dentro da especificação: o voo longo vira rádio e a trava em 180 km/s (confirmada no voo 45) pede um verbo novo. A tem a melhor ordem de execução, mas a meta de 12 minutos falha: a 180 km/s, a Lua leva no mínimo 35,6 minutos.
Ponto cego: C. Sua "falha fatal" é falsa: a dobra já existe (a.dobra = 2.6 ** (n/2)) e multiplica o teto. Plutão é alcançável. B e E também ignoram a decisão do dono ao pedir voos de 5 a 8 minutos.
Todas perderam: 45 minutos não é tempo de relógio. O voo final dá 43,5 minutos simulados e 22,5 "reais", porque o robô acelera só metade do voo. A 100x, caem para menos de 1 minuto. Falta decidir quanto desse voo se joga. A simulação está mal calibrada: o comentário diz que moedas valem 30%, o código usa 0,55. Os números variam: o salto citado de 7x deu 4,4x nesta rodada. Houve voo com 1 compra, não mínimo de 6. Sete módulos carga8 não provam resposta ótima: refletem a nota do robô, que não testa outros estilos.

## Revisor 3 (foco em arte, animação e proporção)
Mais forte: A. É a única que separa o que dá para fazer agora do que exige arte nova: admite que batida de asa não sai sem arte e deixa a fatia esticada por ora. Limitar o dirigível e subir o pombo é viável, pois só muda a escala. Falha: o teto de 12 minutos contraria o voo de 30 a 60.
Ponto cego: D. Diz que poses a 8-12 fps são "só código sobre a arte existente". Não são: há 7 poses da capivara, 2 do tatu e 1 imagem do pássaro. Código em passos sobre figura única é seno travado, não pose. C e E têm o mesmo erro, e a fumaça de E hoje é desenhada em código (efeitos.js), o que o dono rejeita. B, E e C também atacam decisões já tomadas.
Todas perderam: o briefing manda refazer toda a arte no plano pago, pois a atual saiu de planos grátis. Logo, ajustes finos por sprite podem se perder. A tabela de proporção precisa ser independente do sprite (altura-alvo). Peças têm cerca de 400 px: largas e sem recuo, podem borrar. Falta testar. Também falta a folha de prova: uma folha nova, aprovada por Eduardo, antes do lote.

## Revisor 4 (foco em jogador e venda)
Mais forte: D. É a única que pensa em comprador e permanência: gancho de loja, clipe de streamer, reembolso em 2 horas, demo para a Next Fest, cartão-postal compartilhável, inglês, DLC gratuita. Sua fraqueza é não falar de preço nem de custo de produção.
Ponto cego: A. É um bom cronograma interno, mas ignora quem compra, por quanto e por que fica. Só cita testadores externos no fim.
Todas perderam: preço e público: ninguém propõe preço nem define o comprador. Into Space! e similares nasceram grátis no navegador, então o que justifica pagar? Público idle: o autopiloto de 30 a 60 minutos pode ser atrativo para quem deixa o jogo rodando; faltam modo janela e conquistas. Versão web: uma versão grátis no navegador pode canibalizar ou alimentar as vendas. Arte de IA: a Steam exige declarar conteúdo gerado por IA, e parte do público rejeita isso.

## Revisor 5 (foco no minuto a minuto do voo; leu voo.js)
Mais forte: D. É a única que dá ao jogador algo para fazer no voo longo sem contrariar o dono: verbo novo nos voos 45 a 80. Ressalva: rádio é passivo, e quase-acidente já existe ("Por um triz", voo.js:494).
Ponto cego: A. Seis etapas de bugs, tabela e metas, e nenhuma muda o que se faz em um minuto de voo. C também erra ao sugerir que nada ameaça: lixo, satélite e meteoro causam dano.
Todas perderam: aceleração sem jogo. Com tempo acima de 1x, o spawn para (voo.js:980) e só sobram moedas já na tela. A renda fica passiva (voo.js:960). O voo alterna entre desviar e assistir, sem meio-termo. Provável bug: proxEvento conta em tempo simulado (voo.js:377, 1021), e todo evento volta a 1x por 12 a 15 s reais (voo.js:367). A 100x, o intervalo de 70 a 170 s simulados dura uns 1,2 s reais. Isso dá cerca de 92% do tempo em eventos, aceleração efetiva perto de 9x e os mesmos poucos eventos em repetição. Corrigir isso muda a duração real do voo.

# Conferências feitas pelo coordenador (lendo o código e rodando a simulação)
- Dobra confirmada em js/nucleo.js:205 e 294: Plutão é alcançável. A "falha fatal" de C é falsa.
- Simulação completa (--tudo): 230 voos, 81,2 horas, 86 voos sem compra, maior voo 56 min. A Lua sai no voo 78 a 80, cerca de 10,3 horas. Depois da Lua a progressão de compras esfria.
- A 180 km/s a Lua leva 35,6 minutos: limite de 12 minutos exige mudar a velocidade, não só a economia.
- Bug de eventos: a leitura do código confirma a lógica (proxEvento em s.t simulado; fim do evento em est.rel real; est.fator volta a 1 em cada evento). Não foi medido rodando.
- Falas de colisão com pássaro, balão, avião e meteo estão mortas; a dos pássaros também é citada no botão Bolha ("Pode vir, pombo").
- Arte: hoje 7 poses de capivara, 4 rostos, 2 tatus, 1 pombo. Hipótese de 12 fps nunca testada.
- Decisões do próprio Eduardo que estão na ESPEC e na memória: voo final longo de 30 a 60 min com autopiloto e aceleração; distância real; 20 níveis em toda pesquisa; pássaros, aviões, balões e propagandas não batem; tela inicial sem personagens; 15 tipos de peça; arte por código reprovada; versão web sólida antes de portar. Ele pode mudar de ideia, mas quem propõe mudar precisa dizer que é uma reversão.
- Máquina e crédito: GTX 1660 Super 6 GB, 31 GB de RAM, 47 GB livres; Higgsfield 1,1 crédito, Runway 0. Modelos abertos locais estão sendo avaliados à parte, então não trate crédito como o único caminho para arte nova.


## Medição do bug de aceleração
90 s reais a 100x: 742,7 s simulados, 8,2x, 6 eventos, 93% do tempo em evento. Sem eventos, em 15 s: 96,8x.

# Veredito
## Onde o conselho concorda

- **Ninguém testou o jogo de verdade.** Ninguém jogou até o fim nem ouviu o som. As 10,3 horas até a Lua medem um robô, não uma pessoa.
- **O foguete some.** Ele é o protagonista e a recompensa, mas vira um fio na oficina e no voo.
- **Os diálogos são o maior trunfo**, e as falas de colisão mortas precisam sair.
- **Os voos 45 a 80 estão vazios.** A velocidade trava em 180 km/s, e 35 voos só compram mais tanque.
- **Direitos comerciais da arte:** confirme antes de gastar com arte nova.

## Onde o conselho diverge

- **Voo longo:** Executor, Pessoa de fora e Primeiros princípios querem encurtá-lo. O Expansionista aceita o voo longo e o preenche. O Expansionista está certo: o voo de 30 a 60 minutos é decisão sua, e a 180 km/s a Lua leva 35,6 minutos de qualquer jeito.
- **Cortar ou expandir:** Primeiros princípios corta banco, contratos e pesquisas. O Expansionista acrescenta trama e verbo novo. Faça o verbo novo e a trama, e só corte depois de ver gente jogando.
- **Plutão:** o Executor congela, o Expansionista vira DLC gratuita. Congele agora. O caminho existe, porque a dobra já está no código.

## O que só a revisão revelou

- **Bug na aceleração, agora medido.** No jogo de verdade, a 100x, o foguete fica 93% do tempo preso em eventos e a aceleração real é de 8,2x. Sem eventos, ela sobe para 96,8x.
- **Acelerar não tem jogo.** O surgimento de objetos para e a renda fica passiva, então o voo alterna entre desviar e assistir. Os "45 minutos" da simulação dão 22,5 reais.
- **A simulação está mal calibrada.** O comentário diz 30% e o código usa 0,55. Trate os números como aproximados.
- **Poses a 12 fps não são só código.** Há 7 poses de capivara, 2 de tatu e 1 de pombo. Passos sobre figura única são apenas seno travado.
- **A arte atual será refeita**, então ajustes por sprite podem se perder.
- **Faltam decisões de venda:** preço, público, declaração de IA na Steam, e se a versão web grátis ajuda ou canibaliza as vendas.

## A recomendação

- **Proporção:** crie uma tabela por altura-alvo, independente do sprite. Limite o dirigível, aumente o pombo, dê ao foguete largura mínima e faça a oficina preencher o painel. Teste se as peças de 400 px borram.
- **Estilo:** mantenha a aquarela com traço grosso e revise os painéis escuros e a fonte pixelada. Antes de qualquer lote, você aprova uma folha de prova.
- **Animações:** corrija o capacete e o tatu sem capacete. Teste os 12 fps só na capivara, a única com poses suficientes. Asas e fumaça entram na lista de arte nova.
- **Progressão:** corrija a aceleração e decida quanto do voo longo se joga. Dê aos voos 45 a 80 um verbo novo, como estilingue gravitacional. A primeira grande surpresa deve cair antes das 2 horas do reembolso da Steam.
- **Economia:** calibre a simulação e aproxime a Lua do voo 50, mantendo o voo final longo. Na partida completa, 86 de 230 voos não têm compra, quase todos depois da Lua, e isso precisa mudar antes de abrir os planetas. Prefira menos compras e mais comemoradas.
- **Diálogos:** transforme o chefe em trama, com advertência, RH e desfecho na Lua. Use rádio da firma e patrocinadores nos trechos longos. Troque as falas mortas por novas e amplie o "Por um triz", que já existe. Revise a fala da Bolha, que cita o pombo que não bate.

**Reversão que só você decide:** reduzir as 360 peças e os 20 níveis de pesquisa. Recolorida parece enrolação, mas a recomendação é manter por enquanto e decidir depois dos testes.

**Ordem:**
1. Corrigir a aceleração.
2. Corrigir os bugs visíveis e aplicar a tabela de proporção.
3. Calibrar a economia e criar o verbo novo.
4. Escrever os diálogos.
5. Testar os 12 fps.
6. Você joga com som, depois 3 testadores externos até a Lua.
7. Decidir sobre a reversão, o preço e a versão web.
8. Confirmar direitos, aprovar a folha de prova e gerar a arte de uma vez.

## A primeira coisa a fazer

Corrigir a contagem dos eventos para ela andar em tempo real, e repetir a medição a 100x. A medição pedida pelo conselho já foi feita: 90 segundos reais, 6 eventos, 93% do tempo em evento, aceleração de 8,2x.


# Modelos abertos
## Modelos abertos para a sua máquina

Sua máquina: GTX 1660 Super com 6 GB, 31 GB de RAM e 47 GB livres. Nada abaixo foi testado nela ainda. Licenças conferidas nas páginas oficiais, salvo onde indicado.

| Uso | Proposta | Licença | Na sua placa | Papel |
|---|---|---|---|---|
| Poses, expressões e peças a partir de referência | FLUX.2 Klein 4B (GGUF) | Apache 2.0 | Oficial pede 13 GB. Com GGUF, um guia cita 2,6 GB no arquivo e 8 GB de mínimo; 6 GB é o caso a testar | **Primeira escolha:** aceita imagens de referência, o que mais ajuda a manter os personagens iguais |
| Imagem do zero, rápida | Z-Image Turbo (GGUF Q3 ou Q4) | Apache 2.0 | Arquivos de 3,8 a 5 GB; guias citam 6 GB com apoio da RAM | **Segunda escolha:** peças e objetos novos. A versão de edição ainda consta como não lançada |
| Quadros entre duas poses | Practical-RIFE | MIT | Pede Python até 3.11; o seu é 3.14, então vai em ambiente separado | Só depois das poses. Não cria pose, só preenche o meio |
| Recorte do fundo | BiRefNet | MIT | Sem exigência publicada | Para recortes que a chave de verde hoje suja |
| Ampliar peças pequenas | Real-ESRGAN anime 6B | BSD-3 (conferir no repositório oficial) | Modelo pequeno, feito para desenho | Serrilhado das peças da quinta folha e o dirigível |
| Montar boneco articulado | Inochi Creator | BSD-2, com versão paga | Roda sem IA | Opcional: entra para dar corpo mexível se as poses geradas não bastarem |

**Só em GPU alugada**
- **Wan 2.2 TI2V 5B (Apache 2.0):** gera movimento a partir de imagem, mas a página oficial pede 24 GB e o ComfyUI cita 8 GB. Não achei relato em 6 GB.
- **ToonCrafter:** interpola entre dois desenhos de cartoon, até 16 quadros em 512x320. O código é Apache 2.0, mas a licença dos pesos não está na página, e ele pede de 10 a 12 GB. Só usar depois de conferir a licença.
- **Preço:** RTX 4090 entre US$ 0,34 e 0,89 por hora no RunPod, conforme a fonte e o mês. Serve também para treinar um modelo de estilo, se a referência não bastar.

**Descartados**
- **NoobAI:** a licença proíbe uso comercial, inclusive das imagens.
- **Modelos derivados de Illustrious:** licença disputada; só com leitura caso a caso.
- **RMBG-2.0 e 4x_IllustrationJaNai:** não comerciais.
- **Qwen-Image:** ótimo em texto, que o jogo não precisa na arte, e pesado demais (cerca de 24 GB).
- **Animated Drawings:** feito para figuras humanoides e movimentos de boneco, longe do estilo.

**Três avisos**
1. **Placa:** as GTX 16 têm relatos de imagem preta em meia precisão. A saída é `--force-fp32`, que gasta mais memória e pode estourar 6 GB. É o primeiro risco a testar. A base dessa informação são blogs e fóruns, não a documentação oficial.
2. **Direitos:** Apache e MIT liberam o uso do modelo, mas não garantem que a imagem tenha proteção de direito autoral nem que os dados de treino estejam limpos. Usar as folhas antigas como referência carrega a mesma dúvida dos planos grátis. Para quem vende, isso merece uma consulta jurídica.
3. **Steam:** arte gerada por IA continua sendo declarada, mesmo com modelo aberto, porque o jogador a consome.

**Teste proposto:** instalar o ComfyUI em ambiente próprio, sem mexer no sistema, e gerar a mesma folha de capivara com Klein e Z-Image, ao lado da arte atual. Se a placa não aguentar ou o estilo não bater, o caminho é alugar GPU por uma ou duas horas, e o Higgsfield fica como último recurso.

## Fontes

- [FLUX.2 Klein 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B)
- [Guia do Klein no ComfyUI](https://neurocanvas-web.pages.dev/blog/flux-2-klein-comfyui-guide/)
- [ComfyUI em 6 a 8 GB](https://eastondev.com/blog/en/posts/ai/20260721-comfyui-low-vram-acceleration/)
- [Z-Image Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)
- [Z-Image Turbo GGUF](https://huggingface.co/jayn7/Z-Image-Turbo-GGUF)
- [Repositório do Z-Image](https://github.com/Tongyi-MAI/Z-Image)
- [Z-Image em 6 GB](https://admin.kinovi.ai/blog/z-image-low-vram-6gb-gpu-setup)
- [Practical-RIFE](https://github.com/hzwer/Practical-RIFE)
- [BiRefNet](https://huggingface.co/ZhengPeng7/BiRefNet)
- [RMBG-2.0](https://huggingface.co/briaai/RMBG-2.0/blob/refs%2Fpr%2F6/README.md)
- [Real-ESRGAN anime 6B](https://openmodeldb.info/models/4x-realesrgan-x4plus-anime-6b)
- [Licenças de ampliadores](https://huggingface.co/easygoing0114/AI_upscalers)
- [Inochi Creator](https://linuxlinks.com/inochi-creator-create-edit-inochi2d-puppets)
- [Wan 2.2 TI2V 5B](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B)
- [Wan 2.2 no ComfyUI, 8 GB](https://www.serverdirect.nl/blog/ai-update-now-released-wan-22-comfyui)
- [ToonCrafter](https://github.com/Doubiiu/ToonCrafter)
- [RunPod: preços de RTX 4090](https://computeprices.com/providers/runpod/gpus/rtx4090)
- [RunPod: guia de preços](https://diyai.io/ai-tools/hosting/runpod-pricing/)
- [NoobAI-XL](https://huggingface.co/Laxhar/noobai-XL-1.0)
- [Discussão da licença Illustrious](https://civitai.com/articles/18619)
- [Comparativo de modelos abertos](https://pinggy.io/blog/best_free_open_source_ai_image_generators_to_self_host/)
- [Animated Drawings](https://developers.facebook.com/blog/post/2023/04/13/meta-os-animated-drawings/)
- [GTX 16 e imagem preta](https://www.runaihome.com/blog/comfyui-black-image-output-fix-2026/)
- [Regras de IA da Steam, janeiro de 2026](https://www.pcgamer.com/software/ai/steam-updates-ai-disclosure-form-to-specify-that-its-focused-on-ai-generated-content-that-is-consumed-by-players-not-efficiency-tools-used-behind-the-scenes/)

