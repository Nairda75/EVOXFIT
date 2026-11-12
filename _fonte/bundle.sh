#!/bin/sh
# (Só para gerar as imagens ilustrativas; não faz parte do site.) Junta gym3d.js + three.js num único script clássico (funciona também a abrir os ficheiros diretamente, sem servidor).
cd "$(dirname "$0")/.." && npx --yes esbuild _fonte/render/gym3d.js --bundle --minify --format=iife --target=es2019 --outfile=_fonte/render/gym3d.bundle.js
