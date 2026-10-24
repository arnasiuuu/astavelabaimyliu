# LIK Drift collage posters: design plan

**Subject:** a university drift team (LIK Drift, Lietuvos inžinerijos kolegija) on an autumn practice day: E46 and E90 BMWs, tyre smoke, birch-gold scrub, cracked tarmac with donut marks, a Lithuanian tricolour taped on each B-pillar.
**Audience:** the team, its sponsors and the drift crowd, plus people scrolling past on Instagram.
**Job:** show off the photography. Several frames per sheet, so the poster feels like the whole day, not a single shot.

## Theme: "Rudens asfaltas" (a custom theme, made with theme-factory's create-your-own option)

Colours are sampled from the photos, not chosen in the abstract.

| Token | Hex | Where it comes from |
|---|---|---|
| Tarmac | `#34352F` | worn asphalt in the shade |
| Haze | `#DCDDD5` | smoke and overcast sky |
| Birch | `#D9A93A` | autumn scrub behind the track |
| Pine | `#29402F` | treeline |
| Tail-light | `#C8352B` | E90 lamps, flag red |
| Sky | `#A7B6BA` | cold haze blue at the horizon |

**Type:** Boldonse for display (heavy, a little wide; full Lithuanian coverage), Instrument Sans for everything else, always in sentence case. No monospace, no tracked caps labels, no middle-dot strings.

## Layouts

**A: Šonu (sideways).** A vertical gradient (haze → birch → tarmac) runs top to bottom like the photos themselves: sky, scrub, asphalt. Four photos are cut into parallelogram slices skewed to a drift angle and stacked down the sheet, with the gradient showing in the gaps. The Slip Angle texture is printed in haze over the gradient only.
```
+---------------------------+
| ŠONU                      |  display, left aligned, tarmac
|   /////////////////////   |  slice 1
|  /////////////////////    |  slice 2  (gaps = gradient + texture)
| /////////////////////     |  slice 3
|/////////////////////      |  slice 4
| LIK Drift        caption  |
+---------------------------+
```

**B: Spurgos (donuts).** A full-bleed tarmac ground in a pine-to-tarmac gradient, covered in the Slip Angle texture. Photos sit in circles whose centres and sizes come from the texture's own hidden pivots, so every photo sits inside the tyre marks circling it. One large circle, two or three smaller.
```
+---------------------------+
|        ( big E46 )        |  circles = pivots of the texture
|  (pit)        ~~~~        |
|      ~~~~~   (green)     |
| SPURGOS                   |
| LIK Drift        caption  |
+---------------------------+
```

**C: Trispalvė (tricolour).** An asymmetric mosaic of all six frames with gutters wide enough to carry colour. The gutters are filled with one continuous yellow → green → red gradient running from top to bottom, so the flag reads only across the whole sheet, never as a block. Fine grain and a soft halftone over the photos.
```
+---------------------------+
| [   hero    ][  2  ]      |
| [           ][  3  ]      |  gutters = tricolour gradient
| [ 4 ][   5      ][ 6 ]    |
| LIK                       |
| Drift            caption  |
+---------------------------+
```

**Alignment:** left aligned throughout; text sits in its own space and never on a busy part of a photo.

## Principles
- Each poster spends its boldness on one thing: A on the slices, B on the circles-on-pivots, C on the gradient gutters. Everything else stays quiet.
- Gradients are drawn from the scene (sky → scrub → asphalt; the flag), not used as decorative washes.
- Texture means something: the tyre-mark field, film grain, halftone. No generic noise overlays.
- Copy is short, in Lithuanian, sentence case.

## Review against the generic defaults
- First draft had near-black grounds with mono labels, middle-dot meta lines and "WORD — fragment" labels, which is the same chrome as the first series and on the generic list. **Changed:** tarmac `#34352F` instead of near-black, Instrument Sans in sentence case instead of mono caps, no middle dots or em-dash labels.
- First draft gave C equal-sized rounded tiles. **Changed:** asymmetric spans, square corners only, and the gradient lives in the gutters so the grid itself carries the idea.
- I considered "01 / 02 / 03" frame numbers. **Dropped:** the frames aren't a sequence.
