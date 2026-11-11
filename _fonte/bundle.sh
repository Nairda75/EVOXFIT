#!/bin/sh
# Junta gym3d.js + three.js num único script clássico (funciona também a abrir os ficheiros diretamente, sem servidor).
cd "$(dirname "$0")/.." && npx --yes esbuild assets/js/gym3d.js --bundle --minify --format=iife --target=es2019 --outfile=assets/js/gym3d.bundle.js
