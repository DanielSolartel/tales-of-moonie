# Juego completo — escenas 12 y 13 y dos correcciones localizadas

Actualizado: 10 de septiembre de 2026. Fuente definitiva: Documento Maestro, sin modificar. La tercera versión y sus correcciones se consideran aprobadas; esta entrega conserva esa base y añade únicamente el final autorizado y los dos ajustes pendientes. El acabado nuevo espera la aprobación personal del usuario.

## Implementación

- La barrera anterior al sendero oculto ahora consiste en dos grupos de ramas bajas y enredaderas con hojas, dibujados sobre el suelo y detrás de Moonie. No usa el antiguo parche rectangular de copas. Las ramas se retiran progresivamente y la colisión se abre exactamente al terminar, a los 2,6 segundos de despertar la segunda flor.
- La tercera flor pulsa, proyecta partículas ascendentes y forma progresivamente una luna creciente con 36 pétalos móviles. El efecto crece, alcanza su máximo y desaparece antes de seis segundos; no se repite ni modifica de nuevo 3/3. Las enredaderas se retiran después de la respuesta de la flor y desbloquean la salida a los 3,2 segundos. Pausa congela ambos procesos.
- El mismo mapa continúa hacia un claro circular luminoso. El cofre tiene estados cerrado, abriéndose y abierto con carta, interacción de proximidad y los dos diálogos exactos aprobados. Solo es alcanzable después de las tres flores; Simón sigue siendo opcional.
- La carta utiliza papel ilustrado y texto HTML manuscrito legible. Fecha actualizada por petición del usuario a «Sábado 03/10/2026»; las otras tres líneas se conservan, sin narración posterior.
- Al terminar la carta, Moonie la sostiene contra el pecho; la estrella gira, asciende junto a la luna, Moonie sonríe y aparecen destellos. El cierre silencioso dura diez segundos y termina en fundido azul oscuro. Dos poses dedicadas por atuendo se combinan con tonos y rasgos; no se rota ni deforma el sprite normal.
- Pantalla final con luna llena dominante y detallada, título delante, estrella lateral y textos exactos. E vuelve al título y limpia progreso, diálogos y efectos. Se conservan las preferencias de personalización y volumen.
- Se conserva la música sintetizada aprobada, con reducción de ambiente en el claro, piano casi solo durante la carta, campanillas en la ascensión y nota final larga. El reinicio corta la cola final para evitar superposición con una nueva partida. La pausa suspende y reanuda el reloj de audio.

## Verificación realizada

- Tres recorridos completos en Chrome desde el título hasta FIN: cotidiana/medio/gafas sin Simón; artista/oscuro/pecas visitando a Simón; exploradora/claro/mejillas sin Simón. Se observaron las poses del aula, sueño, tres flores, libros, letrero, estrella, caída, recuperación, cofre, carta y cierre.
- Se observaron ambas uniones anteriores hacia arriba y abajo, el cruce de piedras, bloqueo del agua, curvas y ramales. Se intentó atravesar la segunda barrera cerrada; el paso solo se habilita después de la retirada. Los límites y accesibilidad se comprueban también automáticamente.
- Las 27 combinaciones se seleccionaron en cuatro direcciones durante dos ciclos reales del navegador: 216 vistas, con la misma geometría y etiquetas al volver a cada combinación. No son 27 partidas completas.
- Auditoría raster: 1.620 cuadros de animación, 27 combinaciones × cuatro direcciones × 15 cuadros, todos distintos dentro de su clip y contenidos en 48 × 64. Tres ciclos conservan RGBA idéntico incluso vaciando cachés, cambiando el orden y contaminando la transformación previa.
- Auditoría adicional de las 54 variantes finales (27 combinaciones × abrazo/sonrisa), tres ciclos deterministas, sin cuadros vacíos ni cambios acumulativos. Inspección visual de la hoja y de los tres atuendos durante el cierre real del navegador.
- Capturas secuenciales verificaron los tres destellos de Simón y su vuelta a la orientación del sendero. La prueba raster de flashes confirmó los tres picos locales, sin lavado blanco de la pantalla.
- Pausa probada durante la tercera flor, apertura del cofre y cierre silencioso. Dos capturas separadas de la región de la flor pausada resultaron idénticas píxel a píxel; al continuar, el efecto retomó su formación. Se probó silencio reversible, música 40 %, efectos 60 %, conservación de ajustes al reiniciar y entrada/salida de pantalla completa. Carta legible en ambas presentaciones.
- Dieciséis pruebas automatizadas aprobadas, comprobación TypeScript correcta y compilación de producción completa. Sin errores ni advertencias de la aplicación en el registro del navegador al terminar. Las advertencias de proxy/clasificación estática de la herramienta de compilación no son errores del juego.
- Documento Maestro, configuración de alojamiento, fondos y recursos anteriores, animaciones base y módulo facial permanecen intactos. El único ajuste compartido en poses permite distinguir piel de papel crema; el valor por defecto mantiene idéntica la caída anterior.

