# Recursos de la revisión de jugabilidad

Las imágenes se generaron tomando recursos aprobados como referencias. Solo se integraron los dos recursos necesarios. Las colisiones del laberinto se trazaron sobre la imagen resultante, en vez de asumir que la generación obedecía exactamente las coordenadas solicitadas.

## Laberinto

Resultado histórico: `public/assets/story-maze.png`. Retirado el 20/09/2026 al integrar el rediseño aprobado de la sección 20; se conserva este prompt únicamente como registro.

```text
Use case: style-transfer.
Asset type: top-down cozy pixel-art RPG forest maze background, portrait canvas with 640x720 logical pixel coordinates (width x height), no frame.
Input image 1 is only the visual STYLE reference: retain its dense midnight blue foliage, cobalt canopies, cyan shadow highlights, dusty brown dirt paths, tree scale and cozy storybook RPG mood. Replace its entire geography with the maze specified below. No water, stepping-stones, moon, books, characters, animals, signs, text, UI or buildings.
Primary request: an overhead navigable forest maze with visible connected dirt paths precisely following this layout. Coordinate origin is upper-left on the 640x720 logical canvas; paths are 54 logical pixels wide, corners gently softened. Exact main route centerline from bottom to top: (365,720) to (365,630) to (180,630) to (180,450) to (450,450) to (450,260) to (240,260) to (240,100) to (377,100) to (377,0). Exactly two short dead-end branches: from (365,630) east to (460,630), and from (450,450) east to (530,450). One alternative route creates a loop near top left: from (240,260) west to (145,260), north to (145,100), east to (240,100). Keep these connecting junctions fully open and readable. Fill all space outside the dirt paths with dense blue forest trees, shrubs, grass and subtle tiny flowers matching the reference. Foliage must not obscure walkable routes. The only two exits through the outer frame are at bottom x365 and top x377. Maintain top-down orthographic RPG map perspective, same tree size as reference, crisp pixel clusters and consistent pixel-art texture. No other paths or clearings, no labels or numbers.
```

## Simón

Resultado: `public/assets/simon-crisp.png`. Se elimina el fondo verde antes de extraer las dos poses y reducirlas sin interpolación.

```text
Use case: identity-preserve.
Asset type: two-pose coarse pixel-art game sprite sheet.
Input image 1 is the identity reference and edit target: preserve the exact same Simon dog design in both poses, including cream fluffy chest, cream curled tail, caramel face and ears, copper back, cheerful dark black eyes and nose, visible small pink tongue, no accessories. Left pose standing on four legs, right pose sitting with head tilted affectionately. Preserve this character's body shapes and color markings; simplify to genuine low-resolution pixel art.
Primary request: make an extremely coarse 80x40 logical pixel sprite sheet containing exactly two equal 40x40 logical-pixel cells side by side, each full-body dog centered in its cell and feet on the same baseline. Integer nearest-neighbor upscale the entire sheet to 1600x800 output. Every logical pixel must become one solid uniform 20x20 square block; hard pixel-cluster stair steps everywhere. Design each dog with only about 30x32 logical pixels so there is clean background padding on all sides. Use a limited palette of about 12 flat opaque subject colors. Use black/dark brown pixel contours. No antialiasing, no smoothing, no fading at all, no partial opacity, no gradients, no fine fur strokes, no texture, no soft shadows. Background must be a completely uniform solid pure vivid green RGB(0,255,0), #00FF00, for chroma key removal. This green must be absent from the dogs. Absolutely no checkerboard, no black background, no ground shadow, no text, borders, cell lines or labels.
```
