"""Limpa o que o recorte deixa para trás e devolve o capacete ao tatu que fala.

Rode depois de arte/recortar.sh:
  uv run --no-project --python 3.12 --with pillow --with numpy --with scipy python ferramentas/consertar_sprites.py
"""
import pathlib
import numpy as np
from PIL import Image
from scipy import ndimage as ni

BASE = pathlib.Path(__file__).resolve().parent.parent / 'arte' / 'sprites'
SUJEIRA = {  # caixas (x0, y0, x1, y1) de restos da figura vizinha na folha
    'capi_chave': [(480, 555, 491, 585)],
    'capi_paraquedas': [(0, 600, 30, 640), (40, 620, 90, 640)],
    'tatu_fala': [(0, 0, 20, 55)],
}


def abrir(nome):
    return np.array(Image.open(BASE / f'{nome}.png').convert('RGBA'))


def salvar(nome, a):
    Image.fromarray(a).save(BASE / f'{nome}.png', optimize=True)


for nome, caixas in SUJEIRA.items():
    a = abrir(nome)
    for x0, y0, x1, y1 in caixas:
        a[y0:y1, x0:x1, 3] = 0
    salvar(nome, a)
    print('limpo', nome)

# Capacete: só a parte amarela do tatu parado, com o contorno em volta.
fonte = abrir('tatu')
r, g, b, al = [fonte[..., i].astype(int) for i in range(4)]
amarelo = (r > 200) & (g > 130) & (b < 120) & (al > 100)
lab, n = ni.label(amarelo)
maior = 1 + int(np.argmax(ni.sum(amarelo, lab, range(1, n + 1))))
mascara = ni.binary_dilation(ni.binary_closing(lab == maior, iterations=4), iterations=5) & (al > 40)
ys, xs = np.where(mascara)
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
capacete = fonte[y0:y1, x0:x1].copy()
capacete[..., 3] = (capacete[..., 3] * mascara[y0:y1, x0:x1]).astype(np.uint8)
print('capacete', x1 - x0, y1 - y0)

# Onde ele entra: tira as orelhas do tatu que fala e assenta o capacete na cabeça.
# Parte da figura recém-recortada; não rode duas vezes sem rodar arte/recortar.sh antes.
fala = Image.open(BASE / 'tatu_fala.png').convert('RGBA')
L, A = fala.size
arr = np.array(fala)
arr[:64, :, 3] = 0       # pontas das orelhas e sobrancelhas
arr[:112, :150, 3] = 0   # orelha que aparece atrás da cabeça
fala = Image.fromarray(arr)
ESC = 1.12
cap = Image.fromarray(capacete)
cap = cap.resize((int(cap.width * ESC), int(cap.height * ESC)), Image.LANCZOS).rotate(3, expand=True, resample=Image.BICUBIC)
ASSENTA = 58             # quanto da aba desce sobre a testa
TOPO = max(0, cap.height - 64 - ASSENTA)
tela = Image.new('RGBA', (L, A + TOPO), (0, 0, 0, 0))
tela.alpha_composite(fala, (0, TOPO))
tela.alpha_composite(cap, (112, TOPO + 64 + ASSENTA - cap.height))
arr = np.array(tela)
topo = np.where(arr[..., 3].max(axis=1) > 10)[0][0]
Image.fromarray(arr[topo:]).save(BASE / 'tatu_fala.png', optimize=True)
print('tatu_fala', arr.shape[1], arr.shape[0] - topo)
