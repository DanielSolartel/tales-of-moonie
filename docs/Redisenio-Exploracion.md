# Rediseño de exploración y cinemáticas

La sección 20 del Documento Maestro contiene íntegramente las decisiones posteriores aprobadas. Los guiones narrativos, la carta y su fecha, los atuendos, Simón y el final no se han sustituido.

## Integración

- Se retiró el laberinto provisional `story-maze.png`, su renderizado, sus colisiones y los estados anteriores de los tres retos.
- La ampliación sur del claro añade raíces, flores altas y un reflejo en agua. Cada escondite libera un espíritu creciente con tres cuadros de cola y flotación, seguido de una órbita escalonada. El ritual consume las tres luces una sola vez.
- El laberinto ocupa 640 × 1080 coordenadas lógicas: tres pantallas, seis uniones del trazado, tres desvíos y dos conexiones internas. Las colisiones se trazaron sobre el recurso definitivo. Un retoque local de sotobosque elimina un corredor pintado que no pertenecía al trazado; no se aplica el resto de esa imagen de edición.
- El arroyo tiene nueve piedras y tres secuencias preparadas de cinco saltos. La secuencia se elige al reiniciar la partida y permanece fija al fallar. Tras resolverlo se puede volver por las piedras mediante saltos, sin caminar sobre el agua.
- La constelación utiliza tres plantas de 80 × 88, con estados cerrado, iluminado y abierto, y rondas de tres y cinco pasos. Un error disuelve los segmentos de la ronda actual y no elimina la ronda anterior.
- Los planos de revelación, ritual, demostración y error duran entre tres y cinco segundos; los reintentos se abrevian. La cámara usa encuadres con escala entera y un breve fundido azul entre escalas. Las poses de agacharse, tocar el agua, equilibrarse y saltar son recursos dedicados de 48 × 64.
- Se conserva la profundidad de los libros, flores, cofre, Simón y nuevas plantas delante o detrás de Moonie. Al mover después de usar los controles de sonido o pantalla completa, el teclado vuelve al juego.
- Las letras del letrero pasan de 10 a 7 píxeles lógicos, manteniendo su contraste y el texto exacto «Abre bien los hojos».

## Recursos incorporados

| Recurso | Uso |
| --- | --- |
| spirit-grove.png | Ampliación del primer claro |
| grove-bridge.png | Unión localizada con el claro aprobado |
| moon-maze.png | Nuevo trazado del laberinto |
| maze-understory.png | Solo el retoque local del corredor sobrante |
| river-trial.png | Arroyo con nueve piedras |
| constellation-grove.png | Espacio para las plantas grandes |
| crescent-spirits.png | Tres variantes y tres cuadros de espíritu |
| lunar-plants.png | Tres plantas y tres estados |
| interaction-poses.png | Cuatro poses por atuendo, personalización modular |

Los prompts y referencias principales están en `Prompts-Redisenio.json`. La unión del claro conserva los fondos adyacentes y añade un paso de tierra rodeado de sotobosque; la edición del laberinto rellena únicamente el corredor central sobrante con vegetación coherente. Los recursos aprobados anteriores siguen siendo las referencias de color, escala y textura.

## Verificación completada — 21/09/2026

- Compilación de producción correcta y 29/29 pruebas automatizadas aprobadas. Las advertencias de compilación corresponden al proxy del entorno y a la clasificación estática de rutas de Vinext; no son errores de la aplicación.
- Dos partidas completas en navegador desde título hasta FIN: exploradora/medio/gafas con visita a Simón; artista/oscuro/pecas sin visitarlo. Ambas llegaron a la carta y al final sin bloqueos. La tecla E regresó al título y restableció la posición inicial y el progreso.
- Personalización: 27 combinaciones y cuatro direcciones revisadas en la interfaz durante la revisión; auditoría de 1620 cuadros de idle, caminar, interactuar, caer y levantarse, dentro de 48 × 64. Tres ciclos, cachés frías y transformaciones previas contaminadas producen RGBA idéntico. Las 108 variantes de las cuatro poses nuevas también mantienen resultados idénticos en tres ciclos.
- Espíritus: los tres escondites, revelaciones y ritual comprobados en navegador con dos atuendos. Los umbrales de ayuda de 25/50 segundos, su reinicio y congelación se verifican automáticamente; se comprobó visualmente el resplandor de ayuda en el claro.
- Laberinto: recorridos de ida y vuelta, ambos bucles y los tres rincones visitados. Comprobación visual durante los tres niveles de ayuda; la última se observó después de 105 segundos. La salida revela el segundo libro sin mostrarlo desde el letrero.
- Arroyo: las tres secuencias de cinco piedras y los errores desde piedras interiores pasan las pruebas del sistema real de saltos. En navegador se probaron rutas izquierda y derecha a lo largo de la revisión, errores al empezar y desde el centro, regreso animado, repetición de la secuencia y recorrido de vuelta después de resolverlo. La ruta central también se verificó automáticamente.
- Constelación: errores intencionales en ambas rondas, repetición de la ronda actual, conservación de la primera ronda y finalización de los cinco pasos. La tercera flor permanece bloqueada hasta resolver el patrón.
- Conservación visual: libros y carta sincronizados, letrero reducido legible, Simón nítido, caída con poses específicas y diálogo literal de las muletas, tres flores y notificaciones compactas, barreras sincronizadas, cofre, carta y final aprobados.
- Pausa probada en revelación, error del arroyo, demostración de constelación y laberinto. Capturas consecutivas con el menú ya estabilizado confirman que el fotograma queda congelado. Sonido/silencio, volúmenes y pantalla completa comprobados por sus controles.
- Consola: sin errores ni advertencias de la aplicación en el recorrido completo. El navegador de pruebas emite mensajes de su propia extensión, ajenos al juego.
- `.openai/hosting.json`, guiones narrativos y recursos aprobados fuera de las ampliaciones permanecen conservados. No se publica un cierre provisional.

La imagen `Redisenio-Verificado.jpg` registra la constelación resuelta en la partida que omite a Simón. Falta únicamente la valoración personal de la jugadora sobre el acabado y la dificultad; no se presenta esa valoración subjetiva como validación automatizada.