## Recursos nuevos y alcance de la aprobación

Cuatro ilustraciones nuevas seleccionadas: fondo del claro final, atlas modular de seis poses, papel de carta y luna llena final. Se reutiliza el cofre aprobado mediante una copia de su hoja de tres estados. Prompts y procedencia: `Prompts-Final.md`. Las enredaderas y luces se construyen con el sistema Canvas existente, sin nuevas imágenes de los escenarios previos.

No quedan cierres provisionales ni escenas finales pendientes. La aprobación definitiva del acabado visual, los tiempos y la mezcla sonora corresponde al usuario; las pruebas visuales y funcionales de audio no certifican una escucha humana de la mezcla. Se verificó navegador de escritorio, no Safari ni controles táctiles.

Antes de aprobar: observar la barrera antes/después de 2/3, el movimiento de la luz y los pétalos de 3/3, el atuendo elegido al abrazar la carta y sonreír, legibilidad de la fecha, ascensión de la estrella, luna final y regreso mediante E. Escuchar los cambios de piano/campanillas y comprobar el volumen preferido.

---

# Historial: correcciones visuales de la tercera versión jugable (aprobadas)

Actualizado: 9 de septiembre de 2026. El Documento Maestro y la base narrativa aprobada permanecen intactos. Esta revisión corrige exclusivamente las dos uniones del bosque, las poses de caída/recuperación, los flashes de Simón y el anclaje facial. La aprobación definitiva de estos acabados corresponde al usuario.

## Cambios y verificación actual

- Dos piezas locales de transición sustituyen las franjas estiradas o reflejadas. Los fondos originales siguen intactos; las piezas se limitan a los bordes de unión y se recortan con contornos irregulares. Ambas conexiones se recorrieron hacia arriba y hacia abajo en el navegador, revisando camino, copas, densidad y continuidad.
- Seis siluetas dedicadas por atuendo muestran tropiezo, pérdida de equilibrio, postura caída, apoyo, rodilla y recuperación. La última fase vuelve al idle aprobado. Ningún cuadro utiliza la rotación del sprite normal. Los tonos y rasgos se componen modularmente sobre las tres variantes; los cuadros siguen limitados a 48 × 64 y conservan el anclaje del personaje. Idle, caminar e interactuar mantienen sus animaciones anteriores.
- Moonie permanece caída durante las tres líneas posteriores a la caída, incluida «Por suerte, esta vez no necesitó muletas.». Se comprobó visualmente con cotidiana/medio/gafas, artista/oscuro/pecas y exploradora/claro/mejillas, incluida la recuperación. La pausa congela correctamente la postura caída y el inicio de la recuperación.
- Simón tiene tres destellos locales en primer plano durante su pose, acompañados por partículas. La revisión visual confirmó iluminación perceptible y regreso a la orientación hacia el sendero. La comprobación raster verifica los tres picos de luz y que no produzcan un lavado blanco de toda la escena.
- Los rasgos usan coordenadas anatómicas explícitas por atuendo, dirección y pose. El selector reinicia su transformación antes de dibujar. No se reprodujo deriva acumulativa; sí se corrigió el uso de una altura facial común para recortes cuyos ojos estaban a alturas distintas. La personalización facial también se aplica a la pose dormida sin alterar el recurso ni la colocación del aula; las vistas de espalda no muestran rasgos frontales.
- Se seleccionaron las 27 combinaciones y las cuatro direcciones en dos ciclos mediante controles reales del navegador: 216 vistas con geometría del selector idéntica. La auditoría del renderizador compara los píxeles de las 108 variantes y sus animaciones durante tres ciclos, alterando el orden, vaciando cachés y contaminando deliberadamente la transformación previa. Cada combinación vuelve al mismo resultado RGBA.
- Auditoría de 1.620 cuadros: 27 combinaciones × 4 direcciones × 15 cuadros. Todos son no vacíos, distintos dentro de cada clip y contenidos en 48 × 64. Se revisaron las hojas de animación y las tres variantes sentadas con gafas. Estas comprobaciones locales complementan la inspección del navegador.
- Tres recorridos completos desde título hasta cierre 3/3: cotidiana/medio/gafas, artista/oscuro/pecas y exploradora/claro/mejillas. Se completó la historia omitiendo a Simón, se visitó después mediante Seguir explorando y también se hizo una pasada visitándolo antes de la tercera flor. Omitirlo no bloquea el progreso.
- Diálogos contrastados con el Maestro, sin cambios en `story.ts`. Se comprobaron las piedras seguras, el bloqueo del agua, curvas y ramales, progreso 0/3 a 3/3, estrella sin rostro, pétalos y retirada de enredaderas. Se conservan los controles, colisiones y secuencia existentes.
- Pausa con botón y Esc, ajustes de música/efectos, silencio reversible y entrada/salida de pantalla completa comprobados. Sin errores ni advertencias de la aplicación en el registro del navegador al concluir. Los controles sonoros funcionan; la inspección visual no certifica la mezcla auditiva.
- Trece pruebas automáticas aprobadas, TypeScript correcto y compilación de producción completada. No se cambiaron dependencias, el Documento Maestro, los recursos anteriores, `audio.ts` ni `.openai/hosting.json`.

