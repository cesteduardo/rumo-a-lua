#!/bin/bash
set -e
cd "$HOME/www/Rumo a Lua/arte"
mkdir -p sprites
S=$(mktemp -d)
mkdir -p "$S"
# Chave estreita: com 0.30 ela comia o miolo claro das peças e os módulos ficavam transparentes.
for f in personagens elementos pecas1 pecas2; do
  ffmpeg -loglevel error -y -i "folhas/$f.png" -vf "format=rgba,colorkey=0x00FF00:0.13:0.05,despill=type=green:mix=0.6:expand=0" "$S/$f.png"
done
# A terceira folha é JPG (precisa de chave um pouco maior) e tem peças verdes de verdade: quase sem despill.
ffmpeg -loglevel error -y -i "folhas/pecas3.jpg" -vf "format=rgba,colorkey=0x00FF00:0.20:0.06,despill=type=green:mix=0.15:expand=0" "$S/pecas3.png"
celula() { magick "$S/$1.png" -crop 512x512+$(( $3*512 ))+$(( $4*512 )) +repage -trim +repage -resize '420x420>' "sprites/$2.png"; }
i=0; for n in passaro aviao balao meteo lixo satelite meteoro moeda galao kit caixa refri sofa pato dirigivel outdoor; do celula elementos $n $((i%4)) $((i/4)); i=$((i+1)); done
i=0; for n in bico0 bico1 bico2 bico3 capsula0 capsula1 capsula2 capsula3 tanque0 tanque1 tanque2 tanque3 motor0 motor1 motor2 motor3; do celula pecas1 $n $((i%4)) $((i/4)); i=$((i+1)); done
i=0; for n in aleta0 aleta1 aleta2 aleta3 aux0 aux1 aux2 escudo0 gerador antena ima carga enfeite0 enfeite1 enfeite2 enfeite3; do celula pecas2 $n $((i%4)) $((i/4)); i=$((i+1)); done
i=0; for n in bico4 bico5 bico6 bico7 capsula4 capsula5 capsula6 capsula7 tanque4 tanque5 tanque6 tanque7 motor4 motor5 motor6 motor7; do
  magick "$S/pecas3.png" -crop 256x256+$(( (i%4)*256 ))+$(( (i/4)*256 )) +repage -trim +repage -resize '420x420>' "sprites/$n.png"; i=$((i+1))
done
caixa() {
  X=$(( $2*2048/1000 )); Y=$(( $3*2048/1000 )); W=$(( ($4-$2)*2048/1000 )); H=$(( ($5-$3)*2048/1000 ))
  magick "$S/personagens.png" -crop ${W}x${H}+$X+$Y +repage -resize '640x640>' $6 "sprites/$1.png"
}
caixa capi_parada 80 25 275 330
caixa capi_aponta 400 25 655 330
caixa capi_comemora 672 30 958 330
caixa capi_susto 30 345 285 665
caixa capi_triste 398 385 618 662
caixa capi_paraquedas 695 348 942 815
caixa capi_chave 88 680 328 980
caixa tatu 322 785 545 975
caixa tatu_fala 582 785 815 970 -flop
caixa cab_parada 88 25 268 165
caixa cab_feliz 742 30 922 165
caixa cab_susto 98 360 278 500
caixa cab_triste 442 390 615 545
(cd .. && uv run -q --no-project --python 3.12 --with pillow --with numpy --with scipy python ferramentas/consertar_sprites.py)
ls sprites | wc -l
du -sh sprites
