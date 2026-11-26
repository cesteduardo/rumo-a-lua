# Rumo à Lua: especificação

Jogo de foguete no estilo Into Space! para PC, no navegador. Abre com dois cliques no `index.html`, sem instalar nada.

## Decidido por Eduardo (31/10/2026)

- Distância real: 384.400 km até a Lua, depois planetas até Plutão, com marcos reais no caminho.
- Voo final longo, de 30 a 60 minutos em velocidade normal.
- Pilotagem manual, com aceleração do tempo. Autopiloto só depois de terminar o jogo uma vez (Eduardo, 02/11): antes disso nem aparece.
- Foguete montado peça por peça: cada peça muda a forma e o voo.
- Controle por teclado ou por mouse, trocando sozinho.
- Visual Regular Show: fundo em aquarela sem contorno, personagens e objetos chapados com traço fino.
- Personagens próprios: capivara piloto, entediada e de dentões; tatu de capacete que comenta tudo.
- Fundos em aquarela gerados no Runway (`arte/fundos`, originais em `arte/originais`). Personagens, objetos e peças gerados no Higgsfield (`arte/folhas` são as folhas, `arte/sprites` os recortes).
- Turbo são motores auxiliares nas duas laterais: não gastam combustível, só a barra de turbo. Clique esquerdo, seta para cima ou W.
- Sem combustível o foguete vira e cai, com moedas na descida; perto do chão a capivara salta de paraquedas.
- Ímãs puxam moedas de longe; sem ímã, a moeda só entra encostando.
- Quanto mais longe, mais a câmera recua. Toda pesquisa tem 20 níveis.
- Marcas de patrocínio inventadas, sem imitar marcas reais.

## Decidido por Claude (pode ser mudado)

- Ao chegar na Lua: cena de pouso e final; o jogo continua para bater recordes.
- O espaço do jogo tem resistência cartunesca. Com a física real, passar de 11 km/s faria o foguete nunca mais parar e combustível deixaria de importar. Aqui a velocidade cai quando o motor desliga.
- Aviões, pássaros, balões, dirigíveis e propagandas são paisagem: passam ao fundo e não batem (Eduardo, 01/11). Só lixo, satélite e meteoro dão dano, a partir da Linha de Kármán.
- Escudo de bolha: comprado na oficina, cada compra fica mais cara (150 × 1,32 por compra); botão ao lado de Soltar estágio, tecla F; 4 segundos sem dano.
- Cada enfeite dá um bônus próprio. Módulos chegam a 7 vagas (um de cada tipo); espaço de módulo, tanque e estágio também se compra direto na oficina.
- Piloto só aparece na cabine com o foguete no ar; na oficina ele está de pé ao lado.
- Limite de 150 km/s (170 km/s com turbo): nenhum voo até a Lua dura menos de cerca de 45 minutos.
- Na aceleração do tempo, obstáculos não aparecem e as moedas entram por uma taxa fixa. Eventos voltam o tempo para 1x. Teto de 10x, e nos trechos difíceis não se acelera.

## Aplicado pelo conselho (02/11/2026)

- Eventos contam o intervalo em tempo real. Antes, a 100x, o foguete ficava 93% do tempo preso em eventos e acelerava só 8,2x.
- Anéis de estilingue: acima de 150 km/s, um grupo de três a cada 60 a 120 s reais, só em 1x. Os três em sequência pulam 8 s de viagem e pagam 3% do valor da distância.
- O chefe manda uma mensagem por voo, liberada pela distância, e a história termina no final da Lua (`CHEFE` em `js/personagens.js`). A rádio da firma preenche os trechos acima de 100 km (`RADIO`).
- Turbo independe do combustível e do motor principal, como Eduardo definiu: funciona de tanque vazio e só gasta a barra de turbo.
- Oficina: foguete alto fica grande, a roda do mouse percorre, e arrastar uma peça mostra o foguete inteiro.
- Personagens andam em 12 quadros por segundo (`QUADROS` em `js/personagens.js`; 0 volta ao contínuo).
- `arte/recortar.sh` chama `ferramentas/consertar_sprites.py`, que limpa recortes e põe o capacete no tatu que fala.

## Pedido de venda (02/11/2026, Eduardo)

