# Revisión de jugabilidad — septiembre de 2026

## Alcance autorizado

Esta revisión aplica la petición posterior al final completo. No sustituye el Documento Maestro ni modifica su narrativa. Añade únicamente interfaz de objetivos, tres micro-retos y un laberinto entre el letrero y el segundo libro, además de las seis correcciones de presentación solicitadas.

- Simón: nuevo recurso de dos poses basado en su diseño anterior; eliminación de fondo verde antes de recortar, extracción a celdas de 40 × 40 y dibujo sin interpolación.
- Flores: aviso exacto en la esquina superior derecha, compacto, con entrada y salida ligadas al reloj del juego, que se congela durante la pausa.
- Letrero: texto crema de alto contraste en dos líneas, conservando «hojos».
- Eliminada la ruta de puntos amarillos posterior al segundo libro. Se conservan las luciérnagas narrativas y los pétalos aprobados.
- Libros: las tres ilustraciones se extraen y decodifican antes de habilitar el juego; el contenedor tiene dimensiones reservadas.
- Carta: papel precargado y decodificado; papel, dibujos y texto permanecen montados dentro del mismo contenedor y aparecen con un único fundido.

## Retos e interfaz

El objetivo se deriva del estado actual, no de una lista de mensajes temporizados. Las indicaciones E usan la misma consulta de proximidad que las interacciones. Después de doce segundos sin acercarse al destino aumenta su resplandor o aparece una señal discreta en el borde. No se contabiliza el tiempo en pausa o en un diálogo.

1. Tres luces únicas dentro del claro. E las recoge; siguen a Moonie y desbloquean la primera flor cuando están las tres. No se pueden perder ni recoger dos veces.
2. Luciérnagas muestran las tres piedras, de la orilla cercana a la lejana. El cruce se habilita después de observar. Salir de la zona segura devuelve suavemente a la orilla y repite la demostración. E permite repetirla voluntariamente.
3. Tres plantas identificadas por posición y número. La estrella muestra 2 → 1 → 3; E repite el patrón. Un error vuelve a mostrarlo sin daño. Simón no interviene en este requisito.

El laberinto inserta 720 píxeles verticales —dos alturas de pantalla— entre el letrero y el segundo libro. Tiene tres bifurcaciones: dos desvíos cortos y una alternativa que vuelve a unirse. La ruta directa suma aproximadamente 1.320 píxeles de desplazamiento; la duración depende de las decisiones y de los desvíos. Después de 22 segundos las flores de orientación pulsan más claramente. El segundo libro no se ve desde el letrero. Las coordenadas narrativas anteriores se conservan mediante una conversión de coordenadas en el nuevo tramo.

## Recursos nuevos

- `public/assets/story-maze.png`: bosque generado usando el Sendero de historias aprobado como referencia. Sus recorridos reales se trazaron para las colisiones. Las uniones usan máscaras irregulares y una extensión limitada de la entrada; no se sustituyen los escenarios anteriores.
- `public/assets/simon-crisp.png`: hoja de dos poses generada desde el diseño aprobado, sin accesorios; fondo verde eliminado en la extracción.

## Verificación

- Compilación de producción, comprobación de TypeScript y 21 pruebas automatizadas correctas, repetidas después del ajuste final de las uniones.
- Auditoría de 1.620 cuadros: 27 combinaciones × cuatro direcciones, cuadros no vacíos de 48 × 64. Tres ciclos con igualdad RGBA, caché fría y transformaciones contaminadas.
- Auditoría de las 54 variantes de poses finales —carta y sonrisa— en tres ciclos deterministas.
- Recorrido en navegador con Simón completo: título, aula, luces, flor 1, libros 1 y 2, letrero, todas las ramas del laberinto, error y recuperación del arroyo, flor 2, libro 3, estrella, caída, muletas, Simón, patrón correcto e incorrecto, flor 3, cofre, carta y pantalla final.
- Reinicio con E y nueva revisión de las 108 vistas de personalización.
- Segunda partida completa sin visitar a Simón: las tres flores, el patrón y el cofre no dependen del encuentro opcional. Carta íntegra comprobada de nuevo con Exploradora lunar.
- Pausa durante observación del patrón y del arroyo; reanudación y controles de volumen, efectos, silencio y pantalla completa. Los avisos y ayudas comparten el reloj pausado del juego.
- La consola de la aplicación no presentó errores. Las entradas de la extensión del navegador de pruebas se distinguieron de los registros de la aplicación.

La aprobación definitiva de esta revisión corresponde al usuario tras probarla. Se recomienda valorar personalmente la claridad de los objetivos, la dificultad de los retos, la separación entre libros y la nueva nitidez de Simón.
