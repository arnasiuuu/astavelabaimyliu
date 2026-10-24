# Style study: the "hero car showcase" poster

Notes from the two reference posters you sent (a Nissan Skyline R34 and a Maserati MC20 Cielo, both by jdx.design). These describe the *genre*; the posters here use our own branding, copy and photos, and copy no logos or artwork.

## Anatomy, top to bottom
1. **Small logo mark**, top centre, white.
2. **A giant background detail of the same car**, such as a wheel or a tail light, enlarged until it fills most of the sheet, softly blurred and tinted. The Maserati poster also uses a second, much larger, faded copy of the car itself.
3. **One dominant colour** taken from the paint (purple for the R34, green for the MC20), with a cooler or brighter complementary light (cyan, white, sun yellow).
4. **The wordmark:** a heavy, extended, italic white logotype with a hand-drawn swoosh loop running round it, plus a smaller line in the accent colour (model name) in a squared tech typeface.
5. **A glowing handwritten script** as a second title (neon tube look).
6. **Light effects:** lens flare, light streaks, sparkles or fireworks, glow on the rims, light leaks.
7. **The hero car:** a clean cut-out in a low three-quarter view in the lower middle, crisp against the soft background, with a ground shadow and sometimes a mirror reflection.
8. **Geometry:** a thin white rectangle partly behind the car, and a vertical colour bar with a white line.
9. **A diagonal road line** that leads the eye to the car.
10. **A spec block:** a small tech-font heading and two short paragraphs about the car.
11. **A footer:** a widely letter-spaced credit line, centred.
12. **Finish:** grain, a vignette, and the bottom fading dark so the text reads.

## How it is applied here
- **Photos:** only what each poster needs. The E46 poster uses the smoky three-quarter shot (hero cut-out) and the pit shot (giant background detail: the tricolour B-pillar). The E90 poster uses the green car shot for both its hero cut-out and its enlarged background, the way the MC20 poster repeats its car.
- **Accent colours:** the Lithuanian tricolour stands in for the reference's neon. Yellow, green and red light streaks, tied to the flag taped on every car's B-pillar.
- **Tools:**
  - cut-outs: the `background-removal` skill (rembg, ISNet model)
  - assets and grading: the `processing-images` skill's toolkit (Pillow, numpy, scipy)
  - layout: HTML/CSS for blend modes, glows and type, rendered headless at 2480×3508
