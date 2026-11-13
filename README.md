# EVOXFIT Maia — site

Site estático (HTML/CSS/JS, sem dependências para correr). Feito por UNO Studio.

## Ver no computador
Abre `index.html` (página de escolha Aveiro/Maia) diretamente, ou serve a pasta (`python3 -m http.server`) e abre http://localhost:8000.

## Editar conteúdo
Os `.html` na raiz são **gerados**. Edita a fonte e volta a gerar:

- `_fonte/site.json` — telefone, morada, coordenadas, links do Google, nota e nº de avaliações, **horário da receção** (`rececao.dias`, 0 = domingo), **equipamento** (`equipamento.grupos`: zonas, máquinas e quantidades) e `portefolio_url` (ligação para o portefólio da UNO Studio; vazio = aponta para o rodapé).
- `_fonte/pages/*.html` — texto de cada página (PT no HTML, EN em `data-en="…"`).
- `python3 _fonte/build.py` — regenera todas as páginas e `assets/js/config.js`.

Páginas: `index` (escolha Aveiro/Maia, na horizontal), `aveiro` (em preparação), `maia` (início em slides), `o-ginasio`, `maquinas`, `equipa`, `primeiro-treino`, `contactos`, `404`.

## Dados de exemplo (a substituir)
- `rececao` e `equipamento` têm `"exemplo": true` e aparecem no site com uma etiqueta "de exemplo". Quando os valores forem os reais, passar a `false` (a etiqueta desaparece).
- A página Equipa tem nomes/fotografias provisórios (`team_html()` em `_fonte/build.py`).
- A marcação do primeiro treino (`assets/js/agendar.js`) só oferece os dias e horas (de 30 em 30 min) em que a receção está aberta; domingo fechado nos valores de exemplo.

## Imagens e logótipo
- As imagens `assets/img/ev-*.jpg` são **ilustrativas** (renders criados para esta proposta), identificadas como tal no site.
- As fotografias e cartazes enviados pela EVOXFIT estão em `assets/img/evox-01…07.jpg` (galeria da Maia e de O ginásio, com ampliação). Têm resolução baixa: ideal substituir pelos originais. Os textos alternativos estão em `ALTS` no `_fonte/build.py`. Duas das fotografias (sala e grupo) parecem do ginásio dos EUA — confirmar antes de publicar.
- Fotografias reais: pôr em `assets/img/evox-1.jpg`, `evox-2.jpg`… (ou `gym-*.jpg`) e correr o build: aparece uma tira no início e uma galeria em "O ginásio".
- `assets/img/logo-evoxfit.png` é o logótipo deles (sem "Maia"); o design não foi alterado.

## O que ainda precisa de confirmação com o ginásio
- Que o 961 382 108 tem WhatsApp (o formulário abre uma conversa nesse número).
- Horário real da receção, lista e quantidades reais de máquinas, equipa.
- Se o primeiro treino é gratuito/experimental; planos e preços (não inventados).
- A nota 4,7 / 32 avaliações é de novembro de 2026; atualizar em `site.json`.
- Aveiro: página em preparação (faltam dados e fotografias).

## Estrutura do início (Maia)
Visita 3D ao ginásio (`assets/js/gym3d.bundle.js`, three.js; câmara guiada pelo deslize) numa janela arredondada, com painel de números animado (24 h, equipamento, receção, avaliações, primeiro treino) e texto por passos ao lado, nunca por cima (`assets/js/disco.js`). Sem WebGL ou com movimento reduzido fica uma imagem estática → dados essenciais → marcação por horas da receção → zonas de máquinas → equipa → avaliações → onde estamos (horários e mapa) → chamada final.

## UNO Studio
Sem animação de abertura. Sem marca de água lateral; faixa UNO no rodapé e ligação pequena "Portefólio UNO Studio" (definir `portefolio_url`). O "UNO." é um wordmark tipográfico provisório.

## Sem bibliotecas
Só HTML, CSS e JS próprios (`main.js`, `anim.js`, `disco.js` (+ o pacote three.js `gym3d.bundle.js`), `agendar.js`, `treino.js`). A versão anterior está na etiqueta `v2-uno-intro` e a versão anterior com o 3D a ecrã inteiro em `redesign-3d-slides` e na etiqueta `v4-3d-hero`.

## Notas (atualização)
- Slogan: **WE GOT THIS** (PT e EN).
- Animações/3D: já não são desligadas por "reduzir movimento" do sistema (causava o problema no PC). Para uma versão calma, abrir qualquer página com `?calmo`.
- Animação 3D da Maia: a câmara acompanha diretamente o deslize (scroll livre, como na Quinta do Geraldino); cada paragem tem um pequeno patamar. Para regenerar `assets/js/gym3d.bundle.js`: `sh _fonte/bundle.sh` (precisa de `_fonte/vendor/three.module.min.js`, three r160) e copiar para `assets/js/`.
- Cursor: seta pontiaguda amarela EVOX (CSS puro, sem JavaScript); inversa sobre botões e links. Só com rato.
- Botões: micro-animações ao passar o rato (reflexo, subida, brilho) e ao clicar (pressão).
- Escolha de ginásio (`index`): cartões com fotografia, meio-termo entre o primeiro e o minimalista.
