# Procedencia de los recursos de la corrección visual

Generación mediante la herramienta integrada de imágenes. Integración: `public/assets/clearing-edge.png`, `hidden-edge.png`, `fall-poses-real.png` (primera hoja, únicamente fila cotidiana) y `fall-poses-themed.png` (hoja reparada, únicamente filas artista y exploradora). Los originales aprobados permanecen intactos. El intento posterior de compactar poses se descartó por mezclar prendas entre atuendos. Los dos lápices azul/rosado se componen como detalle modular a escala de juego. No se usan las variantes descartadas.

# Moonie correction image-generation prompts

All calls used built-in imagegen. Three planned requests plus one parent-approved objective outfit repair.

## Pose atlas initial

Use case: stylized-concept. Asset type: production transparent 2D game sprite atlas for Tales of Moonie.
Input image 1: approved standing character identity and exact three outfits. Input image 2: supporting pose/style and proportions reference. Generate a NEW atlas of the SAME character, not edits to these sheets.
Canvas: 1536x1024, true transparent RGBA background, precisely SIX evenly spaced columns and THREE evenly spaced rows, 18 full body sprites total, NO grid lines labels text or background. Each cell is 256w x 341h. Cells have common ground anchor at cell-relative x128 y316. Intended downsample target per cell 48x64.
Style: match reference pixel-edged chibi illustration, large head same head/body proportions, warm light skin, black short bob hair with midnight-blue highlights, large black eyes with white gleams. Every pose faces right in three-quarter view toward the viewer, face visible. Head physical size must stay exactly equal across all 18 cells, ~150 pixels wide. Lower poses remain LOWER silhouettes within the cell, NEVER scaled up to fill cell. Consistent thin dark contour and detailed garments.
Column sequence MUST have six clearly distinct hand-drawn silhouettes in EVERY row:
1. Stumbling: bent knee, torso pitched forward, both arms reaching forward, worried neutral mouth.
2. Losing balance: low crouch, both hands going down to support the body, knees deeply bent, head lowered.
3. Softly fallen: lying sideways with legs extending left, torso near ground supported by forearms, head at RIGHT, face visible, worried mouth. Body near baseline, head remains SAME SIZE; low pose has empty space above.
4. Starting to rise: torso beginning to push upward with both hands planted, hips still low, knees folded under, head higher than column3.
5. Kneeling: torso upright on one knee, ONE foot planted ahead, one hand on thigh, preparing to stand.
6. Almost standing: knees partly straightened, torso near upright, arms relaxed slightly forward, NOT triumphant, no smile finale.
Row1 REAL outfit: blue baseball cap with white edges; black thin-strap blouse; denim shorts; white tennis shoes; silver hoop earrings and necklace with moon/star/heart charms. NO BOOK.
Row2 ARTIST outfit: cream short-sleeve shirt, lilac SHORT overalls with paint spots, exactly TWO pocket pencils blue and pink, white shoes lilac detail, silver hoops. No cap.
Row3 EXPLORER outfit: detailed white frock with blue belt and scalloped hem, short midnight-blue cape with light-blue edge, hood DOWN, silver crescent and TWO stars on cape, brown boots. No cap.
No damage, no blood, no pain effects. No leaves roots books props ground shadows motion marks or Z letters. Actual transparent background, no baked checkerboard. Don't duplicate the same upright pose; especially column3 must be horizontal fallen, columns4/5 rising distinctly. Keep each sprite safely within its cell with transparent gutters.

## Clearing seam

Use case: precise-object-edit. Asset type: localized seam repair strip for 2D pixel-art forest game.
Image1 is the EDIT TARGET, 1280x400 pixels: two existing approved maps stacked with bad straight horizontal join exactly y200. Keep the same 1280x400 crop, viewpoint, scale, path center and composition. This is a LOCALIZED repair of ONLY the join, not a new full scene.
Primary request: remove the straight horizontal seam by redrawing a narrow organic area around y200, connecting the existing blue leafy canopies, tree trunks and path naturally. Preserve the top60 pixels and bottom60 pixels as close to pixel-identical as possible. Everywhere outside the join preserve existing scene geometry, texture, palette and scale. Transition using naturally jagged individual leaf silhouettes and connected trunks, NOT horizontal bands, mirrored bands, blurred fades, fog or smoothing. The result must look like a single uninterrupted forest illustration.
The clear WALK PATH remains near x650 (world325), width about120pixels (world60), going vertically through the strip, with no trees, bushes, or large obstacles on its center. Maintain dark midnight-blue/royal-blue foliage, teal edges, brown path, detailed crisp pixel illustration.
Critical invariant: keep the EXISTING crescent moon at lower left in exactly the current position with its current size and surrounding light, neither remove it nor duplicate it. NO NEW MOON, no extra sky windows, no added props or characters. No text, frame, labels. Output only this same narrow landscape strip, never a full map.

## Hidden path seam

Use case: precise-object-edit. Asset type: localized seam repair strip for 2D pixel-art forest game.
Image1 is the EDIT TARGET: two approved forest maps stacked at the bad straight join halfway down. Keep the same narrow panoramic crop 1280x400, camera, scale and composition. Repair ONLY the join, not a new map. Fill the entire canvas edge-to-edge; absolutely no black bars, borders or letterboxing.
Primary request: remove the straight horizontal seam around y200 by connecting existing blue canopies, trunks and path with natural jagged leaf silhouettes. Preserve the top60pixels and bottom60pixels as near pixel-identical as possible; preserve all scene geometry outside the narrow join. Organic tree foliage silhouettes and connected trunks, never horizontal bands, mirrored bands, blurry fades, fog or smoothing.
The clear walkpath continues near x650 (world325) and about112pixels (world56) wide. No trunks trees rocks or bushes on center of walkpath. Keep original midnight-blue/royal-blue leaves, dark forest gaps, teal highlights, brown path, flowers and hanging glows with precise existing scale and detailed crisp pixel illustration.
NO MOON of any kind. No added moon sky window or focal element. No new props characters text or labels. Output ONLY this exact same narrow landscape strip, no expanded scene, edge-to-edge image content.

## Targeted pose repair

Use case: precise-object-edit. Image1 EDIT TARGET 18-pose atlas; Image2 STYLE reference approved character atlas.
Targeted repair ONLY. Keep Image1's canvas, six columns three rows, exact current poses silhouettes head sizes placement ground anchors and facial expressions. Do not regenerate the layouts.
1. Remove ALL earrings from ARTIST row2 and EXPLORER row3: no jewelry at their ears, just normal uncovered skin or hair. REAL row1 keeps silver hoop earrings.
2. ARTIST row2: exactly TWO pencils in overall bib pocket, one BLUE and one PINK. Delete third/red pencil anywhere present. No more than2 pencils, no red pencil.
3. Make rendering crisp true pixel-art matching Image2's discrete pixel-stepped dark outline and pixel-cluster shading; no soft smooth illustrated curves or airbrush. Preserve current largehead/body proportions, hair and outfit colors.
Keep row1 bluecap blackthinstrapblouse denimshorts whiteshoes; row2 creamshirt lilacSHORT-overalls paintspots; row3 whitefrock bluebelt/scallophem shortmidnightcape lightblueedge hoodDOWN silvercrescent and TWO stars brownboots. No added props no damage no smile finale.
All 18 silhouettes fixed; fallen columns3 remain low and horizontal, heads same scale not enlarged. Preserve exact current horizontal baseline per row.
Output genuine transparent RGBA background, not checkerboard pixels. No ground shadows no text no borders no panels no annotations.