## Recursos y límites actuales

Cuatro archivos nuevos: `clearing-edge.png`, `hidden-edge.png`, `fall-poses-real.png` y `fall-poses-themed.png`. Los dos últimos aportan las filas de atuendo seleccionadas para el sistema modular, no 27 secuencias independientes. Procedencia y prompts en `Prompts-Correcciones-v3.md`.

La base aprobada y los textos siguen siendo definitivos. Las cuatro correcciones esperan revisión visual del usuario. Continúan provisionales el cierre de prueba y la mezcla de música/efectos sintetizados. No se implementaron el claro final, cofre, carta, sonrisa final ni pantalla final. La verificación se limita al navegador de escritorio; no certifica Safari ni controles táctiles.

Antes de aprobar: observar ambas uniones al ir y volver, el tropiezo y la recuperación con el atuendo preferido, la postura durante el diálogo de las muletas, los tres flashes de Simón y la estabilidad de mejillas, pecas y gafas tras varios cambios y giros.

---

# Historial: tercera versión antes de las correcciones visuales

El registro siguiente documenta la entrega anterior; sus descripciones de la caída y de las franjas de unión quedan sustituidas por la revisión del 9 de septiembre.

Actualizado: 8 de septiembre de 2026. Fuente definitiva: `Documento-Maestro.md`, sin cambios. Las dos primeras entregas fueron probadas y aprobadas definitivamente por el usuario. La ampliación implementa únicamente escenas 7–11 y el cierre provisional anterior al claro final.

## Tercera entrega: comprobaciones realizadas

- Recorrido en Chrome de escritorio con los controles reales desde título y personalización hasta aula, sueño, tres libros, letrero, arroyo, estrella, caída, tercera flor y cierre 3/3. Primera pasada con exploradora/claro/mejillas hasta la caída; recorrido completo con cotidiana/medio/pecas.
- Se omitió a Simón hasta completar la tercera flor y alcanzar el cierre. Después, Seguir explorando permitió regresar al encuentro opcional, leer sus tres frases, ver la pose sentada, destellos de cámara y cambio de orientación hacia la flor. El contador siguió en 3/3 y el encuentro no se repite.
- Se leyeron las 30 líneas desde la interfaz y se contrastaron con el Maestro. La línea «Por suerte, esta vez no necesitó muletas.» aparece literalmente en voz del Narrador. La estrella solo usa luz y movimiento.
- La estrella aparece al cerrar el tercer libro, avanza y regresa durante el saludo, se desplaza suavemente por el sendero y atraviesa las raíces. Los círculos alegres se reservan para la recuperación, después del último comentario de Moonie.
- Caída y recuperación de cuatro cuadros cada una, sin daño, cambios de colisión ni pérdida de personalización. Pausa comprobada tanto con Moonie caída como al comenzar la recuperación: congela texto y animación y permite continuar.
- La tercera flor cambia 2/3 a 3/3. Se observaron apertura, formación de luna creciente con pétalos y retirada de las enredaderas. La salida de prueba queda antes del claro final. El aviso de la tercera flor se coloca abajo para dejar visible la apertura.
- Regreso por las raíces y hasta la unión del sendero, manteniendo 3/3, sin repetir la caída. Se revisaron las curvas, el ramal de Simón, las piedras seguras y el bloqueo del agua. Se corrigió una franja visible en la unión de los fondos mediante solapamiento de las últimas filas del nuevo fondo.
- Las 27 combinaciones se seleccionaron mediante los controles reales del navegador (27 etiquetas distintas). Auditoría raster del mismo renderizador: 1.728 cuadros no vacíos, distintos dentro de cada clip y limitados a 48 × 64, en las 27 combinaciones y cuatro direcciones. Hoja lateral de caída/recuperación revisada visualmente; idle, caminar e interactuar conservan su implementación anterior.
- Pausa con botón y Esc, cierre con botón y Esc, volúmenes de música y efectos ajustados con teclado, silencio reversible y entrada/salida de pantalla completa. `:fullscreen` confirmó ambos estados sin deformación del juego.
- Trece pruebas automáticas aprobadas, incluida alcanzabilidad, secuencia obligatoria, independencia de Simón, rechazo de incrementos repetidos, textos exactos, respuesta del Worker y contratos de interfaz. TypeScript y compilación de producción correctos.
- Ningún error ni advertencia de la aplicación en el navegador. Se excluyen los mensajes de la extensión externa de control identificados por URL `chrome-extension://`.

