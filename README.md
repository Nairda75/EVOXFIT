# EVOXFIT Maia — site

Site estático (HTML/CSS/JS, sem dependências para correr). Feito por UNO Studio.

## Ver no computador
Abre `index.html` diretamente, ou serve a pasta (`python3 -m http.server`) e abre http://localhost:8000.

## Editar conteúdo
Os `.html` na raiz são **gerados**. Edita a fonte e volta a gerar:

- `_fonte/site.json` — telefone, morada, coordenadas, links do Google, nota e nº de avaliações.
- `_fonte/pages/*.html` — texto de cada página (PT no HTML, EN em `data-en="…"`).
- `python3 _fonte/build.py` — regenera `index.html`, `o-ginasio.html`, `primeiro-treino.html`, `contactos.html`, `404.html` e `assets/js/config.js`.

## Fotos e logótipo
- Põe fotos reais do ginásio em `assets/img/gym-1.jpg`, `gym-2.jpg`… e volta a gerar: a galeria aparece sozinha na página "O ginásio".
- O logótipo atual é um wordmark provisório (`assets/favicon.svg` + texto). Troca quando houver o oficial.

## O que ainda precisa de confirmação com o ginásio
- Que o 961 382 108 tem WhatsApp (o formulário de primeiro treino abre uma conversa nesse número).
- Se o primeiro treino é gratuito/experimental, para ajustar a frase "Condições e valores confirmados diretamente com a equipa".
- Planos, preços, modalidades e aulas (não inventados; há espaço para uma secção "Planos").
- A nota 4,7 / 32 avaliações é de novembro de 2026; atualizar em `site.json`.

## Animações
Herói 3D com three.js (barra que carrega com o scroll), GSAP + ScrollTrigger + Lenis, relógio de 24h ligado ao scroll. Respeita "reduzir movimento" e tem alternativa SVG sem WebGL.
