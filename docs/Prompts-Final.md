# Tales of Moonie finale assets: prompts and provenance

Generated using the built-in imagegen tool. Four original requests plus one explicitly authorized targeted atlas repair. No CLI/API fallback, no Python image editing, no Site checkout edits.

## Outputs

| Asset | Local path | Dimensions / mode | Status |
|---|---|---|---|
| Final clearing | /workspace/scratch/47fd9549d444/generated_images/exec-10de608e-5fc0-4a59-982f-8c861cf0734a.png | 1672 x 941 RGB | Selected for integration; pending user review |
| Original finale atlas | /workspace/scratch/47fd9549d444/generated_images/exec-d04b16fe-61fe-4d13-8601-1cb158c349a1.png | 1254 x 1254 RGB, chroma green | Superseded by repair |
| Letter paper | /workspace/scratch/47fd9549d444/generated_images/exec-586c49cd-3f5d-47eb-aba5-5e0a9d429708.png | 1122 x 1402 RGBA | Selected for integration; pending user review |
| Moon backdrop | /workspace/scratch/47fd9549d444/generated_images/exec-26b481d7-f256-4cfb-8684-d166162fd09f.png | 1672 x 941 RGB | Selected for integration; pending user review |
| Repaired finale atlas | /workspace/scratch/47fd9549d444/generated_images/exec-1537c6c6-6d2f-4783-85aa-8f3636cd60cc.png | 1254 x 1254 RGB, chroma green | One targeted repair performed |

## Reference images

- Clearing edit target: /workspace/scratch/47fd9549d444/generated_images/exec-969a6ae4-6cac-4bbb-a5fc-f221cdfaf631.png
- Clearing supporting palette/path reference: /workspace/sites/tales-of-moonie/public/assets/hidden-path.png
- Original atlas identity reference: /workspace/sites/tales-of-moonie/public/assets/atlas.png
- Original atlas concept reference: /workspace/scratch/47fd9549d444/generated_images/exec-fc367bbe-815f-4142-861c-889a9cbf31fd.png
- Repair edit target: original finale atlas listed above.

## Inspection

- Clearing: central character, chest, golden star and trail removed. Circular forest, crescent moon, narrow bottom entrance preserved.
- Original atlas had unwanted earrings in columns 2/3, smiles in neutral row, and missing letters in row 2. The original prompt wrongly said no letter for row 2; repaired as authorized.
- Repaired atlas: six cream letters are held with both hands; top-row neutral mouths and bottom-row smiles are clearly different; earrings removed from columns 2/3 and retained in column 1; clothes and pencils preserved. Upward gaze/head raise remains subtle rather than strongly distinguishable.
- Letter: blank center and RGBA output; floral vines extend farther up left edge than the lower-corner brief.
- Moon: full centered detailed moon, clean sky, no extra scene objects; moon diameter closer to 85% of image height than requested 70%.

## Clearing original prompt

Use case: precise-object-edit. Asset type: Tales of Moonie final clearing game background. Input image 1 is the edit target; image 2 is only a tree-scale and path-edge style reference. Edit image 1: remove ONLY the central character, treasure chest, and little golden five-point star plus its nearby golden trail. Fill their places naturally with the existing luminous blue-green clearing grass. Preserve the circular lunar forest composition, crescent moon at upper center, large intricate cobalt-blue trees, hanging vines, flowers, mushrooms, rocks, peripheral fireflies, moonlight and crisp cozy detailed pixel-art texture. Preserve the narrow open dirt entrance at bottom center; its dirt and foliage should connect naturally to the TOP CENTER edge of image 2, with same tree scale and palette. Keep the bottom entrance unobstructed and narrow. Landscape 16:9. No new objects, no characters, no chest, no star guide, no text, no watermark. Keep all other scene details unchanged.

## Original finale atlas prompt (superseded)

