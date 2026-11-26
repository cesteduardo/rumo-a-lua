# Rumo à Lua

Uma capivara com emprego, um foguete de sucata e 384.400 km. Jogo de foguete para PC, no navegador ou empacotado com Electron.

- Abra `index.html` com dois cliques, ou rode `npm run jogar` para a janela de computador.
- `teste-lua.html` abre o modo de teste: sem dano, combustível e dinheiro infinitos, L pula para perto da Lua.
- A especificação completa, com as decisões de jogo, está em `ESPEC.md`. A arte e os prompts estão em `BRIEFING-HIGGSFIELD.md`.

## Visual do voo

O céu, as nuvens, a Terra, a Lua, as chamas, a fumaça e o grão do papel são desenhados em tempo real com WebGPU (`js/cena-gpu.js`). São os mesmos shaders da página do jogo, em grbrands.com.br/rumo-a-lua. Os personagens, o foguete, o quintal e os objetos são a arte gerada no Runway e no Higgsfield (`arte/`).

Sem WebGPU, o jogo usa o desenho 2D antigo.

## Controles

| Tecla | Ação |
|---|---|
| A / D, setas ou mouse | Mexer o foguete |
| W, seta para cima ou clique | Turbo nos motores laterais |
| S | Soltar estágio |
| F | Escudo de bolha |
| E | Acelerar o tempo |
| Esc | Pausa |

## Testes

```
npm run testar                          # regras, finanças e economia até a Lua
node testes/navegador.mjs <pasta>       # joga clicando nos botões reais
GPU=1 node testes/navegador.mjs <pasta> # o mesmo, com a cena WebGPU ligada
node testes/cena-gpu.mjs <pasta>        # fotos do voo em 10 altitudes
node testes/cena-gpu.mjs --perf <pasta> # tempo de GPU e de quadro por altitude
```