O jogo precisa ser vendável na Steam: aventura longa, desafio, progressão evidente, proporção coerente, diálogos e segredos.

- **Escala única:** `OBJ` em `js/objetos.js` está na mesma unidade do foguete. Avião, balão e dirigível são sempre menores que o foguete. Foguete grande passa da borda de baixo em vez de virar fio. Capivara cabe umas três vezes no foguete inicial, em toda tela.
- **Subida longa:** abaixo de 100 km o ar limita a velocidade (`tetoAr`). Bico e cera ajudam. Atravessar a atmosfera leva minutos em todo voo.
- **Metas medidas por robô (`node testes/economia.js`, falha se sair):** espaço entre os voos 25 e 40, geoestacionária entre 55 e 85, Lua entre 90 e 150, velocidade máxima depois do voo 55, voo de no máximo 65 min. Última rodada: voos 27, 57 e 97, cerca de 20 horas. Nenhuma pessoa jogou ainda.
- **Trechos com regra própria (`RL.ZONAS`):** vento, tempestade com raio avisado, pressão máxima (nariz reto), meteoros a partir de 60 km, cinturão de radiação, muralha de satélites, atração da Lua.
- **Capítulos (`RL.CAPITULOS`):** 11, com aviso em voo, barra na oficina e no resultado.
- **Pouso na Lua (`est.pouso`):** freio com o turbo, reserva limitada; nota perfeito, bom ou duro. Sempre conta como chegada. O autopiloto só tira bom.
- **Diálogos:** dicas do tatu por capítulo, conversas no rádio, falas por trecho, causa da derrota comentada, rádio por data.
- **Chat da firma:** o tatu é o chefe da capivara. Os dois conversam em balões no voo (`dizer`, `CONVERSA`, `RESPOSTA_TATU`) e também respondem um ao outro na oficina e no resultado.
- **Segredos:** 10 conquistas ocultas (km 42, km 1.969, tatu no vácuo, patinho e pato gigante, nomes do foguete, cutucar tatu e Lua, código clássico, pausa de um minuto, voto de pobreza).
- **Modo de teste:** abrir `teste-lua.html`. Sem dano, combustível infinito, dinheiro infinito (a carteira mostra ∞), L pula para perto da Lua, N para o próximo capítulo. Tem jogo salvo próprio e não entra no pacote.
- **Pacote:** `npm run jogar`, `npm run empacotar`. Fontes embutidas em `arte/fontes`. Controle de videogame só no voo; nos menus, por enquanto, depende do Steam Input.

## Versão atual: web

O jogo é este, em HTML, CSS e JavaScript. Em 01/11/2026 Eduardo pausou o porte para Godot porque não gostou do resultado: primeiro a versão web fica muito sólida, depois ela é portada para uma linguagem mais complexa. A pasta `godot/` e os scripts `ferramentas/exportar-godot.js`, `exportar-acessorios.mjs` e `godot-rodar.sh` ficaram parados como rascunho; não atualizar.

- Música: `node ferramentas/gerar-musica.js` gera os loops (as melodias estão lá).

## Cena WebGPU (26/11/2026)

Pedido de Eduardo: usar no jogo o estilo da página nova (grbrands.com.br/rumo-a-lua) nas nuvens, Terra, Lua, fogo, fumaça e texturas.

- `js/cena-gpu.js` desenha duas camadas em volta do canvas 2D do voo. Embaixo ficam o céu em aquarela, as estrelas, a Lua, a Terra e duas nuvens. Em cima ficam a fumaça, as chamas, a nuvem que passa na frente, o grão do papel e a vinheta.
- A física, os puffs e as posições continuam no jogo. A GPU só troca o desenho.
- O quintal, a plataforma, o chão da Lua, os planetas, o foguete e os personagens continuam na arte do Runway e do Higgsfield.
- Nuvens por altitude: de 0,15 a 70 km, mais cheias entre 2 e 14 km. Na tempestade elas escurecem.
- Sem WebGPU (navegador antigo, `?semgpu`, placa perdida no meio do voo), o jogo volta sozinho ao desenho 2D de antes.
- Testes: `node testes/cena-gpu.mjs <pasta>` tira fotos de 10 altitudes lidas da GPU. `--perf` mede o tempo de GPU e o intervalo entre quadros. `GPU=1 node testes/navegador.mjs <pasta>` joga clicando com a GPU ligada.
- Medido em 1920x1080 na GTX 1660 Super: GPU com média de 4,1 ms e pior quadro de 6,5 ms em todas as altitudes.