Use case: identity-preserve. Asset type: Tales of Moonie finale sprite pose atlas. Images 1 and 2 are character identity and outfit references, NOT the desired atlas layout. Create exactly SIX full-body clean nearest-neighbor pixel-art chibi sprites arranged in THREE equal columns by TWO equal rows. Equal generous padding in each cell; consistent head/body scale and foot baseline in every cell. Every character faces front, without body rotation or deformation. Row 1: Moonie holds a small blank cream letter against chest with both hands, gentle neutral expression, eyes looking slightly up. Row 2: same upright standing full-body pose, arms relaxed at sides, no letter, soft smile, eyes looking upward toward the moon. All have warm light skin, pink cheeks, big dark-blue eyes, short fluffy black hair with midnight-blue highlights; same identity as references. Column 1 BOTH rows: black spaghetti-strap blouse, blue denim shorts, white sneakers, blue cap with white edging, small silver hoop earrings, small silver star/crescent/heart charm necklace (NO book charm). Column 2 BOTH rows: cream shirt, muted lilac short overalls with paint dots and exactly TWO pocket pencils, one blue and one pink; white/lilac sneakers; NO jewelry, NO cap, NO cape. Column 3 BOTH rows: detailed white dress with pale blue scalloped hem and tiny stars, short midnight-blue cape with one silver crescent and TWO stars, brown boots; NO hat, NO jewelry. Do not copy the book charm or extra pencils from the reference. No glasses, no freckles, no extra accessories. Sprite texture must be crisp low-resolution pixel clusters, clean dark outline, designed to read at ultimately 48x64 per cell. Use a genuinely transparent background and preserve alpha. If true transparency is unavailable, use only solid chroma green #00FF00 behind everything, never checkerboard. No labels, grid lines, text, watermark or ground shadows. Output atlas 3 columns x 2 rows in near square overall proportions.

## Letter paper prompt

Use case: illustration-story. Asset type: Tales of Moonie letter illustration BACKGROUND ONLY, for exact HTML text added later. Create a single portrait 4:5 handmade storybook paper sheet, warm cream with very pale blue subtle watercolor undertones, softly irregular natural paper edges. Delicate asymmetric organic ink-and-watercolor lunar flowers drawn at the lower corners, a small crescent at upper left, a few small stars on the right. Cozy, detailed but restrained, elegant hand-drawn soft ink and watercolor. Keep a LARGE clean blank central area approximately 65 percent of total width and 75 percent of total height for legible text overlay. Motifs stay near the edges. Genuine transparent background outside the paper if possible. NO TEXT, no writing marks, no fake script, no hearts, no envelopes, no pens, no ribbons, no added objects, no watermark. This is only illustrated paper, not a finished letter.

## Moon backdrop prompt

Use case: stylized-concept. Asset type: Tales of Moonie finale moon backdrop. A clean deep midnight-blue night sky with ONE VERY LARGE FULL MOON centered precisely in the image. Landscape 16:9. Moon diameter approximately 70 percent of total image HEIGHT: dominant, bright silvery blue, clearly visible intricate lunar craters and pixel-textured terrain, fully round. Broad luminous silver-blue halo around moon, subtle blue aura fading into dark navy. Crisp detailed cozy pixel art consistent with a richly illustrated lunar-forest adventure game: sharp pixel clusters, deliberate pixel edges, not photorealistic. Pure clean sky, only very few tiny sparing stars, calm uncluttered composition. NO forest, ground, horizon, mountains, clouds, characters, star-guide character, planets, words, title, text, logos or watermark. Moon must remain full and centered, not crescent.

## Authorized targeted atlas repair prompt

Use case: precise-object-edit. Input image 1 is the edit target: an existing 3-column by 2-row Moonie finale character atlas. Make ONLY these targeted corrections, preserving the existing layout, outfit colors/details, exact head and body scale, pixel-art style, and solid chroma green background with clear equal cell margins. EVERY ONE OF ALL SIX SPRITES, in BOTH rows, MUST hold the SAME small cream letter against the chest with BOTH hands, as the top row already does. Therefore replace the bottom-row relaxed arms with precisely the letter-holding arm pose from the top row; keep legs and body pose unchanged. TOP ROW: neutral tiny horizontal mouth, calm gentle expression. BOTTOM ROW: a distinctly soft happy smile, chin/head slightly raised and eyes clearly gazing upward toward the moon, without rotating body or changing head size. Remove ONLY the silver hoop earrings from columns TWO and THREE in BOTH rows (artist overalls and explorer cape outfit). Those four sprites must have bare ears, no earrings or jewelry. KEEP silver hoops and star/crescent/heart necklace on column ONE, the blue-cap black-blouse outfit, in BOTH rows. Preserve all clothing, shoes, two blue/pink pencils, paint dots, cape crescent and two stars, dress scalloped hem, hair, warm light skin and pink cheeks. Keep all six full bodies visible, consistent scale and equal padding. No added objects besides the required bottom-row letters. No labels, text, grids, shadows, watermark, checkerboard, glasses or freckles. Maintain solid #00FF00 green behind and between the sprites.


