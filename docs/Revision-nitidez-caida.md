# Revisión localizada: nitidez y caída — 24/09/2026

Base: `b0ea2aa23a74f542bca859b3aac1fdd0e5ed1d59`.
Rama: `fix/poses-nitidas-caida`. Sin push, merge ni publicación.

## Cambios

- El atlas de las seis poses nuevas (tres atuendos) contenía suavizado por reducción de área. Se aplicó enfoque moderado y una paleta de 48 colores por atuendo, obtenida del atlas original, sin dithering. No cambia ninguna dimensión, silueta alfa, coordenada de recorte ni anclaje facial.
- El plano de la raíz colocaba los pies en y=322 de un lienzo de 360, detrás del diálogo. Ahora el límite inferior es y=222, con 18 píxeles mínimos de margen respecto al diálogo medido en pantalla. La estrella acompaña la composición. Se conserva el encuadre reservado durante la recuperación. No se cambia la posición del personaje en el mundo ni las colisiones.
- El atlas se procesa fuera del juego. No hay filtros de nitidez en tiempo real ni imágenes nuevas generadas. `scripts/prepare-crisp-poses.py` reproduce el procesamiento desde el atlas original conservado en Git; requiere Pillow, numpy y scipy, únicamente si se desea regenerarlo.

## Verificación realizada

- `npm run test:game`: 36/36.
- `node --test tests/*.test.mjs`: 43/43, tras generar `dist` con Sites. Dos pruebas nuevas cubren los márgenes del plano y los recortes del atlas.
- `npm run build` y `npm run build:vercel`: ambas correctas.
- 486 renders: seis poses × 27 combinaciones × tres ciclos, sin deriva entre repeticiones. Inspección visual de recostada e incorporación con los tres atuendos, tonos y rasgos mediante el motor real de dibujo.
- Transparencia binaria y siluetas idénticas al atlas de origen. Diálogos, progresión, mapas, personalización y `.openai/hosting.json` conservados.

## Límite y revisión pendiente

El navegador remoto bloqueó tanto la URL local como el protocolo de archivo. No se realizó un recorrido en navegador ni se certifica esta revisión como aprobada por la jugadora. La verificación visual se hizo con el renderer real sobre Canvas offline; la superposición del diálogo en las láminas es una maqueta de comprobación, no una captura del navegador.

Revisar en el navegador local: nitidez a tamaño normal y pantalla completa; las tres líneas de la caída, especialmente la de las muletas; la transición al levantarse; gafas/pecas/mejillas; lectura y carta. Pausar y reanudar durante el plano. El acabado conserva las limitaciones de detalle del atlas reducido; no es un redibujo manual de cada píxel.

## Bundle incremental

El bundle de actualización necesita el commit base b0ea2aa en la copia local; no se clona solo. Desde esa copia:

```powershell
git fetch "$env:USERPROFILE\Downloads\tales-of-moonie-nitidez-caida-20260924.bundle" fix/poses-nitidas-caida:fix/poses-nitidas-caida
git switch fix/poses-nitidas-caida
npm run build:vercel
npm run test:game
npx next start -p 3001
```

No se necesita ejecutar Python ni reinstalar dependencias si la copia anterior ya tiene `node_modules`. La suite completa de Sites requiere Bash y `dist`; en Windows se puede comprobar el juego con `test:game` y `node --test tests/visual-poses.test.mjs`.
