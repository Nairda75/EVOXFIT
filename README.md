# EVOXFIT Maia — site

Site estático (HTML/CSS/JS, sem dependências para correr). Feito por UNO Studio.

## Ver no computador
Abre `index.html` (página de escolha Aveiro/Maia) diretamente, ou serve a pasta (`python3 -m http.server`) e abre http://localhost:8000.

## Editar conteúdo
Os `.html` na raiz são **gerados**. Edita a fonte e volta a gerar:

- `_fonte/site.json` — telefone, morada, coordenadas, links do Google, nota e nº de avaliações.
- `_fonte/pages/*.html` — texto de cada página (PT no HTML, EN em `data-en="…"`).
- `python3 _fonte/build.py` — regenera `index.html` (escolha), `aveiro.html` (em preparação), `maia.html`, `o-ginasio.html`, `primeiro-treino.html`, `contactos.html`, `404.html` e `assets/js/config.js`.

## Fotos e logótipo
- Põe fotos reais do ginásio em `assets/img/gym-1.jpg`, `gym-2.jpg`… e corre `python3 _fonte/build.py`: a tira "Vê o espaço" do início e a galeria de "O ginásio" passam a usá-las (até lá, a tira mostra marcadores a dizer que foto entra em cada sítio).
- O logótipo atual é um wordmark provisório (`assets/favicon.svg` + texto). Troca quando houver o oficial.

## O que ainda precisa de confirmação com o ginásio
- Que o 961 382 108 tem WhatsApp (o formulário de primeiro treino abre uma conversa nesse número).
- Se o primeiro treino é gratuito/experimental, para ajustar a frase "Condições e valores confirmados diretamente com a equipa".
- Planos, preços, modalidades e aulas (não inventados; há espaço para uma secção "Planos").
- A nota 4,7 / 32 avaliações é de novembro de 2026; atualizar em `site.json`.

## Início
- Primeiro ecrã: "24H" (a única vez que o site o diz em grande), uma piada e o relógio com a hora do visitante.
- Ao deslizar, a secção prende ao ecrã e mostra 5 diferenças EVOXFIT vs ginásio tradicional (`assets/js/vs.js`). Os botões levam a cada uma.
- "A que horas te dá jeito?" (`assets/js/hora.js`): escolhe uma hora e segue para o formulário já preenchida.
- GSAP + ScrollTrigger + Lenis para as entradas. Com "reduzir movimento" a cena 3D mantém-se em modo calmo (sem balanço nem movimento de pessoas/carros).
- Se mexeres em `assets/js/gym3d.js`, corre `_fonte/bundle.sh` (gera `gym3d.bundle.js`, que é o que a página carrega e funciona também a abrir os ficheiros diretamente). A resolução 3D adapta-se sozinha ao desempenho do computador.
