# EVOXFIT Maia — site

Site estático (HTML/CSS/JS, sem dependências para correr). Feito por UNO Studio.

## Ver no computador
Abre `index.html` (página de escolha Aveiro/Maia) diretamente, ou serve a pasta (`python3 -m http.server`) e abre http://localhost:8000.

## Editar conteúdo
Os `.html` na raiz são **gerados**. Edita a fonte e volta a gerar:

- `_fonte/site.json` — telefone, morada, coordenadas, links do Google, nota e nº de avaliações.
- `_fonte/pages/*.html` — texto de cada página (PT no HTML, EN em `data-en="…"`).
- `python3 _fonte/build.py` — regenera `index.html` (escolha), `aveiro.html` (em preparação), `maia.html`, `o-ginasio.html`, `primeiro-treino.html`, `contactos.html`, `404.html` e `assets/js/config.js`.

## Imagens e logótipo
- As imagens `assets/img/ev-*.jpg` são **ilustrativas**: renders estilizados do ginásio criados para esta proposta (a preto e branco com toque amarelo). Estão identificadas como "Imagem ilustrativa" no site.
- Quando houver fotografias reais, põe-nas em `assets/img/gym-1.jpg`, `gym-2.jpg`… e corre `python3 _fonte/build.py`: aparece uma tira de fotografias no início e uma galeria em "O ginásio". Para trocar as imagens ilustrativas por fotos reais nas secções principais, substitui os ficheiros `ev-*.jpg` (mesmos nomes).
- `assets/img/logo-evoxfit.png` é o logótipo deles (sem "Maia"); o site não usa a tipografia da marca: usa Archivo + IBM Plex Mono e elementos de marca próprios (régua de carga, X, selo circular, relógio de 24 h, cantos de enquadramento).

## O que ainda precisa de confirmação com o ginásio
- Que o 961 382 108 tem WhatsApp (o formulário de primeiro treino abre uma conversa nesse número).
- Se o primeiro treino é gratuito/experimental, para ajustar a frase "Condições e valores confirmados diretamente com a equipa".
- Planos, preços, modalidades e aulas (não inventados; há espaço para uma secção "Planos").
- A nota 4,7 / 32 avaliações é de novembro de 2026; atualizar em `site.json`.
- Aveiro: página em preparação (faltam dados e fotografias).

## Estrutura do início
Herói com o slogan → faixa em movimento → declaração e números → "Cinco diferenças" (imagem que muda com o texto) → escolha do horário (`assets/js/hora.js`, relógio de 24 h) → atalhos → avaliações → onde estamos (mapa) → chamada final.

## Abertura UNO Studio
Animação de ~5 s (marketing & digital → "Criámos este website para…") mostrada uma vez por sessão na primeira página (`index.html` ou `maia.html`). Tem botão "Saltar", respeita "reduzir movimento" e pode rever-se com `maia.html?intro=1` (ligação "Ver abertura" no rodapé). O "UNO." é um wordmark tipográfico provisório: trocar pelo logótipo oficial da UNO Studio.

## Sem bibliotecas
O site não carrega bibliotecas de animação nem 3D: só HTML, CSS e JS próprios (`main.js`, `anim.js`, `hora.js`, `treino.js`). A cena 3D usada para gerar as imagens está em `_fonte/render/gym3d.js` (`_fonte/bundle.sh` gera o pacote para renderizar); a versão anterior com o 3D ao deslizar está no ramo `redesign-3d-slides`.