## Recursos y límites de esta entrega

Único recurso generado: `public/assets/hidden-path.png` (1182 × 1330), prolongación del fondo aprobado del sendero, con vegetación azul acogedora, camino legible, raíces y dos apartados laterales. `public/assets/simon.png` es una copia sin cambios de la hoja transparente de dos poses aprobada. El tercer libro y la estrella reutilizan las hojas existentes. Los seis recursos anteriores permanecen intactos, al igual que la configuración de publicación y el Documento Maestro.

Son definitivas las decisiones y los textos del Maestro y la base aprobada de las primeras dos versiones. El tramo nuevo y el acabado de sus animaciones quedan pendientes de aprobación. Continúan provisionales la pantalla de fin de prueba y la música/efectos sintetizados. Se comprobaron los controles sonoros; la verificación visual no certifica la mezcla auditiva. No se certifican Safari ni uso táctil/móvil. No se implementaron escenas 12–13, cofre, carta, sonrisa o pantalla final.

Antes de aprobar: jugar hasta 3/3, observar la caída y la estrella, visitar a Simón antes de tocar la flor y comprobar también la ruta sin visitarlo; escuchar la mezcla y revisar el aspecto del atuendo preferido.

---

# Historial: segunda versión jugable (aprobada)

Actualizado: 8 de septiembre de 2026. Fuente narrativa: `Documento-Maestro.md`, sin modificaciones. Alcance adicional autorizado: escenas 3–6 y cierre provisional al comienzo del sendero oculto.

## Segunda entrega: comprobaciones realizadas

- Compilación de producción y comprobación TypeScript correctas. Once pruebas automáticas aprobadas, incluidos el HTML del Worker y los contratos de la interfaz.
- Recorrido real con teclado desde el título hasta la primera flor, primer libro, letrero, segundo libro, arroyo, segunda flor y cierre provisional 2/3, en Chrome de escritorio mediante la previsualización interna.
- Los 18 textos del tramo fueron leídos desde la interfaz y contrastados con el Documento Maestro. No hay tercer libro, estrella guía, caída, Simón ni final narrativo.
- La portada corregida, personalización, recursos del primer claro, aula y poses sentadas se conservan. Solo se extiende la salida norte después de la primera flor. La cámara permanece fija durante el tutorial anterior a esa flor.
- Los libros están separados por una curva transitable y la escena del letrero. Solo se habilita la siguiente interacción aprobada; se puede retroceder si se pasa de largo. Los libros cerrados y abiertos reutilizan la referencia aprobada.
- El letrero conserva «Abre bien los hojos.» y el diálogo lo muestra a tamaño de lectura. Todos los textos nuevos tienen una comprobación automática de coincidencia literal con el Maestro.
- Cruce del arroyo por las piedras e intentos de salir lateralmente al agua: Moonie permanece en la superficie segura. Segunda flor: 1/3 → 2/3, apertura, reflejo en el agua, retirada del follaje y pétalos hacia el sendero oculto.
- El cierre provisional y Seguir explorando conservan las dos flores. El contador no aumenta por repetir una interacción completada.
- Se seleccionaron las 27 combinaciones mediante los controles reales del navegador. Se revisaron visualmente cotidiana/claro/mejillas, artista/medio/pecas y exploradora/oscuro/gafas, además de las direcciones del selector y del bosque.
- Auditoría raster del mismo renderizador: 864 cuadros (27 combinaciones × 4 direcciones × 8 cuadros), no vacíos, distintos dentro de cada clip y limitados a 48 × 64. Cuatro hojas revisadas visualmente. Se corrigió un corte del extremo de las manos durante la interacción.
- La auditoría adicional usa `tests/animation-audit.mjs` con el adaptador Canvas instalado en el entorno, sin añadir dependencias al juego. Una página auxiliar de revisión fue bloqueada por la política de URL del navegador; no se accedió a ella ni se sorteó el bloqueo. Las pruebas del juego se hicieron en su dirección interna autorizada.
- Pausa con Esc y botón; cierre con Esc y Continuar. Volúmenes ajustados por teclado, silencio reversible, entrada y salida de pantalla completa y pausa accesible en ella. El selector DOM `:fullscreen` confirmó el estado. El ámbito de lectura del navegador no refleja correctamente `document.fullscreenElement`.
- Ningún error ni advertencia de la aplicación registrado en el navegador. Los mensajes ajenos de la extensión de control, identificados por su URL `chrome-extension://`, se excluyen del diagnóstico del juego.
- Pruebas de alcanzabilidad desde el punto de aparición, bloqueo del sendero oculto hasta 2/3, piedras seguras, progreso secuencial y rechazo de incrementos duplicados.

