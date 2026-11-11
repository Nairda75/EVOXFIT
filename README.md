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
- Põe fotos reais do ginásio em `assets/img/gym-1.jpg`, `gym-2.jpg`… e corre `python3 _fonte/build.py`: a tira "Vê o espaço" do início e a galeria de "O ginásio" passam a usá-las (até lá, a tira mostra marcadores a dizer que foto entra em cada sítio).
- O logótipo atual é um wordmark provisório (`assets/favicon.svg` + texto). Troca quando houver o oficial.

## O que ainda precisa de confirmação com o ginásio
- Que o 961 382 108 tem WhatsApp (o formulário de primeiro treino abre uma conversa nesse número).
- Se o primeiro treino é gratuito/experimental, para ajustar a frase "Condições e valores confirmados diretamente com a equipa".
- Planos, preços, modalidades e aulas (não inventados; há espaço para uma secção "Planos").
- A nota 4,7 / 32 avaliações é de novembro de 2026; atualizar em `site.json`.

## Início
- Primeiro ecrã: "24H" (a única vez que o site o diz em grande), uma piada e, por trás, o ginásio em 3D à noite, visto de longe.
- Ao deslizar a câmara aproxima-se: parque → porta → sala → máquinas → receção. Cada vista corresponde a uma diferença EVOXFIT vs ginásio tradicional (`assets/js/vs.js` trata do texto e dos botões, `assets/js/gym3d.js` da cena three.js).
- A cena é desenhada em código (sem fotografias). Sem WebGL ou com "reduzir movimento" aparece a lista normal, sem 3D. Para testar uma vista: `window.__gym.jump(0.55)` na consola.
- "A que horas te dá jeito?" (`assets/js/hora.js`): escolhe uma hora e segue para o formulário já preenchida.
- GSAP + ScrollTrigger + Lenis para as entradas.

## Abas, faixa UNO Studio e contactos
- Abas (`assets/js/tabs.js`, `data-tabs`): indicador que desliza, avanço automático (`data-auto="ms"`), setas/Home/End, deslizar com o dedo, ARIA. Usadas em "O teu primeiro treino" (início), nas zonas de "O ginásio" (`tabs--v`) e no bloco de contactos.
- Faixa "UNO Studio — fazemos as coisas por nós" (`{{UNO}}` nas páginas): início, O ginásio e Primeiro treino.
- Bloco de contactos e localização (`contact_block()` em `_fonte/build.py`): aparece no fim de TODAS as páginas, incluindo a 404.
