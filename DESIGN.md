# NOIR / Light reveals the difference

## Direction
Own automotive atelier concept, rebuilt after user rejected the earlier generic editorial landing. Persuade mode. See CONCEPT.md for reference synthesis. No reference code or assets were copied.

## User commitment
One solid graphite background across the entire page: #101211. Sections remain transparent, without alternating panels or decorative gradients. Photographic light falloff is confined to the inspection interaction. The hero uses lighten compositing to merge its photographic blacks into graphite.

## Tokens
- Background #101211; foreground #eeeee8; secondary #a5aaa5; dividers #343a34; action and inspection signal #dfed9b.
- Oswald 400 for uppercase display typography; Manrope 400–800 for reading and interface. Both hosted locally.
- Display 34–106px, reading text 12–14px, metadata 11px. Hero and wordmark receive dedicated responsive scaling.
- Gutters 5.5% desktop / 6% mobile. Major section rhythm 125–130px desktop / 75–85px mobile.
- Flat rectangular action surfaces and thin lines. Rounded shape reserved for footer return-to-top control and status dot.

## Signature interaction
A custom Canvas 2D inspection lamp moves over a generated macro paint photo. Seeded arcs simulate wash swirls inside the lamp exposure. Before/after buttons interpolate the defect amount while preserving light position. A native range input supplies touch and keyboard control. Labels identify the simulation and update the selected state with aria-pressed and aria-live.

## Motion
Ease cubic-bezier(.16,1,.3,1). Masked hero lines, photographic lateral reveals, progressive sentence illumination, service-image changes, a scroll-driven process line and restrained photo parallax. Passive scroll listeners schedule requestAnimationFrame; canvas stops scheduling once its interpolation settles. Reduced motion snaps inspection state and disables spatial transitions.

## Honesty and accessibility
Generated studio imagery and simulated defects are disclosed; no fake portfolio, testimonials or metrics. Prices, timing and address are demonstrative. Contacts remain unconfigured. Native service details, range and dialog support keyboard interaction. Menu supports Escape, focus containment and inert page content.