## Qué sigue siendo provisional

Las decisiones del Maestro, los diálogos y la primera entrega aprobada son definitivos. La distribución jugable y el acabado de esta segunda entrega esperan la aprobación del usuario. La animación articula los sprites aprobados; sigue siendo provisional, al igual que la mezcla de piano/campanillas, el agua localizada y la pantalla de fin de prueba. No se han implementado caída, levantarse ni sonrisa final.

Se comprobaron los controles sonoros; la revisión visual no certifica la mezcla auditiva. No se certifican Safari ni el uso táctil/móvil. La publicación conserva el proyecto y su acceso privado actual.

## Recursos de esta entrega

Único fondo nuevo: `public/assets/sendero.png`, generado con la herramienta integrada de imágenes (1182 × 1330) y renderizado en 640 × 720. Brief: bosque pixel art azul nocturno y acogedor, sendero sinuoso conectado, dos tocones vacíos, letrero sin texto, arroyo con tres piedras grandes próximas, descanso en la orilla norte y salidas centrales; sin personajes, libros, flor lunar grande, luna en el cielo ni interfaz. Referencias: el claro aprobado y el concepto aprobado del sendero con arroyo. El texto del letrero, los libros y las flores se integran por separado.

`public/assets/books.png` es una copia de la hoja aprobada, no una generación nueva. Solo se utilizan los dos primeros libros. El atlas de Moonie, el fondo del claro, el aula y las poses sentadas originales permanecen sin cambios.

---

# Historial: primera versión jugable

Actualizado: 7 de septiembre de 2026. Alcance: sección 16 del Documento Maestro.

## Comprobaciones realizadas

- Compilación de producción y comprobación TypeScript del juego correctas.
- Ocho pruebas automáticas aprobadas: alcanzabilidad de la flor y la salida, bloqueo de la salida antes de la flor, colisiones, textos, respuesta HTML del Worker y contratos de los componentes de interfaz.
- Revisión visual e interacción en Chrome mediante la previsualización interna: título, personalización, aula, despertar, flor, pausa, pantalla completa y cierre de la prueba.
- Combinaciones revisadas: cotidiana/claro/mejillas, artista/medio/pecas, exploradora/oscuro/gafas; cambios de dirección en el selector y en el bosque.
- Recorrido desde el título hasta la primera flor usando controles visibles. E lejos de la flor no abre el diálogo; cerca permite interactuar. La flor se abre, el contador pasa de 0/3 a 1/3, y repetir E conserva 1/3.
- Recorrido por el sendero desbloqueado hasta el cierre de la prueba y regreso al claro con Seguir explorando.
- Pausa visible en pantalla completa; movimiento bloqueado mientras está abierta. Volúmenes ajustables con teclado, silencio reversible, pantalla completa sin deformar el escenario.
- Corregida la pérdida de pulsaciones más breves que un fotograma, la carrera de carga del atlas durante la recarga de desarrollo y la caducidad del aviso de flor despierta.
- Corrección visual posterior: retirada la frase “Un cuento para ti”; el subtítulo hereda su tratamiento tipográfico. Moonie se integra sentada detrás del pupitre, mirando al profesor, y permanece sentada cuando apoya la cabeza para dormirse. Las tres variantes de atuendo cuentan con ambas poses.

## Límites

No incluye aún a Simón, libros, otras dos flores, muletas, carta ni final de la historia. Se conservan en el Documento Maestro para las siguientes fases. Sprites animados y audio provisionales; la revisión visual no constituye una validación auditiva de la mezcla. No se ha certificado Safari ni uso táctil/móvil.

La revisión usa la previsualización interna. El estado de publicación se valida mediante Sites, sin abrir la dirección de producción desde el navegador de pruebas.