## Telas

Abertura, Oficina (montagem por arrastar), Pintura, Laboratório, Contratos, Banco, Mapa da viagem, Conquistas, Voo, Resultado, Pausa, Opções e Final na Lua.

## Conteúdo

- 15 tipos de peça com 24 modelos cada: 360 peças. Modelos acima da arte disponível repetem a figura em outra cor.
- 21 pesquisas de 20 níveis cada.
- 16 marcos reais, 8 faixas de cenário, 14 marcas, 50 conquistas.

## Dinheiro e recompensas (`js/financas.js`)

- No voo: combo de moedas até 5x, "por um triz" ao passar raspando, caixas surpresa.
- No fechamento: distância, moedas, eventos, caixas, triz, voo sem bater (+25%), bônus de recorde, vaquinha dos vizinhos (quando o recorde não vem), seguro, marcos, contratos e conquistas.
- Contratos: 3 no mural, de 8 tipos, pagos sozinhos ao serem cumpridos; trocar custa 10% do prêmio.
- Banco: poupança (3% por voo, com teto) e empréstimo (20% fixo, limite de 3x o melhor pagamento, 30% de cada pagamento vai para a dívida).
- Conquistas: 24, várias liberam padrões, adesivos e rastros. Só parte das pinturas vem liberada no começo.

## Customização

- Montagem: 120 peças, cada uma com desenho próprio.
- Pintura por peça: duas cores, cor livre, padrões, repetir no mesmo tipo ou no foguete todo.
- Adesivos soltos: colar, arrastar, girar, mudar tamanho (roda do mouse ou controle) e cor.
- Nome pintado no casco, esquemas prontos, sorteio de cores, rastro, cor da chama, hangar com 6 foguetes.
- Piloto: chapéus, óculos, pescoço e pelo, comprados com moedas.

## Organização do código

| Arquivo | Papel |
|---|---|
| `js/dados.js` | Peças, pesquisas, marcos e faixas. Só dados |
| `js/nucleo.js` | Regras puras: atributos, física, pagamento, jogo salvo. Testado em Node |
| `js/financas.js` | Bônus, contratos, banco, caixas e conquistas. Testado em Node |
| `js/pintura.js` | Carrega os fundos do Runway; pintura por código como reserva |
| `js/cena-gpu.js` | Cena do voo em WebGPU: céu, nuvens, Terra, Lua, chama, fumaça e papel, os mesmos shaders da página do jogo. Também pinta a Lua, a Terra e as nuvens dos menus |
| `js/efeitos.js` | Fumaça, faíscas, letreiros de batida, molas |
| `js/telas-financas.js` | Telas de Contratos, Banco e Conquistas |
| `js/desenho.js` | Carrega as figuras; monta o foguete, pintura e logotipos |
| `js/personagens.js` | Capivara, tatu, roupas, balões e falas |
| `js/objetos.js` | Obstáculos, coletáveis e absurdos |
| `js/som.js` | Sons sintetizados |
| `js/voo.js` | Cena de voo |
| `js/telas.js` | Menus |
| `js/main.js` | Inicialização e troca de telas |
| `testes/` | Regras, simulação de economia e teste clicando no navegador |

## Critérios de pronto

- O primeiro voo chega a poucos km; o foguete final chega à Lua em 32 a 60 minutos de jogo.
- Simulação de partida completa (`node testes/economia.js`, `--tudo` até Plutão): chegar à Lua leva de 90 a 150 voos e cerca de 15 a 25 horas reais; quase todo voo rende uma compra.
- Teste de navegador clica nos botões reais: novo jogo, comprar, encaixar, lançar, voar, receber, pesquisar.

## Antes de vender na Steam

- Confirmar se os planos usados no Runway e no Higgsfield permitem uso comercial da arte gerada.
- Declarar o conteúdo de IA no formulário da Steam.
- Ligar Steamworks (conquistas e nuvem), o que exige conta de parceiro e AppID.
- Traduzir para inglês: o jogo só existe em português.
- Navegar nos menus com controle.
