# Tales of Moonie — Sendero de historias

Tercera versión jugable, ampliada desde las dos primeras entregas aprobadas del [Documento Maestro](docs/Documento-Maestro.md). El documento conserva la autoridad sobre la historia y las decisiones aprobadas; la solicitud de la tercera entrega autoriza las escenas 7–11, hasta la tercera flor y antes del claro final.

## Alcance

Conserva título corregido, 27 combinaciones de personalización, Humanística III con las poses sentadas aprobadas, sueño, primer claro y primera flor. El sendero abierto continúa dentro del mismo mapa hasta el primer libro, el letrero «Abre bien los hojos.», el segundo libro, las luciérnagas, las piedras del arroyo y la segunda flor (2/3). Su luz se refleja en el agua y los pétalos revelan el sendero oculto.

La ampliación continúa por vegetación más densa hasta «Cartas bajo la misma luna». Cerrar el libro presenta la estrella sin rostro; al seguirla ocurre la caída suave y la referencia directa a las muletas. Moonie se levanta y puede visitar a Simón, sin accesorios, o seguir directamente a la tercera flor. La flor actualiza el contador a 3/3, forma una luna de pétalos y retira las enredaderas. El cierre provisional permite seguir explorando sin perder progreso. No incluye claro final, cofre, carta, sonrisa final ni pantalla final narrativa.

## Jugar

Navegador de escritorio. WASD o flechas para moverse; E para interactuar cerca del objetivo; E, espacio o clic para avanzar los diálogos. Esc abre y cierra la pausa, con volumen de música y efectos. Los botones superiores controlan sonido, pantalla completa y pausa. El sonido comienza tras la primera interacción. La partida dura la sesión de la pestaña y se reinicia al recargar.

## Desarrollo

Node.js 22.13 o posterior y Linux. Instalación bloqueada con `npm run install:ci`; desarrollo con `npm run dev`; compilación con `npm run build`; ejecución compilada con `npm run start`. En el entorno Sites, utilizar los scripts oficiales y el supervisor de previsualización.

React/TypeScript y Canvas 2D de 640 × 360, con escalado de píxeles sin suavizado. Moonie ocupa un lienzo de 48 × 64; las flores, 32 × 32. Sonido provisional original sintetizado con Web Audio. No se usan cuentas de juego, base de datos ni servicios para guardar datos de la jugadora.

- `app/game/story.ts`: textos, personalización, área caminable y colisiones.
- `app/game/MoonieGame.tsx`: flujo, controles, menús y diálogos.
- `app/game/render.ts`: escenarios, sprites, direcciones, animación y variantes.
- `app/game/animation.ts`: clips aprobados de reposo (2), marcha (4) e interacción (2), en cuatro direcciones; caída (3) y recuperación (4).
- `app/game/poses.ts`: seis siluetas específicas por atuendo para tropezar, apoyarse, permanecer caída e incorporarse; la recuperación termina en el sprite normal. No se rota ni aplasta el personaje de pie.
- `app/game/face.ts`: anclajes anatómicos deterministas para pecas y gafas; las mejillas forman parte de cada dibujo.
- `app/game/effects.ts`: tres flashes locales sincronizados con la pose de Simón.
- `app/game/audio.ts`: música, ambiente, efectos y volumen.
- `public/assets/`: escenarios y atlas generados a partir de las referencias aprobadas.
- `docs/Verificacion.md`: comprobaciones y límites de esta entrega.

## Verificación

`npx tsc --noEmit -p tsconfig.game.json` comprueba el código de juego. `node --test tests/*.test.mjs` ejecuta las pruebas con el artefacto ya compilado; `npm test` recompila primero. El perfil TypeScript del juego excluye ejemplos D1 y tipos opcionales de Cloudflare de la plantilla que no se utilizan.

El despliegue inicial es privado para revisión del propietario. La entrega final sin inicio de sesión a la destinataria requiere configurar posteriormente el acceso del enlace.

## Acabado provisional

Las dos primeras entregas son la base aprobada y bloqueada. La tercera está aprobada en términos generales y recibe cuatro correcciones visuales: dos bordes locales de bosque continuo, poses dedicadas de caída y recuperación, flashes perceptibles de Simón y anclajes faciales estables. Se conserva el resto de la historia, los fondos originales, el recorrido y las colisiones. Las correcciones esperan la aprobación visual definitiva del usuario. La sonrisa final no está implementada. El cierre de prueba y la mezcla sonora sintetizada siguen siendo provisionales; la mezcla final requiere escucha del usuario.
